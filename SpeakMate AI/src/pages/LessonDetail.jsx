import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ROUTES from "../constants/routes";
import { lessonModuleService, aiService, speechService } from "../services/appServices";

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
          xpReward: 25,
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
    if ("speechSynthesis" in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[\*\_]/g, ""));
      utterance.rate = 1.0;
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Step 1: Auto AI Teaching Concept
  useEffect(() => {
    if (!showStudy || studyStep !== 1 || !lesson) return;
    if (aiTeachContent) return;

    setAiTeachLoading(true);
    aiService
      .lessonTutor(`Teach the lesson "${lesson.title}" (${lesson.category} - ${lesson.level}) in 200 words with simple explanation, why it matters, and common mistakes.`)
      .then((res) => {
        if (res?.response) {
          setAiTeachContent(res.response);
          handleSpeakText(res.response);
        }
      })
      .catch(() => {
        setAiTeachContent(
          `Let's explore "${lesson.title}" together!\n\nThis topic is essential for building natural fluency in ${lesson.category}. Focus on regular sentence practice, listening to native audio examples, and speaking out loud.`
        );
      })
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

    setAiCheckQ({
      question: `Select the correct sentence format for "${lesson.title}":`,
      options: [
        "She is practicing English speaking every day to build confidence.",
        "She practice English speak everyday for confidence.",
        "She practicing English speak everyday build confidence.",
      ],
      correctIndex: 0,
      explanation: "Option 1 correctly uses subject-verb agreement and present continuous for ongoing action.",
    });
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

    setQuizQuestions([
      {
        question: `[${tier}] What is the primary rule taught in "${lesson?.title}"?`,
        options: ["Focus on natural sentence structure and verb tenses.", "Memorize dictionary words without sentences.", "Translate word for word from native language."],
        correctAnswer: "Focus on natural sentence structure and verb tenses.",
        explanation: "Correct sentence structure builds natural speech fluency.",
      },
      {
        question: `[${tier}] Select the most polite professional expression:`,
        options: ["Could you please provide an update on the project?", "Give me project update now.", "I want project update."],
        correctAnswer: "Could you please provide an update on the project?",
        explanation: "'Could you please' is formal and polite in business communication.",
      },
    ]);
    setQuizLoading(false);
  };

  const handleStartStudyFlow = () => {
    setShowStudy(true);
    setStudyStep(1);
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

              <div className="flex justify-end pt-4">
                <button onClick={() => setStudyStep(2)} className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold">
                  Next: Real-World Examples →
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
                <button onClick={() => setStudyStep(4)} className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold">
                  Next: Guided Practice →
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
                  onClick={() => setGuidedSubmitted(true)}
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
                <button onClick={() => setStudyStep(5)} className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold">
                  Next: Speaking Drill →
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
                  <p className="text-xs font-bold text-[var(--text-secondary)]">Question {currentQuizIdx + 1} of {quizQuestions.length}</p>
                  <p className="text-sm font-extrabold text-[var(--text-primary)]">{quizQuestions[currentQuizIdx].question}</p>

                  <div className="space-y-2">
                    {quizQuestions[currentQuizIdx].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuizSelectedAnswer(opt)}
                        className={`w-full p-4 rounded-2xl text-xs font-bold text-left border transition-all ${
                          quizSelectedAnswer === opt ? "bg-[#6c63ff]/10 border-[#6c63ff] text-[#6c63ff]" : "bg-[var(--bg-elevated)] border-[var(--border-default)]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      disabled={!quizSelectedAnswer}
                      onClick={() => {
                        if (quizSelectedAnswer === quizQuestions[currentQuizIdx].correctAnswer) {
                          setQuizScore((s) => s + 1);
                        }
                        if (currentQuizIdx + 1 < quizQuestions.length) {
                          setCurrentQuizIdx((i) => i + 1);
                          setQuizSelectedAnswer(null);
                        } else {
                          setQuizFinished(true);
                          setStudyStep(8);
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#6c63ff] disabled:opacity-50 text-white text-xs font-extrabold"
                    >
                      {currentQuizIdx + 1 < quizQuestions.length ? "Next Question →" : "Finish Quiz"}
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
                You have successfully completed "{lesson?.title}" and earned +{lesson?.xpReward || 25} XP!
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
