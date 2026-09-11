import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ROUTES from "../constants/routes";
import { speakGlobalText } from "../utils/speechHelper";
import { lessonModuleService, aiService, speechService } from "../services/appServices";
import { recordLessonCompleted } from "../utils/progressTracker";

// Helper to safely parse objectives and skills arrays regardless of API response type
const parseArrayField = (field, fallback = []) => {
  if (!field) return fallback;
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return field.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return fallback;
};

// Clean AI responses to strip think tags and markdown
const cleanAiText = (raw = '') => {
  if (!raw) return '';
  return String(raw)
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
};

const shuffleQuestionOptions = (questions = []) => {
  return questions.map((q) => {
    if (!q || !Array.isArray(q.options) || q.options.length === 0) return q;
    const shuffled = [...q.options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return {
      ...q,
      options: shuffled,
    };
  });
};

const shuffleCheckQ = (checkQ) => {
  if (!checkQ || !Array.isArray(checkQ.options) || checkQ.options.length === 0) return checkQ;
  const correctText = checkQ.options[checkQ.correctIndex ?? 0];
  const shuffled = [...checkQ.options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const newIndex = shuffled.indexOf(correctText);
  return {
    ...checkQ,
    options: shuffled,
    correctIndex: newIndex !== -1 ? newIndex : 0,
  };
};

const safeParseJsonArray = (text) => {
  if (!text) return null;
  let raw = cleanAiText(text);
  raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  let start = raw.indexOf('[');
  let end = raw.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    raw = raw.substring(start, end + 1);
  }
  raw = raw.replace(/,\s*([\]}])/g, '$1');

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    try {
      const sanitized = raw.replace(/\*\*/g, '').replace(/\*/g, '');
      const parsed = JSON.parse(sanitized);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      return null;
    }
  }
  return null;
};

export function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // 9-Step Interactive Study Mode State (0 to 8)
  const [showStudy, setShowStudy] = useState(false);
  const [studyStep, setStudyStep] = useState(0);

  // Auto AI Teaching State (Step 1)
  const [aiTeachContent, setAiTeachContent] = useState("");
  const [aiTeachLoading, setAiTeachLoading] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Auto AI Examples State (Step 2)
  const [aiExamples, setAiExamples] = useState([]);
  const [aiExamplesLoading, setAiExamplesLoading] = useState(false);

  // Auto AI Check Question State (Step 3)
  const [aiCheckQ, setAiCheckQ] = useState(null);
  const [checkSelected, setCheckSelected] = useState(null);
  const [checkSubmitted, setCheckSubmitted] = useState(false);

  // Auto AI Guided Practice State (Step 4)
  const [aiGuidedQ, setAiGuidedQ] = useState(null);
  const [guidedInput, setGuidedInput] = useState("");
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [blankPenalty, setBlankPenalty] = useState(0);

  // Still Confused? Ask AI Tutor Q&A Chat State
  const [tutorInput, setTutorInput] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorChatList, setTutorChatList] = useState([]);

  // Speaking Practice State (Step 5 & 6)
  const [speakingInput, setSpeakingInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speakingFeedback, setSpeakingFeedback] = useState(null);
  const [evaluatingSpeaking, setEvaluatingSpeaking] = useState(false);

  // Dynamic 3-Tier Quiz State (Step 7)
  const [quizLevel, setQuizLevel] = useState("Basic");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    lessonModuleService
      .detail(id)
      .then((data) => {
        setLesson(data);
      })
      .catch(() => {
        setLesson({
          id: id || "1",
          title: "Present Tenses Mastery",
          category: "Grammar",
          level: "Beginner",
          estimatedMinutes: 15,
          xpReward: 35,
          description: "Master present simple vs continuous tenses with real-world sentence drills and voice audio exercises.",
          objectives: [
            "Understand present simple vs continuous rules",
            "Identify stative vs action verbs",
            "Form correct positive, negative, and question sentences",
            "Practice speaking full sentences confidently out loud",
          ],
          skills: ["Grammar Accuracy", "Speaking Fluency", "Sentence Structure"],
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Audio Speech Read-Aloud Helper
  const handleSpeakText = (text) => {
    if (text) {
      const clean = cleanAiText(text);
      setIsAiSpeaking(true);
      speakGlobalText(clean);
      setTimeout(() => setIsAiSpeaking(false), Math.min(10000, clean.length * 70));
    }
  };

  // Cancel speech synthesis whenever step changes or component unmounts
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [studyStep, showStudy]);

  // Step 1: Auto AI Teaching Concept background enhancement
  useEffect(() => {
    if (!showStudy || studyStep !== 1 || !lesson) return;

    setAiTeachLoading(true);
    aiService
      .lessonTutor(`Teach the complete comprehensive masterclass on "${lesson.title}" (${lesson.category} - ${lesson.level}). Explain the core concept with real-world analogies, sentence formulas (positive, negative, question), 4 real-life dialogue examples (daily life, school, work, travel), common mistakes vs corrections, and native pro-tips.`)
      .then((res) => {
        if (res?.response) {
          const cleaned = cleanAiText(res.response);
          if (cleaned && cleaned.length > 50) {
            setAiTeachContent(cleaned);
          }
        }
      })
      .catch(() => {})
      .finally(() => setAiTeachLoading(false));
  }, [showStudy, studyStep, lesson]);

  // Step 2: Auto AI Examples
  useEffect(() => {
    if (!showStudy || studyStep !== 2 || !lesson) return;
    if (aiExamples.length > 0) return;

    setAiExamplesLoading(true);
    setAiExamples([
      { sentence: "She has been studying English for three years now.", context: "Everyday Life", explanation: "Uses present perfect continuous to show an ongoing action." },
      { sentence: "Could you please explain that point again?", context: "Professional Meeting", explanation: "Using 'Could you' makes a polite request in formal settings." },
      { sentence: "I would have called you if I had known earlier.", context: "With Friends", explanation: "Third conditional for hypothetical past events." },
    ]);
    setAiExamplesLoading(false);
  }, [showStudy, studyStep, lesson]);

  // Step 3: Auto AI Concept Check
  useEffect(() => {
    if (!showStudy || studyStep !== 3 || !lesson) return;
    if (aiCheckQ) return;

    const baseCheck = {
      question: `Select the correct sentence format for "${lesson.title}":`,
      options: [
        "She is practicing English speaking every day to build confidence.",
        "She practice English speak everyday for confidence.",
        "She practicing English speak everyday build confidence.",
      ],
      correctIndex: 0,
      explanation: "This option correctly applies grammatical agreement and natural structure.",
    };
    setAiCheckQ(shuffleCheckQ(baseCheck));
  }, [showStudy, studyStep, lesson]);

  // Step 4: Auto AI Guided Practice
  useEffect(() => {
    if (!showStudy || studyStep !== 4 || !lesson) return;
    if (aiGuidedQ) return;

    setAiGuidedQ({
      sentence: "Every day I ______ new English vocabulary phrases to build fluency.",
      correctWord: "practice",
      hint: "Think of a verb meaning to do something repeatedly to improve.",
      explanation: "'Practice' is the correct simple present verb for habitual daily routine.",
    });
  }, [showStudy, studyStep, lesson]);

  // Step 7: Dynamic Quiz Fetcher
  const fetchQuiz = async (tier) => {
    setQuizLoading(true);
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuizIdx(0);
    setQuizSelectedAnswer(null);

    try {
      const prompt = `Lesson Title: "${lesson?.title}", Category: "${lesson?.category}", Level: "${lesson?.level}", Quiz Tier: "${tier}"`;
      const res = await aiService.lessonQuiz(prompt);
      const parsed = safeParseJsonArray(res?.response);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        setQuizQuestions(shuffleQuestionOptions(parsed));
      } else {
        throw new Error("Invalid questions");
      }
    } catch (e) {
      const baseFallback = [
        {
          question: `[${tier}] What is the primary rule taught in "${lesson?.title}"?`,
          options: ["Focus on natural sentence structure and verb tenses.", "Memorize dictionary words without sentences.", "Translate word for word from native language.", "Avoid practicing out loud."],
          correctAnswer: "Focus on natural sentence structure and verb tenses.",
          explanation: "Correct sentence structure builds natural speech fluency.",
        },
        {
          question: `[${tier}] Select the most polite professional expression:`,
          options: ["Could you please provide an update on the project?", "Give me project update now.", "I want project update.", "Tell update immediately."],
          correctAnswer: "Could you please provide an update on the project?",
          explanation: "'Could you please' is formal and polite in business communication.",
        },
        {
          question: `[${tier}] Which sentence demonstrates correct contextual usage?`,
          options: ["I practice speaking every single day.", "Me practice speak everyday.", "I am practice speech everyday.", "Practicing I do daily."],
          correctAnswer: "I practice speaking every single day.",
          explanation: "Simple present tense with correct subject pronoun 'I' expresses a daily habit.",
        },
        {
          question: `[${tier}] What is the best way to eliminate awkward pauses?`,
          options: ["Use natural transitional phrases and structured pauses.", "Speak as fast as possible without breathing.", "Repeat the same word continuously.", "Never speak in full sentences."],
          correctAnswer: "Use natural transitional phrases and structured pauses.",
          explanation: "Transitional phrases give your brain time to formulate the next thought naturally.",
        },
        {
          question: `[${tier}] What key habit ensures long-term fluency?`,
          options: ["Consistent daily practice and active conversational drills.", "Reading grammar books without ever speaking.", "Avoiding listening to native audio.", "Only memorizing single isolated words."],
          correctAnswer: "Consistent daily practice and active conversational drills.",
          explanation: "Active conversational drills build lasting neural pathways for spontaneous speech.",
        }
      ];
      setQuizQuestions(shuffleQuestionOptions(baseFallback));
    } finally {
      setQuizLoading(false);
    }
  };

  // Step 7: Auto Fetch Quiz Questions when entering Step 7
  useEffect(() => {
    if (!showStudy || studyStep !== 7 || !lesson) return;
    if (quizQuestions.length === 0) {
      fetchQuiz(quizLevel || "Basic");
    }
  }, [showStudy, studyStep, lesson]);

  const handleStartStudyFlow = () => {
    const defaultTeach = [
      `🎯 1. WHAT IS THIS CONCEPT & WHY IT MATTERS:`,
      `Mastering "${lesson.title}" is an essential foundation for natural English fluency in ${lesson.category} (${lesson.level}). ${lesson.description || 'It gives your sentences proper grammatical structure and clarity so you express yourself effortlessly.'}`,
      ``,
      `📐 2. GOLDEN RULES & SENTENCE FORMULAS:`,
      `• Positive (+): Subject + Verb + Complement (e.g., "I express my ideas clearly in meetings.")`,
      `• Negative (-): Subject + Auxiliary + not + Base Verb (e.g., "She does not hesitate when speaking.")`,
      `• Question (?): Auxiliary + Subject + Base Verb? (e.g., "Do you practice your speaking turns every day?")`,
      ``,
      `🌟 3. REAL-LIFE SITUATION EXAMPLES:`,
      `• Daily Life: "I usually prepare my morning schedule before heading out."`,
      `• School / Academic: "Could the teacher please explain this grammatical rule once more?"`,
      `• Workplace / Career: "We are finalizing the deliverables for the upcoming client review."`,
      `• Travel / Public: "Excuse me, where can I find the information counter for international flights?"`,
      ``,
      `⚠️ 4. COMMON MISTAKES VS NATIVE CORRECTIONS:`,
      `• ❌ Incorrect: "He don't know the exact schedule."`,
      `• ✅ Correct: "He doesn't know the exact schedule." (Use 'doesn't' with third-person singular).`,
      ``,
      `💡 5. NATIVE SPEAKER PRO-TIP:`,
      `Focus on connecting phrases with natural rhythm rather than pausing before each word. Speak 3 full sentences out loud right now!`,
    ].join("\n");

    const defaultExamples = [
      { sentence: "She has been studying English every day to build confidence.", context: "Daily Routine", explanation: "Demonstrates continuous habitual practice with natural sentence flow." },
      { sentence: "Could you please explain that point again?", context: "Professional Meeting", explanation: "Using polite modal verbs creates confident, respectful communication." },
      { sentence: "I would have called you if I had received the update earlier.", context: "Social Scenario", explanation: "Uses third conditional to express hypothetical past situations." },
      { sentence: "The team successfully completed the presentation ahead of schedule.", context: "Workplace", explanation: "Uses clear action verbs and natural adverb placement." },
    ];

    const defaultCheck = shuffleCheckQ({
      question: `What is the most effective approach to mastering "${lesson.title}"?`,
      options: [
        "Focus on clear structure, natural rhythm, and regular speaking practice.",
        "Translate literally word-for-word from another language.",
        "Memorize isolated words without forming full sentences.",
      ],
      correctIndex: 0,
      explanation: "Applying the concept in complete, contextual sentences is the proven key to true English fluency.",
    });

    const defaultGuided = {
      sentence: "Every day I ______ new English phrases to express myself clearly.",
      correctWord: "practice",
      hint: "Think of a common verb meaning to do something repeatedly to improve.",
      explanation: "'Practice' is the correct simple present verb for habitual daily routine.",
    };

    setAiTeachContent(defaultTeach);
    setAiExamples(defaultExamples);
    setAiCheckQ(defaultCheck);
    setAiGuidedQ(defaultGuided);
    setCheckSelected(null);
    setCheckSubmitted(false);
    setGuidedInput("");
    setGuidedSubmitted(false);
    setBlankPenalty(0);
    setSpeakingInput("");
    setSpeakingFeedback(null);
    setShowStudy(true);
    setStudyStep(1);
    handleSpeakText(defaultTeach);
  };

  const handleEvaluateSpeaking = async () => {
    if (!speakingInput.trim()) return;
    setEvaluatingSpeaking(true);
    try {
      const res = await aiService.evaluateSpeech(speakingInput).catch(() => ({
        overallScore: 90,
        grammarFeedback: "Excellent sentence structure and clear usage of present tense.",
        betterSentence: "I am actively practicing English to improve my fluency.",
        vocabularySuggestions: "Actively, Fluency, Articulate",
      }));
      setSpeakingFeedback(res);
      setStudyStep(6);
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluatingSpeaking(false);
    }
  };

  const handleAskAiTutor = async (customPrompt) => {
    const query = (customPrompt || tutorInput || "").trim();
    if (!query) return;
    setTutorLoading(true);
    setTutorInput("");

    const userMsg = { id: Date.now(), sender: "user", text: query };
    setTutorChatList((prev) => [...prev, userMsg]);

    try {
      const promptText = `Lesson Title: "${lesson?.title}" (${lesson?.category} - ${lesson?.level}). Student Question/Topic: "${query}"`;
      const res = await aiService.lessonTutor(promptText);
      const clean = cleanAiText(res?.response || "Focus on practicing this concept daily in full sentences.");
      const tutorMsg = { id: Date.now() + 1, sender: "tutor", text: clean };
      setTutorChatList((prev) => [...prev, tutorMsg]);
      handleSpeakText(clean);
    } catch {
      const fallback = "Here is a quick tip: Focus on understanding the core formula and speaking 3 full sentences out loud.";
      setTutorChatList((prev) => [...prev, { id: Date.now() + 1, sender: "tutor", text: fallback }]);
      handleSpeakText(fallback);
    } finally {
      setTutorLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center font-bold text-[var(--text-secondary)]">Loading lesson details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link to={ROUTES.LESSONS} className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          ← Back to Lessons
        </Link>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#6c63ff]/10 text-[#6c63ff]">
          {lesson?.category} • {lesson?.level}
        </span>
      </div>

      {/* Main Cover Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#6c63ff] text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold">{lesson?.title}</h1>
            <p className="text-xs sm:text-sm text-[#A5B4FC] max-w-xl">{lesson?.description}</p>
          </div>

          <button
            onClick={handleStartStudyFlow}
            className="px-6 py-3 rounded-2xl bg-[#ff6584] hover:bg-[#ff859d] text-white font-extrabold text-xs shadow-lg hover:scale-105 transition-transform shrink-0"
          >
            🚀 Start Interactive Study Flow
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold opacity-90 border-t border-white/10">
          <span>⏱️ {lesson?.estimatedMinutes || 15} Mins</span>
          <span>⭐ +{lesson?.xpReward || 25} XP Reward</span>
          <span>📖 9 Interactive Steps</span>
        </div>
      </div>

      {/* Interactive Study Mode Modal / Flow */}
      {showStudy && (
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border-2 border-[#6c63ff] shadow-xl space-y-6 animate-in fade-in duration-300">
          {/* Step Progress Indicator */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
            <span className="text-xs font-extrabold text-[#6c63ff]">Step {studyStep} of 8</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all ${
                    studyStep === step ? "w-6 bg-[#6c63ff]" : studyStep > step ? "w-2 bg-emerald-500" : "w-2 bg-[var(--border-default)]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: Core Concept Teaching */}
          {studyStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[var(--text-primary)]">🎓 Step 1: Core Concept Explanation</h2>
                <button onClick={() => handleSpeakText(aiTeachContent)} className="px-3 py-1.5 rounded-xl bg-[#6c63ff] text-white text-xs font-bold">
                  🔊 Listen Voice
                </button>
              </div>

              {aiTeachLoading ? (
                <p className="text-xs font-bold text-[var(--text-secondary)]">AI Tutor generating lesson concept...</p>
              ) : (
                <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-primary)] whitespace-pre-line leading-relaxed">
                  {aiTeachContent}
                </div>
              )}

              {/* Still Confused? Ask AI Tutor Interactive Chat */}
              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[#8B5CF6]/30 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">💬</span>
                  <h3 className="text-xs font-extrabold text-[var(--text-primary)]">Still Confused? Ask Your AI Tutor</h3>
                </div>

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "Give me a simpler example",
                    "What is the main mistake to avoid?",
                    "How do I use this in casual conversation?",
                  ].map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleAskAiTutor(prompt)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#6c63ff]/10 text-[#6c63ff] hover:bg-[#6c63ff]/20 transition"
                    >
                      💡 {prompt}
                    </button>
                  ))}
                </div>

                {/* Chat History */}
                {tutorChatList.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {tutorChatList.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl text-xs ${
                          msg.sender === "user"
                            ? "bg-[#6c63ff]/15 text-[var(--text-primary)] ml-6"
                            : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] mr-6"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-extrabold text-[#6c63ff]">
                            {msg.sender === "user" ? "You" : "🤖 AI Tutor"}
                          </span>
                          {msg.sender === "tutor" && (
                            <button onClick={() => handleSpeakText(msg.text)} className="text-xs hover:scale-110">
                              🔊
                            </button>
                          )}
                        </div>
                        <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input row */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask anything about this topic..."
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAskAiTutor();
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
                  />
                  <button
                    disabled={tutorLoading || !tutorInput.trim()}
                    onClick={() => handleAskAiTutor()}
                    className="px-5 py-2.5 rounded-xl bg-[#6c63ff] disabled:opacity-50 text-white text-xs font-extrabold"
                  >
                    {tutorLoading ? "Thinking..." : "Ask Tutor"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  disabled={aiTeachLoading || isAiSpeaking}
                  onClick={() => setStudyStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-[#6c63ff] disabled:opacity-50 text-white text-xs font-extrabold"
                >
                  {isAiSpeaking ? "🎧 Listening to AI Tutor..." : "Next: Real-World Examples →"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Real-World Examples */}
          {studyStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">💡 Step 2: Real-World Examples</h2>

              <div className="space-y-3">
                {aiExamples.map((ex, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#6c63ff] uppercase">{ex.context}</span>
                      <button onClick={() => handleSpeakText(ex.sentence)} className="text-xs">🔊</button>
                    </div>
                    <p className="font-extrabold text-sm text-[var(--text-primary)]">"{ex.sentence}"</p>
                    <p className="text-xs text-[var(--text-secondary)] italic">{ex.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStudyStep(1)} className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold">
                  ← Back
                </button>
                <button onClick={() => setStudyStep(3)} className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold">
                  Next: Concept Check Quiz →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Concept Check Quiz */}
          {studyStep === 3 && aiCheckQ && (
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">❓ Step 3: Concept Check Quiz</h2>
              <p className="text-xs font-extrabold text-[var(--text-primary)]">{aiCheckQ.question}</p>

              <div className="space-y-2">
                {aiCheckQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCheckSelected(idx);
                      setCheckSubmitted(true);
                    }}
                    className={`w-full p-4 rounded-2xl text-xs font-bold text-left border transition-all ${
                      checkSubmitted
                        ? idx === aiCheckQ.correctIndex
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                          : idx === checkSelected
                          ? "bg-red-500/10 border-red-500 text-red-500"
                          : "bg-[var(--bg-elevated)] border-[var(--border-default)]"
                        : checkSelected === idx
                        ? "bg-[#6c63ff]/10 border-[#6c63ff]"
                        : "bg-[var(--bg-elevated)] border-[var(--border-default)]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {checkSubmitted && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500">
                  {checkSelected === aiCheckQ.correctIndex ? "✓ Correct! " : "x Not quite. "} {aiCheckQ.explanation}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button onClick={() => setStudyStep(2)} className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold">
                  ← Back
                </button>
                <button
                  disabled={!checkSubmitted}
                  onClick={() => setStudyStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-[#6c63ff] disabled:opacity-50 text-white text-xs font-extrabold"
                >
                  {checkSubmitted ? "Next: Guided Practice →" : "Select Option to Continue →"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Guided Practice Fill-in-Blank */}
          {studyStep === 4 && aiGuidedQ && (
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">✍️ Step 4: Guided Practice Drill</h2>
              <p className="text-xs font-semibold text-[var(--text-secondary)]">{aiGuidedQ.hint}</p>
              <p className="text-sm font-extrabold text-[var(--text-primary)]">{aiGuidedQ.sentence}</p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type missing word..."
                  value={guidedInput}
                  onChange={(e) => setGuidedInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
                />
                <button
                  onClick={() => {
                    if (!guidedInput.trim()) return;
                    setGuidedSubmitted(true);
                    if (guidedInput.trim().toLowerCase() !== aiGuidedQ.correctWord.toLowerCase()) {
                      setBlankPenalty(5);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold"
                >
                  Check
                </button>
              </div>

              {guidedSubmitted && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500">
                  {guidedInput.trim().toLowerCase() === aiGuidedQ.correctWord.toLowerCase()
                    ? `✓ Excellent! "${aiGuidedQ.correctWord}" is correct.`
                    : `Correct word: "${aiGuidedQ.correctWord}". ${aiGuidedQ.explanation}`}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button onClick={() => setStudyStep(3)} className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold">
                  ← Back
                </button>
                <button
                  disabled={!guidedSubmitted}
                  onClick={() => setStudyStep(5)}
                  className="px-6 py-2.5 rounded-xl bg-[#6c63ff] disabled:opacity-50 text-white text-xs font-extrabold"
                >
                  {guidedSubmitted ? "Next: Speaking Drill →" : "Check Answer to Continue →"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Live Voice / Speaking Drill */}
          {studyStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">🎙️ Step 5: Live Speaking Practice</h2>
              <p className="text-xs text-[var(--text-secondary)]">Speak a full sentence out loud applying this lesson concept.</p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Speak or type your sentence..."
                  value={speakingInput}
                  onChange={(e) => setSpeakingInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
                />
                <button
                  onClick={handleEvaluateSpeaking}
                  disabled={evaluatingSpeaking || !speakingInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold shadow-md"
                >
                  {evaluatingSpeaking ? "Evaluating..." : "Evaluate Speech"}
                </button>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStudyStep(4)} className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold">
                  ← Back
                </button>
                <button onClick={() => setStudyStep(7)} className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold">
                  Skip to Tier Quiz →
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Speaking Evaluation Scorecard */}
          {studyStep === 6 && speakingFeedback && (
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">📊 Step 6: Speech Evaluation Report</h2>

              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-500">Overall Speech Score</span>
                  <span className="text-xl font-extrabold text-emerald-500">{speakingFeedback.overallScore}%</span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">{speakingFeedback.grammarFeedback}</p>
                <p className="text-xs font-bold text-[#6c63ff]">Native Phrasing: "{speakingFeedback.betterSentence}"</p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    fetchQuiz("Basic");
                    setStudyStep(7);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold"
                >
                  Next: Final Tier Quiz →
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Dynamic 3-Tier Quiz */}
          {studyStep === 7 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[var(--text-primary)]">🏅 Step 7: Final Tier Quiz ({quizLevel})</h2>
                <div className="flex items-center gap-1">
                  {["Basic", "Intermediate", "Advanced"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => {
                        setQuizLevel(tier);
                        fetchQuiz(tier);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${
                        quizLevel === tier ? "bg-[#6c63ff] text-white" : "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {quizLoading ? (
                <p className="text-xs font-bold text-[var(--text-secondary)]">Generating dynamic quiz questions...</p>
              ) : quizQuestions.length > 0 && !quizFinished ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[var(--text-secondary)]">Question {currentQuizIdx + 1} of {quizQuestions.length}</p>
                    <span className="text-xs font-bold text-[#6c63ff]">Score: {quizScore} / {quizQuestions.length}</span>
                  </div>

                  <p className="text-sm font-extrabold text-[var(--text-primary)]">{quizQuestions[currentQuizIdx].question}</p>

                  <div className="space-y-2">
                    {quizQuestions[currentQuizIdx].options.map((opt, idx) => {
                      const isCorrect = opt === quizQuestions[currentQuizIdx].correctAnswer;
                      const isSelected = opt === quizSelectedAnswer;

                      let btnStyle = "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]";
                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-500 font-extrabold";
                        } else if (isSelected) {
                          btnStyle = "bg-red-500/10 border-red-500 text-red-500 font-extrabold";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-[#6c63ff]/10 border-[#6c63ff] text-[#6c63ff] font-extrabold";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={quizSubmitted}
                          onClick={() => {
                            setQuizSelectedAnswer(opt);
                            setQuizSubmitted(true);
                            if (opt === quizQuestions[currentQuizIdx].correctAnswer) {
                              setQuizScore((s) => s + 1);
                            }
                          }}
                          className={`w-full p-4 rounded-2xl text-xs font-bold text-left border transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && <span className="text-emerald-500 font-extrabold shrink-0">✓ Correct</span>}
                          {quizSubmitted && isSelected && !isCorrect && <span className="text-red-500 font-extrabold shrink-0">✗ Wrong</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback & Explanation Note */}
                  {quizSubmitted && (
                    <div
                      className={`p-4 rounded-2xl border text-xs font-bold space-y-1 animate-in fade-in duration-200 ${
                        quizSelectedAnswer === quizQuestions[currentQuizIdx].correctAnswer
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                          : "bg-red-500/10 border-red-500/30 text-red-500"
                      }`}
                    >
                      <p className="font-extrabold">
                        {quizSelectedAnswer === quizQuestions[currentQuizIdx].correctAnswer ? "✓ Correct Answer!" : "✗ Incorrect Answer."}
                      </p>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {quizQuestions[currentQuizIdx].explanation}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      disabled={!quizSubmitted}
                      onClick={() => {
                        if (currentQuizIdx + 1 < quizQuestions.length) {
                          setCurrentQuizIdx((i) => i + 1);
                          setQuizSelectedAnswer(null);
                          setQuizSubmitted(false);
                        } else {
                          setQuizFinished(true);
                          setStudyStep(8);
                          recordLessonCompleted(lesson?.title || "English Lesson");
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition-all"
                    >
                      {currentQuizIdx + 1 < quizQuestions.length ? "Continue to Next Question →" : "Finish Quiz & View Results 🎉"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* STEP 8: Lesson Completion & XP Reward */}
          {studyStep === 8 && (
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white text-center space-y-4 shadow-xl">
              <span className="text-5xl">🎉</span>
              <h2 className="text-2xl font-extrabold">Lesson Completed!</h2>
              <p className="text-xs opacity-90">
                You have successfully completed "{lesson?.title}" and earned +{lesson?.xpReward || 35} XP!
              </p>
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => navigate(ROUTES.LESSONS)}
                  className="px-8 py-3 rounded-2xl bg-white text-[#6c63ff] font-extrabold text-xs shadow-lg"
                >
                  Return to Lessons
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Static Lesson Details & Objectives */}
      {!showStudy && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-[var(--text-primary)]">🎯 Learning Objectives</h2>
            <div className="space-y-2">
              {parseArrayField(lesson?.objectives, [
                "Understand core lesson rules and principles",
                "Identify practical real-world sentence patterns",
                "Form correct positive, negative, and question sentences",
                "Practice speaking full sentences confidently out loud",
              ]).map((obj, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                  <span className="text-emerald-500">✓</span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-[var(--text-primary)]">⚡ Target Skills</h2>
            <div className="flex flex-wrap gap-2">
              {parseArrayField(lesson?.skills, [
                "Grammar Accuracy",
                "Speaking Fluency",
                "Sentence Structure",
              ]).map((sk, idx) => (
                <span key={idx} className="px-3 py-1 rounded-xl bg-[#6c63ff]/10 text-[#6c63ff] text-xs font-extrabold">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LessonDetail;
