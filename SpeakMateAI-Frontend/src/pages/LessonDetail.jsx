import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ROUTES from "../constants/routes";
import { speakGlobalText } from "../utils/speechHelper";
import { lessonModuleService, aiService } from "../services/appServices";
import { recordLessonCompleted } from "../utils/progressTracker";
import { findCurriculumLesson, MASTER_LESSONS, getMasterclassForLesson } from "../constants/masterCurriculum";
import { CurriculumCache } from "../utils/curriculumCache";

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
const cleanAiText = (raw = "") => {
  if (!raw) return "";
  return String(raw)
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*/gi, "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
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
  raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  let start = raw.indexOf("[");
  let end = raw.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    raw = raw.substring(start, end + 1);
  }
  raw = raw.replace(/,\s*([\]}])/g, "$1");

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    try {
      const sanitized = raw.replace(/\*\*/g, "").replace(/\*/g, "");
      const parsed = JSON.parse(sanitized);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      return null;
    }
  }
  return null;
};

// Clean string helper for fill-in-the-blank comparison
const sanitizeWord = (w = "") => {
  return String(w).replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "").trim().toLowerCase();
};

export function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // 9-Step Interactive Study Mode State (0 to 8)
  const [showStudy, setShowStudy] = useState(false);
  const [studyStep, setStudyStep] = useState(0);

  // Step 2: Interactive Masterclass & Audio State
  const [aiTeachContent, setAiTeachContent] = useState("");
  const [aiTeachLoading, setAiTeachLoading] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [listenedFullExplanation, setListenedFullExplanation] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [activeAudioSection, setActiveAudioSection] = useState(null);
  const [audioBonusAwarded, setAudioBonusAwarded] = useState(false);

  // Instant 4-Pillar Pedagogical Masterclass Engine
  const masterclass = lesson ? getMasterclassForLesson(lesson) : null;

  // Step 3: Contextual Examples State
  const [aiExamples, setAiExamples] = useState([]);
  const [aiExamplesLoading, setAiExamplesLoading] = useState(false);

  // Step 4: Concept Check Quiz State
  const [aiCheckQ, setAiCheckQ] = useState(null);
  const [checkSelected, setCheckSelected] = useState(null);
  const [checkSubmitted, setCheckSubmitted] = useState(false);

  // Step 5: Guided Practice Drill State
  const [aiGuidedQ, setAiGuidedQ] = useState(null);
  const [guidedInput, setGuidedInput] = useState("");
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [blankPenalty, setBlankPenalty] = useState(0);

  // Step 2: Still Confused? Ask AI Tutor Q&A Chat State
  const [tutorInput, setTutorInput] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorChatList, setTutorChatList] = useState([]);

  // Step 6 & 7: Speaking Practice State
  const [speakingInput, setSpeakingInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speakingFeedback, setSpeakingFeedback] = useState(null);
  const [evaluatingSpeaking, setEvaluatingSpeaking] = useState(false);
  const [speakingError, setSpeakingError] = useState("");

  // Step 8: Dynamic 3-Tier Quiz State
  const [quizLevel, setQuizLevel] = useState("Basic");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    const curr = findCurriculumLesson(id);
    if (curr) {
      setLesson(curr);
      CurriculumCache.updateLessonProgress(
        curr.id,
        curr.title,
        curr.progressPercent || 11,
        curr.category,
        curr.level,
        curr.xpReward,
        curr.estimatedMinutes
      );
    }

    lessonModuleService
      .detail(id)
      .then((data) => {
        const effectiveCurr = (data?.title ? findCurriculumLesson(data.title) : null) || curr;
        setLesson((prev) => ({
          ...(effectiveCurr || {}),
          ...data,
          title: data?.title || effectiveCurr?.title || prev?.title,
          category: data?.category || effectiveCurr?.category || prev?.category,
          level: data?.level || effectiveCurr?.level || prev?.level,
          description: data?.description || effectiveCurr?.description || prev?.description,
          objectives: data?.objectives && parseArrayField(data.objectives).length > 0 ? parseArrayField(data.objectives) : effectiveCurr?.objectives,
          skills: data?.skills && parseArrayField(data.skills).length > 0 ? parseArrayField(data.skills) : effectiveCurr?.skills,
          checkQuestion: effectiveCurr?.checkQuestion || prev?.checkQuestion,
          guidedPractice: effectiveCurr?.guidedPractice || prev?.guidedPractice,
          speakingDrill: effectiveCurr?.speakingDrill || prev?.speakingDrill,
          speakingDrills: effectiveCurr?.speakingDrills || prev?.speakingDrills,
          quiz: effectiveCurr?.quiz || prev?.quiz,
        }));
      })
      .catch(() => {
        if (!curr) {
          const fallback = MASTER_LESSONS?.[0] || {
            id: "1",
            title: "Mastering Short & Long Vowels",
            category: "Phonics",
            level: "Beginner",
            estimatedMinutes: 15,
            xpReward: 35,
            description: "Identifying short vowel sounds (/a/, /e/, /i/, /o/, /u/) vs long vowel sounds (CVC rule).",
            objectives: [
              "Master the foundational rules of Mastering Short & Long Vowels",
              "Identify and correct frequent errors in Phonics",
              "Construct grammatically sound spoken and written sentences",
              "Practice confident oral delivery and articulation with AI feedback",
            ],
            skills: ["Phonics Precision", "Spoken Fluency", "Sentence Mechanics"],
          };
          setLesson(fallback);
        }
      })
      .finally(() => {
        setLoading(false);
        if (id) {
          lessonModuleService.start(id).catch(() => null);
        }
      });
  }, [id]);

  // Audio Speech Read-Aloud Helper
  const handleSpeakText = (text, onFinished = null) => {
    if (!text) return;
    const clean = cleanAiText(text);
    setIsAiSpeaking(true);
    speakGlobalText(clean, 1.0, {
      onend: () => {
        setIsAiSpeaking(false);
        if (onFinished) onFinished();
      },
    });
  };

  const stopAllSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
  };

  // Cancel speech synthesis whenever step changes or component unmounts
  useEffect(() => {
    stopAllSpeech();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      setIsListening(false);
    }
    return () => {
      stopAllSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [studyStep, showStudy]);

  // Reset active audio section on step change
  useEffect(() => {
    setActiveAudioSection(null);
  }, [studyStep, showStudy]);

  // Sync step progress with backend and instant cache
  useEffect(() => {
    if (showStudy && lesson?.id && studyStep > 0 && studyStep < 8) {
      const progressPercent = Math.min(95, Math.round(((studyStep + 1) / 9) * 100));
      CurriculumCache.updateLessonProgress(
        lesson.id,
        lesson.title,
        progressPercent,
        lesson.category,
        lesson.level,
        lesson.xpReward,
        lesson.estimatedMinutes
      );
      lessonModuleService
        .updateProgress({
          lessonId: Number(lesson.id) || lesson.id,
          progressPercent,
          lastSectionIndex: studyStep,
          timeSpentMinutes: 1,
        })
        .catch(() => null);
    }
  }, [showStudy, studyStep, lesson?.id, lesson?.title, lesson?.category, lesson?.level, lesson?.xpReward, lesson?.estimatedMinutes]);

  // Step 2: Auto AI Teaching Concept background enhancement with topic-specific prompt
  useEffect(() => {
    if (!showStudy || studyStep !== 1 || !lesson) return;
    if (aiTeachContent && aiTeachContent.length > 150) return;

    setAiTeachLoading(true);
    aiService
      .lessonTutor(
        `Teach the complete comprehensive masterclass specifically about "${lesson.title}" (${lesson.category} - ${lesson.level} level). Focus strictly on ${lesson.title}. Detail: 1) What is ${lesson.title} and why it matters in ${lesson.category}, 2) The exact sentence formulas and golden grammar rules, 3) 4 real-world situational dialogue examples, 4) Frequent mistakes vs native corrections, 5) Native speaker pro-tips for fluent spoken delivery.`
      )
      .then((res) => {
        if (res?.response) {
          const cleaned = cleanAiText(res.response);
          if (cleaned && cleaned.length > 80) {
            setAiTeachContent(cleaned);
          }
        }
      })
      .catch(() => {})
      .finally(() => setAiTeachLoading(false));
  }, [showStudy, studyStep, lesson]);

  // Step 3: Contextual Examples prioritized by lesson content
  useEffect(() => {
    if (!showStudy || studyStep !== 2 || !lesson) return;
    if (aiExamples.length > 0) return;

    if (lesson?.speakingDrills && lesson.speakingDrills.length > 0) {
      setAiExamples(
        lesson.speakingDrills.map((drill, idx) => ({
          sentence: drill,
          context: `Curriculum Example #${idx + 1}`,
          explanation: `Demonstrates the core academic formula for "${lesson.title}".`,
        }))
      );
      return;
    }

    setAiExamplesLoading(true);
    aiService
      .lessonTutor(
        `Generate 3 distinct real-world example sentences specifically demonstrating "${lesson.title}" in ${lesson.category} (${lesson.level}). Format as JSON array of objects with keys: sentence, context, explanation. Only output JSON array.`
      )
      .then((res) => {
        const parsed = safeParseJsonArray(res?.response);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          setAiExamples(parsed);
          return;
        }
        throw new Error("Invalid format");
      })
      .catch(() => {
        setAiExamples([
          {
            sentence: `I practice "${lesson.title}" rules whenever I speak English in everyday conversations.`,
            context: "Daily Habit",
            explanation: `Demonstrates continuous application of "${lesson.title}" principles in daily life.`,
          },
          {
            sentence: `Could you please explain how to apply "${lesson.title}" in this specific scenario?`,
            context: "Professional Inquiry",
            explanation: "Using polite modal verbs combined with the target topic builds clear communication.",
          },
          {
            sentence: `Active speaking drills build permanent fluency and automatic recall of "${lesson.title}".`,
            context: "Fluency Practice",
            explanation: "Repetition in complete sentences develops spontaneous speaking confidence.",
          },
        ]);
      })
      .finally(() => setAiExamplesLoading(false));
  }, [showStudy, studyStep, lesson]);

  // Step 4: Auto AI Concept Check tailored to this lesson
  useEffect(() => {
    if (!showStudy || studyStep !== 3 || !lesson) return;
    if (aiCheckQ) return;

    if (lesson?.checkQuestion) {
      setAiCheckQ(shuffleCheckQ(lesson.checkQuestion));
      return;
    }

    const baseCheck = {
      question: `Which sentence correctly demonstrates the foundational rule for "${lesson.title}"?`,
      options: [
        `Applying "${lesson.title}" accurately in a complete, grammatically sound sentence.`,
        "Translating words directly without understanding sentence structure.",
        "Omitting necessary auxiliary verbs and natural conversational rhythm.",
      ],
      correctIndex: 0,
      explanation: `Proper structural agreement and natural rhythm are essential for mastering "${lesson.title}".`,
    };
    setAiCheckQ(shuffleCheckQ(baseCheck));
  }, [showStudy, studyStep, lesson]);

  // Step 5: Auto AI Guided Practice tailored to this lesson
  useEffect(() => {
    if (!showStudy || studyStep !== 4 || !lesson) return;
    if (aiGuidedQ) return;

    if (lesson?.guidedPractice) {
      setAiGuidedQ(lesson.guidedPractice);
      return;
    }

    setAiGuidedQ({
      sentence: `In English, we always ______ the core formulas of ${lesson.title} to communicate clearly.`,
      correctWord: "apply",
      hint: "Think of a verb meaning to use or put into practice.",
      explanation: "'Apply' is the correct base verb fitting the grammatical structure of this sentence.",
    });
  }, [showStudy, studyStep, lesson]);

  // Step 8: Dynamic Quiz Fetcher with instant curriculum fallback
  const fetchQuiz = async (tier) => {
    setQuizLoading(true);
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuizIdx(0);
    setQuizSelectedAnswer(null);

    // If lesson already has curriculum questions, load them immediately!
    if (lesson?.quiz && Array.isArray(lesson.quiz) && lesson.quiz.length >= 3) {
      setQuizQuestions(shuffleQuestionOptions(lesson.quiz));
      setQuizLoading(false);
      return;
    }

    try {
      const prompt = `Generate 5 multiple choice questions strictly testing "${lesson?.title}" in ${lesson?.category} (${lesson?.level}). Quiz Tier: "${tier}". Format as JSON array of objects with keys: question, options (array of 4), correctAnswer, explanation.`;
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
          question: `[${tier}] What is the primary academic focus of "${lesson?.title}"?`,
          options: [
            `Focus on natural sentence structure, proper verb forms, and context in ${lesson?.category}.`,
            "Memorize dictionary words without full sentences.",
            "Translate word for word from native language.",
            "Avoid practicing speaking out loud.",
          ],
          correctAnswer: `Focus on natural sentence structure, proper verb forms, and context in ${lesson?.category}.`,
          explanation: `Correct sentence structure and contextual practice build natural speech fluency in ${lesson?.category}.`,
        },
        {
          question: `[${tier}] Which sentence demonstrates the correct practical usage for "${lesson?.title}"?`,
          options: [
            `I practice speaking full sentences of "${lesson?.title}" every day to build confidence.`,
            `Me practice "${lesson?.title}" everyday without sentence.`,
            `I am practice "${lesson?.title}" yesterday tomorrow.`,
            "Practicing I do without grammar rules.",
          ],
          correctAnswer: `I practice speaking full sentences of "${lesson?.title}" every day to build confidence.`,
          explanation: "Simple present tense with correct subject pronoun 'I' expresses a regular daily habit.",
        },
        {
          question: `[${tier}] In formal or professional situations, how should you apply this lesson?`,
          options: [
            "Use clear, polite modal phrases and well-structured sentences.",
            "Speak as fast as possible without pauses.",
            "Never check sentence structure or verb forms.",
            "Use incomplete fragmented words.",
          ],
          correctAnswer: "Use clear, polite modal phrases and well-structured sentences.",
          explanation: "Polite modal structures and clear syntax create confident, respectful communication.",
        },
      ];
      setQuizQuestions(shuffleQuestionOptions(baseFallback));
    } finally {
      setQuizLoading(false);
    }
  };

  // Step 8: Auto Fetch Quiz Questions when entering Step 8
  useEffect(() => {
    if (!showStudy || studyStep !== 7 || !lesson) return;
    if (quizQuestions.length === 0) {
      fetchQuiz(quizLevel || "Basic");
    }
  }, [showStudy, studyStep, lesson]);

  const handleStartStudyFlow = () => {
    const defaultTeach = [
      `🎯 1. WHAT IS THIS CONCEPT & WHY IT MATTERS:`,
      `Mastering "${lesson.title}" is an essential foundation for natural English fluency in ${lesson.category} (${lesson.level}). ${
        lesson.description ||
        "It gives your sentences proper grammatical structure and clarity so you express yourself effortlessly."
      }`,
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

    const defaultExamples = (lesson?.speakingDrills && lesson.speakingDrills.length > 0)
      ? lesson.speakingDrills.map((drill, idx) => ({
          sentence: drill,
          context: `Core Drill #${idx + 1}`,
          explanation: `Demonstrates the core academic formula for "${lesson.title}".`,
        }))
      : [
          {
            sentence: `She has been studying ${lesson.title} concepts every day to build confidence.`,
            context: "Daily Routine",
            explanation: "Demonstrates continuous habitual practice with natural sentence flow.",
          },
          {
            sentence: "Could you please explain that point again?",
            context: "Professional Meeting",
            explanation: "Using polite modal verbs creates confident, respectful communication.",
          },
          {
            sentence: "The team successfully completed the presentation ahead of schedule.",
            context: "Workplace",
            explanation: "Uses clear action verbs and natural adverb placement.",
          },
        ];

    const defaultCheck = shuffleCheckQ(
      lesson?.checkQuestion || {
        question: `What is the most effective approach to mastering "${lesson.title}"?`,
        options: [
          "Focus on clear structure, natural rhythm, and regular speaking practice.",
          "Translate literally word-for-word from another language.",
          "Memorize isolated words without forming full sentences.",
        ],
        correctIndex: 0,
        explanation: "Applying the concept in complete, contextual sentences is the proven key to true English fluency.",
      }
    );

    const defaultGuided = lesson?.guidedPractice || {
      sentence: `In English, we always ______ proper grammatical structure to communicate ideas clearly.`,
      correctWord: "apply",
      hint: "Think of a common verb meaning to use or put into practice.",
      explanation: "'Apply' is the correct base verb fitting the sentence context.",
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
    setQuizQuestions(lesson?.quiz && Array.isArray(lesson.quiz) ? shuffleQuestionOptions(lesson.quiz) : []);
    setQuizScore(0);
    setQuizFinished(false);
    setListenedFullExplanation(false);
    setAudioBonusAwarded(false);
    setActiveAudioSection(null);
    setShowStudy(true);
    setStudyStep(0); // Starts at Step 0 (Overview & Objectives)
    CurriculumCache.updateLessonProgress(
      lesson?.id,
      lesson?.title,
      15,
      lesson?.category,
      lesson?.level,
      lesson?.xpReward,
      lesson?.estimatedMinutes
    );
  };

  // Play full 4-pillar masterclass sequentially
  const handlePlayFullMasterclass = () => {
    if (!masterclass) return;
    if (isAiSpeaking && activeAudioSection === "all") {
      stopAllSpeech();
      setIsAiSpeaking(false);
      setActiveAudioSection(null);
      return;
    }

    stopAllSpeech();
    setIsAiSpeaking(true);
    setActiveAudioSection("all");

    const breakdownText = (masterclass.formula?.breakdown || [])
      .map((b) => `${b.label}: ${b.detail}`)
      .join(". ");
    const examplesText = (masterclass.formula?.examples || []).join(". ");
    const mistakesText = (masterclass.mistakes || [])
      .map((m) => `Common Pitfall: ${m.incorrect}. Correct Native Usage: ${m.correct}. Why: ${m.why}`)
      .join(". ");

    const fullScript = `Masterclass on ${lesson?.title || "this topic"}. 
      Core Concept: ${masterclass.coreConcept?.summary || ""}. ${masterclass.coreConcept?.context || ""}.
      Golden Formula: ${masterclass.formula?.rule || ""}. ${breakdownText}. For example: ${examplesText}.
      Common Mistakes to Avoid: ${mistakesText}.
      Tutor Pro Fluency Tip: ${masterclass.fluencyTip?.tip || ""}. Practice phrase: ${masterclass.fluencyTip?.practicePhrase || ""}.`;

    speakGlobalText(fullScript, audioSpeed, {
      onend: () => {
        setIsAiSpeaking(false);
        setActiveAudioSection(null);
        setListenedFullExplanation(true);
        setAudioBonusAwarded(true);
      },
      onerror: () => {
        setIsAiSpeaking(false);
        setActiveAudioSection(null);
      },
    });
  };

  // Play a specific masterclass pillar section
  const handlePlaySectionAudio = (sectionKey, text) => {
    if (isAiSpeaking && activeAudioSection === sectionKey) {
      stopAllSpeech();
      setIsAiSpeaking(false);
      setActiveAudioSection(null);
      return;
    }

    stopAllSpeech();
    setIsAiSpeaking(true);
    setActiveAudioSection(sectionKey);

    speakGlobalText(text, audioSpeed, {
      onend: () => {
        setIsAiSpeaking(false);
        setActiveAudioSection(null);
      },
      onerror: () => {
        setIsAiSpeaking(false);
        setActiveAudioSection(null);
      },
    });
  };

  // Cycle playback speed: 0.75x -> 1.0x -> 1.25x
  const handleCycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25];
    const nextIdx = (speeds.indexOf(audioSpeed) + 1) % speeds.length;
    setAudioSpeed(speeds[nextIdx]);
  };

  // Step 2 to Step 3 advance: pure progression with ZERO XP penalties
  const handleAdvanceFromStep2 = () => {
    if (isAiSpeaking) {
      stopAllSpeech();
      setActiveAudioSection(null);
    }
    setStudyStep(2);
  };

  // Browser Speech Recognition Functions for Step 6
  const startSpeechListening = () => {
    setSpeakingError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeakingError("Speech recognition is not supported in this browser. Please type your sentence.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setSpeakingInput(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setSpeakingError("Microphone permission was denied. Please allow microphone access or type your sentence.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition start failed:", err);
      setIsListening(false);
      setSpeakingError("Could not start microphone. You can type your sentence directly.");
    }
  };

  const stopSpeechListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const handleEvaluateSpeaking = async () => {
    const textToEval = speakingInput.trim();
    if (!textToEval) return;
    setEvaluatingSpeaking(true);
    try {
      const promptText = `Lesson Title: "${lesson?.title}". Category: "${lesson?.category}". Student Spoken/Written Practice Sentence: "${textToEval}"`;
      const res = await aiService.speakingFeedback(promptText).catch(() => null);
      const feedbackText = cleanAiText(
        res?.response ||
          "Great effort! Your sentence demonstrates practical understanding of this lesson. Keep practicing out loud to refine your natural fluency and pronunciation."
      );
      setSpeakingFeedback(feedbackText);
      setStudyStep(6);
    } catch (e) {
      console.error(e);
      setSpeakingFeedback(
        "Your sentence is clear and communicates the intended idea well. Continue practicing for greater fluency."
      );
      setStudyStep(6);
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
      const promptText = `You are a supportive, encouraging AI English tutor.
Lesson: "${lesson?.title}" (${lesson?.category} - ${lesson?.level}).
Core Formula / Rule: "${masterclass?.formula?.rule || ""}".
Student Question / Request: "${query}".
Explain concisely, warmly, and clearly in 2-3 friendly sentences with concrete examples.`;
      const res = await aiService.lessonTutor(promptText);
      const clean = cleanAiText(res?.response || "Focus on practicing this formula in complete spoken sentences every day.");
      const tutorMsg = { id: Date.now() + 1, sender: "tutor", text: clean };
      setTutorChatList((prev) => [...prev, tutorMsg]);
      handleSpeakText(clean);
    } catch {
      const fallback = `Great question! In ${lesson?.title || "this lesson"}, remember the golden rule: ${masterclass?.formula?.rule || "consistent sentence practice"}. Try practicing saying: "${masterclass?.fluencyTip?.practicePhrase || "I speak with confidence."}" out loud!`;
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
        <Link
          to={ROUTES.LESSONS}
          className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
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
          <span>⭐ +{lesson?.xpReward || 35} XP Reward</span>
          <span>📖 9 Interactive Steps</span>
        </div>
      </div>

      {/* Interactive Study Mode Modal / Flow */}
      {showStudy && (
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border-2 border-[#6c63ff] shadow-xl space-y-6 animate-in fade-in duration-300">
          {/* Step Progress Indicator (1 to 9) */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#6c63ff]">
                Step {studyStep + 1} of 9
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6c63ff]/15 text-[#6c63ff] font-bold">
                {[
                  "Overview",
                  "Masterclass",
                  "Examples",
                  "Concept Check",
                  "Guided Drill",
                  "Live Speaking",
                  "Speech Report",
                  "Tier Quiz",
                  "Summary & XP",
                ][studyStep] || "Study Step"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all ${
                    studyStep === step
                      ? "w-6 bg-[#6c63ff]"
                      : studyStep > step
                      ? "w-2 bg-emerald-500"
                      : "w-2 bg-[var(--border-default)]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 0 (Step 1 of 9): Lesson Overview & Objectives */}
          {studyStep === 0 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6c63ff]">
                    STEP 1 • LESSON OVERVIEW
                  </span>
                  <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                    🎯 Lesson Introduction & Learning Goals
                  </h2>
                </div>
                <button
                  onClick={() =>
                    handleSpeakText(
                      `Welcome to ${lesson?.title}. Focus: ${lesson?.description}. Let us master these goals together!`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-[#6c63ff] text-white text-xs font-bold hover:bg-[#5a52e0] transition"
                >
                  🔊 {isAiSpeaking ? "Stop Voice" : "Listen Overview"}
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-3">
                <h3 className="text-xs font-extrabold text-[#6c63ff] uppercase">Core Focus</h3>
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                  {lesson?.description}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-3">
                <h3 className="text-xs font-extrabold text-emerald-500 uppercase">Key Learning Objectives</h3>
                <div className="space-y-2">
                  {parseArrayField(lesson?.objectives, [
                    "Understand core grammar and communication formulas",
                    "Distinguish proper contextual patterns and natural usage",
                    "Formulate accurate positive, negative, and question sentences",
                    "Speak full sentences aloud with native fluency and confidence",
                  ]).map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-[var(--text-primary)]">
                      <span className="text-emerald-500 font-extrabold">✓</span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStudyStep(1)}
                  className="px-6 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#5a52e0] text-white text-xs font-extrabold shadow-md transition"
                >
                  Begin Lesson Masterclass →
                </button>
              </div>
            </div>
          )}

          {/* STEP 1 (Step 2 of 9): 4-Pillar Interactive Visual Masterclass */}
          {studyStep === 1 && (
            <div className="space-y-5 animate-in fade-in">
              {/* Header Navigation & Master Audio Player */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6c63ff]">
                    STEP 2 • INTERACTIVE MASTERCLASS
                  </span>
                  <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                    🎓 {lesson?.title || "Lesson Masterclass"}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* Speed Selector Toggle */}
                  <button
                    onClick={handleCycleSpeed}
                    title="Change voice playback speed"
                    className="px-2.5 py-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-black text-[#6c63ff] hover:bg-[#6c63ff]/10 transition"
                  >
                    ⚡ {audioSpeed}x
                  </button>

                  {/* Play Full Masterclass Button */}
                  <button
                    onClick={handlePlayFullMasterclass}
                    className={`px-4 py-2 rounded-xl text-white text-xs font-extrabold transition flex items-center gap-2 shadow-sm ${
                      isAiSpeaking && activeAudioSection === "all"
                        ? "bg-red-500 hover:bg-red-600 animate-pulse"
                        : "bg-[#6c63ff] hover:bg-[#5a52e0]"
                    }`}
                  >
                    <span>
                      {isAiSpeaking && activeAudioSection === "all"
                        ? "⏹️ Stop Audio"
                        : "🔊 Listen Full Masterclass"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Audio Status & Listener Bonus Pill */}
              {(listenedFullExplanation || audioBonusAwarded) ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <span>🎉</span>
                  <span>Full Masterclass Audio Completed! +10 XP Audio Bonus unlocked for this session.</span>
                </div>
              ) : isAiSpeaking ? (
                <div className="p-3 rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/20 flex items-center justify-between text-xs font-bold text-[#6c63ff]">
                  <div className="flex items-center gap-2">
                    <span className="animate-spin">🔄</span>
                    <span>
                      AI Tutor reading {activeAudioSection === "all" ? "full masterclass" : "selected pillar"} aloud ({audioSpeed}x speed)...
                    </span>
                  </div>
                  <button onClick={stopAllSpeech} className="text-xs underline text-red-500 hover:text-red-600">
                    Stop
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/20 flex items-center gap-2 text-xs font-bold text-[#6c63ff]">
                  <span>🎧</span>
                  <span>
                    Listen with AI voice or read each pillar below at your own pace. Full base XP is guaranteed!
                  </span>
                </div>
              )}

              {/* PILLAR 1: Core Concept & Real-World Context */}
              <div
                className={`p-5 rounded-2xl bg-[var(--bg-elevated)] border transition-all ${
                  activeAudioSection === "coreConcept" || activeAudioSection === "all"
                    ? "border-[#6c63ff] ring-2 ring-[#6c63ff]/20 shadow-md"
                    : "border-[var(--border-default)]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#6c63ff]/15 text-[#6c63ff] text-[10px] font-black uppercase tracking-wider">
                      PILLAR 1: CORE CONCEPT
                    </span>
                    <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                      {masterclass?.coreConcept?.title || `Understanding ${lesson?.title}`}
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      handlePlaySectionAudio(
                        "coreConcept",
                        `Core Concept: ${masterclass?.coreConcept?.summary || ""}. Real-world context: ${masterclass?.coreConcept?.context || ""}. Key takeaway: ${masterclass?.coreConcept?.takeaway || ""}`
                      )
                    }
                    className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[#6c63ff]/10 text-xs font-bold text-[#6c63ff] transition"
                    title="Listen to Core Concept"
                  >
                    {isAiSpeaking && activeAudioSection === "coreConcept" ? "⏹️" : "🔊 Listen"}
                  </button>
                </div>

                <p className="text-xs font-medium text-[var(--text-primary)] leading-relaxed mb-3">
                  {masterclass?.coreConcept?.summary}
                </p>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1 mb-3">
                  <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                    <span>🌍</span>
                    <span>Real-World Context & Relevance:</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {masterclass?.coreConcept?.context}
                  </p>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <span>💡</span>
                  <span>{masterclass?.coreConcept?.takeaway}</span>
                </div>
              </div>

              {/* PILLAR 2: Golden Rule & Structural Formula */}
              <div
                className={`p-5 rounded-2xl bg-[var(--bg-elevated)] border transition-all ${
                  activeAudioSection === "formula" || activeAudioSection === "all"
                    ? "border-[#6c63ff] ring-2 ring-[#6c63ff]/20 shadow-md"
                    : "border-[var(--border-default)]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                      PILLAR 2: GOLDEN FORMULA
                    </span>
                    <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                      Sentence Mechanics & Formula
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      const breakdownText = (masterclass?.formula?.breakdown || [])
                        .map((b) => `${b.label}: ${b.detail}`)
                        .join(". ");
                      handlePlaySectionAudio(
                        "formula",
                        `Golden Formula: ${masterclass?.formula?.rule || ""}. Structural breakdown: ${breakdownText}`
                      );
                    }}
                    className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[#6c63ff]/10 text-xs font-bold text-[#6c63ff] transition"
                    title="Listen to Formula"
                  >
                    {isAiSpeaking && activeAudioSection === "formula" ? "⏹️" : "🔊 Listen"}
                  </button>
                </div>

                {/* Big Formula Banner */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#6c63ff]/15 via-[#8B5CF6]/15 to-[#EC4899]/10 border border-[#6c63ff]/30 text-center mb-4">
                  <span className="text-[10px] font-extrabold uppercase text-[#6c63ff] block mb-1">
                    Universal Structure Rule
                  </span>
                  <span className="text-xs sm:text-sm font-black font-mono text-[var(--text-primary)] tracking-wide">
                    {masterclass?.formula?.rule}
                  </span>
                </div>

                {/* Syntax Component Breakdown Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                  {(masterclass?.formula?.breakdown || []).map((b, bIdx) => (
                    <div
                      key={bIdx}
                      className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-1"
                    >
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black bg-[#6c63ff]/10 text-[#6c63ff] uppercase">
                        {b.badge}
                      </span>
                      <h4 className="text-xs font-extrabold text-[var(--text-primary)]">{b.label}</h4>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{b.detail}</p>
                    </div>
                  ))}
                </div>

                {/* Structured Examples */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">
                    Model Sentence Examples:
                  </span>
                  {(masterclass?.formula?.examples || []).map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] font-medium"
                    >
                      <span className="text-[#6c63ff] font-extrabold">▸</span>
                      <span>{ex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PILLAR 3: Common Pitfalls vs. Native Corrections */}
              <div
                className={`p-5 rounded-2xl bg-[var(--bg-elevated)] border transition-all ${
                  activeAudioSection === "mistakes" || activeAudioSection === "all"
                    ? "border-[#6c63ff] ring-2 ring-[#6c63ff]/20 shadow-md"
                    : "border-[var(--border-default)]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider">
                      PILLAR 3: COMMON MISTAKES
                    </span>
                    <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                      Pitfalls to Avoid vs. Native Usage
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      const mistakesText = (masterclass?.mistakes || [])
                        .map((m) => `Common Pitfall: ${m.incorrect}. Correct Native Usage: ${m.correct}. Why: ${m.why}`)
                        .join(". ");
                      handlePlaySectionAudio("mistakes", mistakesText);
                    }}
                    className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[#6c63ff]/10 text-xs font-bold text-[#6c63ff] transition"
                    title="Listen to Common Mistakes"
                  >
                    {isAiSpeaking && activeAudioSection === "mistakes" ? "⏹️" : "🔊 Listen"}
                  </button>
                </div>

                <div className="space-y-3">
                  {(masterclass?.mistakes || []).map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-2.5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Common Mistake */}
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-600 flex items-center gap-1">
                            <span>❌</span> Common Mistake:
                          </span>
                          <p className="font-semibold text-red-700 dark:text-red-300">{m.incorrect}</p>
                        </div>

                        {/* Native Alternative */}
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                            <span>✅</span> Native Correction:
                          </span>
                          <p className="font-semibold text-emerald-700 dark:text-emerald-300">{m.correct}</p>
                        </div>
                      </div>

                      {/* Why / Linguistic Explanation */}
                      <div className="text-[11px] text-[var(--text-secondary)] flex items-start gap-1.5 pt-1">
                        <span className="text-amber-500 font-extrabold">🧠 Why:</span>
                        <span>{m.why}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PILLAR 4: Tutor Pro Fluency Tip */}
              <div
                className={`p-5 rounded-2xl bg-[var(--bg-elevated)] border transition-all ${
                  activeAudioSection === "fluencyTip" || activeAudioSection === "all"
                    ? "border-[#6c63ff] ring-2 ring-[#6c63ff]/20 shadow-md"
                    : "border-[var(--border-default)]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-wider">
                      PILLAR 4: PRO FLUENCY TIP
                    </span>
                    <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                      {masterclass?.fluencyTip?.title || "Tutor Spoken Fluency Cue"}
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      handlePlaySectionAudio(
                        "fluencyTip",
                        `Pro Fluency Tip: ${masterclass?.fluencyTip?.tip || ""}. Practice saying out loud: ${masterclass?.fluencyTip?.practicePhrase || ""}`
                      )
                    }
                    className="p-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[#6c63ff]/10 text-xs font-bold text-[#6c63ff] transition"
                    title="Listen to Fluency Tip"
                  >
                    {isAiSpeaking && activeAudioSection === "fluencyTip" ? "⏹️" : "🔊 Listen"}
                  </button>
                </div>

                <p className="text-xs font-medium text-[var(--text-primary)] leading-relaxed mb-3">
                  {masterclass?.fluencyTip?.tip}
                </p>

                {masterclass?.fluencyTip?.practicePhrase && (
                  <div className="p-3 rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/20 flex items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="text-[10px] uppercase font-extrabold text-[#6c63ff] block">
                        🗣️ Speak Aloud Practice Phrase:
                      </span>
                      <span className="font-bold text-[var(--text-primary)]">
                        "{masterclass.fluencyTip.practicePhrase}"
                      </span>
                    </div>
                    <button
                      onClick={() => handleSpeakText(masterclass.fluencyTip.practicePhrase)}
                      className="px-2.5 py-1 rounded-lg bg-[#6c63ff] text-white text-[11px] font-bold hover:bg-[#5a52e0] transition flex items-center gap-1"
                    >
                      <span>🔊 Drill</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Context-Aware In-Lesson AI Tutor Q&A */}
              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[#8B5CF6]/30 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">💬</span>
                  <h3 className="text-xs font-extrabold text-[var(--text-primary)]">
                    Still Confused? Ask Your AI Tutor
                  </h3>
                </div>

                {/* Grounded Quick Prompts */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "Give me a simpler explanation",
                    "2 more real-life examples",
                    "Why is the common mistake wrong?",
                    "How do native speakers say this casually?",
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
                            <button
                              onClick={() => handleSpeakText(msg.text)}
                              className="text-xs hover:scale-110"
                              title="Listen to response"
                            >
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
                    placeholder={`Ask anything about "${lesson?.title || "this topic"}"...`}
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
                    className="px-5 py-2.5 rounded-xl bg-[#6c63ff] disabled:opacity-50 text-white text-xs font-extrabold hover:bg-[#5a52e0] transition"
                  >
                    {tutorLoading ? "Thinking..." : "Ask Tutor"}
                  </button>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStudyStep(0)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold hover:bg-[var(--border-default)] transition"
                >
                  ← Back to Overview
                </button>
                <button
                  onClick={handleAdvanceFromStep2}
                  className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold hover:bg-[#5a52e0] transition shadow-md"
                >
                  Next: Real-World Examples →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 (Step 3 of 9): Real-World Examples */}
          {studyStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6c63ff]">
                    STEP 3 • PRACTICAL APPLICATION
                  </span>
                  <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                    💡 Contextual Real-World Examples
                  </h2>
                </div>
              </div>

              {aiExamplesLoading ? (
                <div className="p-6 text-center text-xs font-bold text-[#6c63ff]">Loading practical examples...</div>
              ) : (
                <div className="space-y-3">
                  {aiExamples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#6c63ff] uppercase tracking-wide px-2 py-0.5 rounded-md bg-[#6c63ff]/10">
                          {ex.context}
                        </span>
                        <button
                          onClick={() => handleSpeakText(`${ex.sentence}. ${ex.explanation}`)}
                          className="text-xs hover:scale-110 p-1 rounded-md bg-[var(--bg-surface)]"
                          title="Listen sentence"
                        >
                          🔊
                        </button>
                      </div>
                      <p className="font-extrabold text-sm text-[var(--text-primary)]">"{ex.sentence}"</p>
                      <p className="text-xs text-[var(--text-secondary)] italic">{ex.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStudyStep(1)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStudyStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold hover:bg-[#5a52e0] transition"
                >
                  Next: Concept Check Quiz →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 (Step 4 of 9): Concept Check Quiz */}
          {studyStep === 3 && aiCheckQ && (
            <div className="space-y-4 animate-in fade-in">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6c63ff]">
                STEP 4 • COMPREHENSION CHECK
              </span>
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                ❓ Quick Concept Check Quiz
              </h2>
              <p className="text-xs font-extrabold text-[var(--text-primary)]">{aiCheckQ.question}</p>

              <div className="space-y-2">
                {aiCheckQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={checkSubmitted}
                    onClick={() => {
                      if (!checkSubmitted) {
                        setCheckSelected(idx);
                        setCheckSubmitted(true);
                      }
                    }}
                    className={`w-full p-4 rounded-2xl text-xs font-bold text-left border transition-all ${
                      checkSubmitted
                        ? idx === aiCheckQ.correctIndex
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 font-extrabold"
                          : idx === checkSelected
                          ? "bg-red-500/10 border-red-500 text-red-500 font-extrabold"
                          : "bg-[var(--bg-elevated)] border-[var(--border-default)] opacity-60"
                        : checkSelected === idx
                        ? "bg-[#6c63ff]/10 border-[#6c63ff]"
                        : "bg-[var(--bg-elevated)] border-[var(--border-default)] hover:border-[#6c63ff]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {checkSubmitted && idx === aiCheckQ.correctIndex && (
                        <span className="text-emerald-500 font-extrabold">✓ Correct</span>
                      )}
                      {checkSubmitted && idx === checkSelected && idx !== aiCheckQ.correctIndex && (
                        <span className="text-red-500 font-extrabold">✗ Incorrect</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {checkSubmitted && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-bold ${
                    checkSelected === aiCheckQ.correctIndex
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                      : "bg-red-500/10 border-red-500/30 text-red-500"
                  }`}
                >
                  {checkSelected === aiCheckQ.correctIndex ? "🎉 Excellent! " : "❌ Not quite. "} {aiCheckQ.explanation}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStudyStep(2)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold"
                >
                  ← Back
                </button>
                <button
                  disabled={!checkSubmitted}
                  onClick={() => setStudyStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-[#6c63ff] disabled:opacity-50 text-white text-xs font-extrabold"
                >
                  {checkSubmitted ? "Next: Guided Drill →" : "Select an Answer to Continue →"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 (Step 5 of 9): Guided Practice Drill (Fill-in-the-Blank) */}
          {studyStep === 4 && aiGuidedQ && (
            <div className="space-y-4 animate-in fade-in">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6c63ff]">
                STEP 5 • GUIDED PRACTICE
              </span>
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                ✍️ Fill-in-the-Blank Sentence Drill
              </h2>
              <p className="text-xs font-semibold text-[var(--text-secondary)]">💡 Hint: {aiGuidedQ.hint}</p>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                <p className="text-sm font-extrabold text-[var(--text-primary)] leading-relaxed">
                  {aiGuidedQ.sentence}
                </p>
              </div>

              {/* Word Bank Suggestion Chips */}
              {!guidedSubmitted && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[var(--text-secondary)]">Word Bank Suggestions:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      aiGuidedQ.correctWord,
                      "practicing",
                      "speaking",
                      "routine",
                    ]
                      .filter(Boolean)
                      .sort(() => (aiGuidedQ.correctWord.length % 2 === 0 ? 1 : -1))
                      .map((word, wIdx) => (
                        <button
                          key={wIdx}
                          onClick={() => setGuidedInput(word)}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-[#6c63ff]/10 text-[#6c63ff] hover:bg-[#6c63ff]/25 transition"
                        >
                          {word}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type or tap word from bank..."
                  value={guidedInput}
                  disabled={guidedSubmitted}
                  onChange={(e) => setGuidedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && guidedInput.trim() && !guidedSubmitted) {
                      const isCorrect = sanitizeWord(guidedInput) === sanitizeWord(aiGuidedQ.correctWord);
                      setGuidedSubmitted(true);
                      if (!isCorrect) setBlankPenalty(5);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
                />
                {!guidedSubmitted ? (
                  <button
                    disabled={!guidedInput.trim()}
                    onClick={() => {
                      if (!guidedInput.trim()) return;
                      const isCorrect = sanitizeWord(guidedInput) === sanitizeWord(aiGuidedQ.correctWord);
                      setGuidedSubmitted(true);
                      if (!isCorrect) setBlankPenalty(5);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#6c63ff] disabled:opacity-50 text-white text-xs font-extrabold"
                  >
                    Check
                  </button>
                ) : (
                  sanitizeWord(guidedInput) !== sanitizeWord(aiGuidedQ.correctWord) && (
                    <button
                      onClick={() => {
                        setGuidedInput("");
                        setGuidedSubmitted(false);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold border border-[var(--border-default)] hover:border-[#6c63ff]"
                    >
                      Try Again
                    </button>
                  )
                )}
              </div>

              {guidedSubmitted && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-bold ${
                    sanitizeWord(guidedInput) === sanitizeWord(aiGuidedQ.correctWord)
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                      : "bg-red-500/10 border-red-500/20 text-red-500"
                  }`}
                >
                  {sanitizeWord(guidedInput) === sanitizeWord(aiGuidedQ.correctWord)
                    ? `🎉 Excellent! "${aiGuidedQ.correctWord}" is correct. ${aiGuidedQ.explanation}`
                    : `❌ Not quite. The correct word is "${aiGuidedQ.correctWord}". ${aiGuidedQ.explanation}`}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStudyStep(3)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold"
                >
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

          {/* STEP 5 (Step 6 of 9): Live Voice / Speaking Drill with Real Web SpeechRecognition */}
          {studyStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6c63ff]">
                STEP 6 • LIVE ACTIVE SPEAKING
              </span>
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                🎙️ Speak Your Practice Sentence
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Use your microphone to speak aloud, or type your practice sentence below.
              </p>

              {(lesson?.speakingDrills && lesson.speakingDrills.length > 0) ? (
                <div className="p-3.5 rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-xs">
                  <span className="font-extrabold text-[#6c63ff]">🎯 Recommended Speaking Prompt:</span>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">"{lesson.speakingDrills[0]}"</p>
                </div>
              ) : lesson?.speakingDrill?.sentence ? (
                <div className="p-3.5 rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-xs">
                  <span className="font-extrabold text-[#6c63ff]">🎯 Recommended Speaking Prompt:</span>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">"{lesson.speakingDrill.sentence}"</p>
                </div>
              ) : null}

              {/* Big Interactive Microphone Hub */}
              <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex flex-col items-center justify-center space-y-3 text-center">
                {isListening && (
                  <div className="flex items-center gap-1.5 h-6">
                    <span className="w-1.5 h-4 bg-red-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-6 bg-red-500 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:300ms]" />
                    <span className="w-1.5 h-5 bg-red-500 rounded-full animate-bounce [animation-delay:450ms]" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={isListening ? stopSpeechListening : startSpeechListening}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white shadow-xl transition-all ${
                    isListening
                      ? "bg-red-500 scale-110 ring-4 ring-red-400/40 animate-pulse"
                      : "bg-[#6c63ff] hover:bg-[#5a52e0] hover:scale-105"
                  }`}
                  title={isListening ? "Click to stop recording" : "Click to speak with microphone"}
                >
                  {isListening ? "⏹️" : "🎙️"}
                </button>

                <p className="text-xs font-extrabold text-[var(--text-primary)]">
                  {isListening
                    ? "Listening to your voice... Speak clearly into your mic."
                    : speechSupported
                    ? "Tap microphone to speak sentence out loud"
                    : "Microphone not supported in this browser — type below"}
                </p>

                {speakingError && (
                  <p className="text-[11px] font-bold text-red-500 max-w-sm">{speakingError}</p>
                )}
              </div>

              {/* Input for Transcribed / Typed Text */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                  Transcribed or Typed Sentence:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Speak using microphone above, or type sentence..."
                    value={speakingInput}
                    onChange={(e) => setSpeakingInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
                  />
                  <button
                    onClick={handleEvaluateSpeaking}
                    disabled={evaluatingSpeaking || !speakingInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#6c63ff] disabled:opacity-50 text-white text-xs font-extrabold shadow-md hover:bg-[#5a52e0] transition"
                  >
                    {evaluatingSpeaking ? "Evaluating..." : "Evaluate Speech"}
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStudyStep(4)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    fetchQuiz(quizLevel);
                    setStudyStep(7);
                  }}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Can't speak right now? Skip to Quiz →
                </button>
              </div>
            </div>
          )}

          {/* STEP 6 (Step 7 of 9): Speaking Evaluation Scorecard */}
          {studyStep === 6 && speakingFeedback && (
            <div className="space-y-4 animate-in fade-in">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6c63ff]">
                STEP 7 • AI SPEECH EVALUATION
              </span>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                  📊 Speech Analysis & Feedback
                </h2>
                <button
                  onClick={() => handleSpeakText(speakingFeedback)}
                  className="px-3 py-1.5 rounded-xl bg-[#6c63ff] text-white text-xs font-bold"
                >
                  🔊 Listen Feedback
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="text-xs font-extrabold text-emerald-500">Your Sentence</span>
                  <span className="text-xs font-bold text-emerald-500">Evaluated ✓</span>
                </div>
                <p className="text-sm font-extrabold text-[var(--text-primary)] italic">
                  "{speakingInput}"
                </p>
                <div className="pt-2 text-xs font-semibold text-[var(--text-primary)] whitespace-pre-line leading-relaxed">
                  {speakingFeedback}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStudyStep(5)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold hover:bg-[var(--border-default)]"
                >
                  🎙️ Try Another Sentence
                </button>
                <button
                  onClick={() => {
                    fetchQuiz(quizLevel);
                    setStudyStep(7);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold hover:bg-[#5a52e0] shadow-md transition"
                >
                  Continue to Final Quiz →
                </button>
              </div>
            </div>
          )}

          {/* STEP 7 (Step 8 of 9): Dynamic 3-Tier Quiz */}
          {studyStep === 7 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6c63ff]">
                    STEP 8 • COMPREHENSIVE TIER QUIZ
                  </span>
                  <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                    🏅 Mastery Quiz ({quizLevel})
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  {["Basic", "Intermediate", "Advanced"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => {
                        setQuizLevel(tier);
                        fetchQuiz(tier);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                        quizLevel === tier
                          ? "bg-[#6c63ff] text-white shadow-sm"
                          : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {quizLoading ? (
                <div className="p-8 text-center text-xs font-bold text-[#6c63ff] animate-pulse">
                  Preparing quiz questions for {quizLevel} tier...
                </div>
              ) : quizQuestions.length > 0 && !quizFinished ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[var(--text-secondary)]">
                      Question {currentQuizIdx + 1} of {quizQuestions.length}
                    </p>
                    <span className="text-xs font-bold text-[#6c63ff]">
                      Score: {quizScore} / {quizQuestions.length}
                    </span>
                  </div>

                  <p className="text-sm font-extrabold text-[var(--text-primary)]">
                    {quizQuestions[currentQuizIdx].question}
                  </p>

                  <div className="space-y-2">
                    {quizQuestions[currentQuizIdx].options.map((opt, idx) => {
                      const isCorrect = opt === quizQuestions[currentQuizIdx].correctAnswer;
                      const isSelected = opt === quizSelectedAnswer;

                      let btnStyle =
                        "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] hover:border-[#6c63ff]";
                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-500 font-extrabold";
                        } else if (isSelected) {
                          btnStyle = "bg-red-500/10 border-red-500 text-red-500 font-extrabold";
                        } else {
                          btnStyle = "bg-[var(--bg-elevated)] border-[var(--border-default)] opacity-60";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={quizSubmitted}
                          onClick={() => {
                            if (!quizSubmitted) {
                              setQuizSelectedAnswer(opt);
                              setQuizSubmitted(true);
                              if (opt === quizQuestions[currentQuizIdx].correctAnswer) {
                                setQuizScore((s) => s + 1);
                              }
                            }
                          }}
                          className={`w-full p-4 rounded-2xl text-xs font-bold text-left border transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && (
                            <span className="text-emerald-500 font-extrabold shrink-0">✓ Correct</span>
                          )}
                          {quizSubmitted && isSelected && !isCorrect && (
                            <span className="text-red-500 font-extrabold shrink-0">✗ Wrong</span>
                          )}
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
                        {quizSelectedAnswer === quizQuestions[currentQuizIdx].correctAnswer
                          ? "✓ Correct Answer!"
                          : "✗ Incorrect Answer."}
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
                          // Full Lesson Completion: Base XP + Quiz Accuracy Bonus + Optional Audio Bonus (NO 0 XP PENALTY)
                          const baseXP = (lesson?.xpReward || 35);
                          const bonus = quizScore * (quizLevel === "Advanced" ? 10 : quizLevel === "Intermediate" ? 7 : 5);
                          const audioBonus = (listenedFullExplanation || audioBonusAwarded) ? 10 : 0;
                          const total = Math.max(20, baseXP + bonus + audioBonus - blankPenalty);
                          setEarnedXP(total);
                          recordLessonCompleted(lesson?.title || "English Lesson");
                          CurriculumCache.markLessonCompleted(lesson?.id, lesson?.title);
                          if (lesson?.id) {
                            lessonModuleService.complete(Number(lesson.id) || lesson.id).catch((err) => {
                              console.warn("Backend lesson complete sync error:", err);
                            });
                          }
                          setQuizFinished(true);
                          setStudyStep(8);
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#5a52e0] disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition-all"
                    >
                      {currentQuizIdx + 1 < quizQuestions.length
                        ? "Continue to Next Question →"
                        : "Finish Quiz & View Summary 🎉"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* STEP 8 (Step 9 of 9): Lesson Summary & Mastery Rewards */}
          {studyStep === 8 && (
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#6c63ff] to-[#ff6584] text-white text-center space-y-5 shadow-xl animate-in zoom-in-95">
              <span className="text-5xl">🏆</span>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FDE047]">
                  STEP 9 OF 9 • LESSON SUMMARY
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold">
                  Lesson Mastered with Full Rewards!
                </h2>
                <p className="text-xs sm:text-sm opacity-90 max-w-md mx-auto">
                  {`Congratulations! You completed all exercises and drills for "${lesson?.title}".`}
                </p>
              </div>

              {/* Rewards Stats Card */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-center pt-2">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <span className="text-xl font-extrabold text-[#FDE047]">+{earnedXP || lesson?.xpReward || 35}</span>
                  <p className="text-[10px] uppercase font-bold opacity-80">XP Earned</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <span className="text-xl font-extrabold text-emerald-300">
                    {Math.round((quizScore / (quizQuestions.length || 1)) * 100)}%
                  </span>
                  <p className="text-[10px] uppercase font-bold opacity-80">Quiz Accuracy</p>
                </div>
              </div>

              {/* Audio Bonus Confirmation / Tip Banner */}
              {(listenedFullExplanation || audioBonusAwarded) ? (
                <div className="p-3 rounded-2xl bg-emerald-500/25 border border-emerald-300/40 text-emerald-100 text-xs font-semibold max-w-md mx-auto flex items-center justify-center gap-2">
                  <span>🎧</span>
                  <span>Audio Masterclass Completed: +10 XP bonus included in your rewards!</span>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-white/90 text-xs font-semibold max-w-md mx-auto flex items-center justify-center gap-2">
                  <span>💡</span>
                  <span>Tip: Next time, listen to the full audio masterclass to claim the +10 XP audio listener bonus!</span>
                </div>
              )}

              {/* Retention & Practice Recap Deck */}
              <div className="p-4 rounded-2xl bg-black/20 text-left text-xs space-y-2 max-w-md mx-auto">
                <span className="font-extrabold text-[#FDE047]">💡 Key Lesson Takeaways:</span>
                <ul className="space-y-1 list-disc list-inside opacity-90">
                  <li>Understand and practice the core formulas taught in "{lesson?.title}".</li>
                  <li>Speak in complete sentences rather than isolated words.</li>
                  <li>Regular daily speaking out loud builds neural pathways for spontaneous speech.</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    setStudyStep(0);
                    setListenedFullExplanation(false);
                    setAudioBonusAwarded(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs transition"
                >
                  🔄 Practice Again
                </button>
                <button
                  onClick={() => navigate(ROUTES.LESSONS)}
                  className="px-8 py-2.5 rounded-xl bg-white text-[#6c63ff] font-extrabold text-xs shadow-lg hover:bg-white/95 transition"
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
