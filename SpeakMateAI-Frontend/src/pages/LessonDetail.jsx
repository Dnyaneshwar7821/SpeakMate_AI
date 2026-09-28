import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ROUTES from "../constants/routes";
import { speakGlobalText } from "../utils/speechHelper";
import { lessonModuleService, aiService } from "../services/appServices";
import { recordLessonCompleted } from "../utils/progressTracker";
import { findCurriculumLesson, MASTER_LESSONS } from "../constants/masterCurriculum";

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

  // Step 2: Auto AI Teaching & XP Condition Tracking
  const [aiTeachContent, setAiTeachContent] = useState("");
  const [aiTeachLoading, setAiTeachLoading] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [listenedFullExplanation, setListenedFullExplanation] = useState(false);
  const [explanationSkippedMidway, setExplanationSkippedMidway] = useState(false);

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
    }

    lessonModuleService
      .detail(id)
      .then((data) => {
        setLesson((prev) => ({
          ...(curr || {}),
          ...data,
          title: curr?.title || data?.title || prev?.title,
          category: curr?.category || data?.category || prev?.category,
          level: curr?.level || data?.level || prev?.level,
          description: curr?.description || data?.description || prev?.description,
          objectives: data?.objectives && parseArrayField(data.objectives).length > 0 ? parseArrayField(data.objectives) : curr?.objectives,
          skills: data?.skills && parseArrayField(data.skills).length > 0 ? parseArrayField(data.skills) : curr?.skills,
          checkQuestion: curr?.checkQuestion || prev?.checkQuestion,
          guidedPractice: curr?.guidedPractice || prev?.guidedPractice,
          speakingDrill: curr?.speakingDrill || prev?.speakingDrill,
          speakingDrills: curr?.speakingDrills || prev?.speakingDrills,
          quiz: curr?.quiz || prev?.quiz,
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

  // Step 2: Automatic voice read-aloud when entering Step 2
  useEffect(() => {
    if (!showStudy || studyStep !== 1 || !aiTeachContent) return;

    // Autoplay voice as requested
    if (!listenedFullExplanation) {
      setIsAiSpeaking(true);
      speakGlobalText(aiTeachContent, 1.0, {
        onend: () => {
          setIsAiSpeaking(false);
          setListenedFullExplanation(true);
          setExplanationSkippedMidway(false);
        },
      });
    }
  }, [showStudy, studyStep, aiTeachContent]);

  // Sync step progress with backend
  useEffect(() => {
    if (showStudy && lesson?.id && studyStep > 0 && studyStep < 8) {
      const progressPercent = Math.min(95, Math.round(((studyStep + 1) / 9) * 100));
      lessonModuleService
        .updateProgress({
          lessonId: Number(lesson.id) || lesson.id,
          progressPercent,
          lastSectionIndex: studyStep,
          timeSpentMinutes: 1,
        })
        .catch(() => null);
    }
  }, [showStudy, studyStep, lesson?.id]);

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
    setExplanationSkippedMidway(false);
    setShowStudy(true);
    setStudyStep(0); // Starts at Step 0 (Overview & Objectives)
  };

  // Toggle voice playback in Step 2 with XP tracking
  const handleToggleTutorVoice = () => {
    if (isAiSpeaking) {
      stopAllSpeech();
      if (!listenedFullExplanation) {
        setExplanationSkippedMidway(true);
      }
    } else {
      setIsAiSpeaking(true);
      speakGlobalText(aiTeachContent, 1.0, {
        onend: () => {
          setIsAiSpeaking(false);
          setListenedFullExplanation(true);
          setExplanationSkippedMidway(false);
        },
      });
    }
  };

  // Step 2 to Step 3 transition with XP gate warning check
  const handleAdvanceFromStep2 = () => {
    if (isAiSpeaking) {
      stopAllSpeech();
      if (!listenedFullExplanation) {
        setExplanationSkippedMidway(true);
      }
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

          {/* STEP 1 (Step 2 of 9): Core Concept Teaching with Voice Autoplay & Full-Listening XP Gate */}
          {studyStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6c63ff]">
                    STEP 2 • COMPREHENSIVE MASTERCLASS
                  </span>
                  <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                    🎓 AI Tutor Core Concept Explanation
                  </h2>
                </div>
                <button
                  onClick={handleToggleTutorVoice}
                  className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold transition flex items-center gap-1.5 ${
                    isAiSpeaking ? "bg-red-500 hover:bg-red-600" : "bg-[#6c63ff] hover:bg-[#5a52e0]"
                  }`}
                >
                  <span>{isAiSpeaking ? "⏸️ Pause Audio" : "🔊 Listen Full Masterclass"}</span>
                </button>
              </div>

              {/* XP Eligibility Status Pill */}
              {listenedFullExplanation ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <span>✅</span>
                  <span>Full Masterclass Completed! You have unlocked full XP eligibility for this lesson.</span>
                </div>
              ) : explanationSkippedMidway ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs font-bold text-amber-700">
                  <span>⚠️</span>
                  <span>
                    Voice explanation paused/skipped midway. You can continue practicing, but 0 XP will be awarded for this session because the full tutor explanation was not completed.
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/20 flex items-center gap-2 text-xs font-bold text-[#6c63ff]">
                  <span>🎧</span>
                  <span>
                    AI Tutor is reading the full lesson explanation. Listen until the end to unlock your +{lesson?.xpReward || 35} XP reward!
                  </span>
                </div>
              )}

              {aiTeachLoading ? (
                <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] text-center text-xs font-bold text-[#6c63ff] animate-pulse">
                  AI Tutor generating customized lesson concept...
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-primary)] whitespace-pre-line leading-relaxed max-h-[380px] overflow-y-auto">
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

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStudyStep(0)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold hover:bg-[var(--border-default)] transition"
                >
                  ← Back to Overview
                </button>
                <button
                  onClick={handleAdvanceFromStep2}
                  className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold hover:bg-[#5a52e0] transition"
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
                          // XP Gate check
                          if (listenedFullExplanation) {
                            const baseXP = (lesson?.xpReward || 35);
                            const bonus = quizScore * (quizLevel === "Advanced" ? 10 : quizLevel === "Intermediate" ? 7 : 5);
                            const total = Math.max(20, baseXP + bonus - blankPenalty);
                            setEarnedXP(total);
                            recordLessonCompleted(lesson?.title || "English Lesson");
                            if (lesson?.id) {
                              lessonModuleService.complete(Number(lesson.id) || lesson.id).catch((err) => {
                                console.warn("Backend lesson complete sync error:", err);
                              });
                            }
                          } else {
                            setEarnedXP(0);
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

          {/* STEP 8 (Step 9 of 9): Lesson Summary & Mastery Rewards with XP Gate */}
          {studyStep === 8 && (
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#6c63ff] to-[#ff6584] text-white text-center space-y-5 shadow-xl animate-in zoom-in-95">
              <span className="text-5xl">{listenedFullExplanation ? "🏆" : "⚠️"}</span>
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FDE047]">
                  STEP 9 OF 9 • LESSON SUMMARY
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold">
                  {listenedFullExplanation ? "Lesson Mastered with Full Rewards!" : "Practice Session Completed"}
                </h2>
                <p className="text-xs sm:text-sm opacity-90 max-w-md mx-auto">
                  {listenedFullExplanation
                    ? `You successfully listened to the AI Tutor masterclass and completed all 9 steps of "${lesson?.title}"!`
                    : `You completed the practice exercises for "${lesson?.title}".`}
                </p>
              </div>

              {/* XP Condition Gate Feedback Card */}
              {!listenedFullExplanation ? (
                <div className="p-4 rounded-2xl bg-amber-500/25 border border-amber-300/40 text-amber-100 text-xs font-semibold max-w-md mx-auto space-y-1">
                  <p className="font-extrabold text-white text-sm">⚡ 0 XP Awarded for this Session</p>
                  <p>
                    You paused or skipped the AI Tutor voice explanation in Step 2. To earn your +{lesson?.xpReward || 35} XP reward and keep your streak active, re-open this lesson and listen to the complete masterclass!
                  </p>
                </div>
              ) : (
                /* Rewards Stats Card */
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
                    setExplanationSkippedMidway(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs transition"
                >
                  🔄 Re-take Lesson (Earn Full XP)
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
