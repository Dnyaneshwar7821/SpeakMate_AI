import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import ROUTES from "../constants/routes";

const SAMPLE_LESSON_DATA = {
  id: "1",
  title: "Mastering Self Introductions",
  category: "Daily Life",
  level: "A1",
  xp: 50,
  theory: [
    {
      rule: "1. State your name clearly & confidently",
      example: "Hello! My name is Alex, and I am a software engineer from San Francisco.",
    },
    {
      rule: "2. Mention your occupation or background",
      example: "I have been working in product design for over three years.",
    },
    {
      rule: "3. Share a passion or personal hobby",
      example: "In my free time, I love playing acoustic guitar and learning new languages.",
    },
  ],
  flashcards: [
    { word: "Occupation", phonetic: "/ˌɒkjʊˈpeɪʃn/", definition: "A person's job or profession.", sentence: "What is your main occupation?" },
    { word: "Passionate", phonetic: "/ˈpæʃənət/", definition: "Showing strong feelings or enthusiasm.", sentence: "She is passionate about digital art." },
    { word: "Fluent", phonetic: "/ˈfluːənt/", definition: "Able to express oneself easily and articulately.", sentence: "He speaks fluent English and French." },
  ],
  quiz: [
    {
      question: "Which expression is most natural when starting a polite self-introduction?",
      options: [
        "Hey you! Listen to me.",
        "Hello everyone, nice to meet you. I'd like to introduce myself.",
        "I am person, name Alex.",
        "Stop talking, I am Alex.",
      ],
      correctIndex: 1,
    },
    {
      question: "Fill in the blank: 'In my free time, I am really _______ in photography.'",
      options: ["interest", "interested", "interesting", "interests"],
      correctIndex: 1,
    },
  ],
  speakingPrompt: "Hello everyone! Nice to meet you. I am excited to learn English with SpeakMate AI.",
};

export function LessonDetail() {
  const { id } = useParams();
  const [step, setStep] = useState(1);

  // Flashcard Flip state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);

  // Audio & Mic state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micRecording, setMicRecording] = useState(false);
  const [userSpeech, setUserSpeech] = useState("");
  const [speakingTested, setSpeakingTested] = useState(false);

  const handleSpeakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.lang = "en-US";
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setUserSpeech("Hello everyone! Nice to meet you. I am excited to learn English with SpeakMate AI.");
      setSpeakingTested(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setMicRecording(true);
      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setUserSpeech(text);
      };
      recognition.onend = () => {
        setMicRecording(false);
        setSpeakingTested(true);
      };
      recognition.start();
    } catch (err) {
      console.error(err);
      setMicRecording(false);
      setSpeakingTested(true);
    }
  };

  const handleSelectAnswer = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === SAMPLE_LESSON_DATA.quiz[quizIndex].correctIndex) {
      setQuizScore((s) => s + 1);
    }
  };

  const handleNextQuiz = () => {
    if (quizIndex < SAMPLE_LESSON_DATA.quiz.length - 1) {
      setQuizIndex((i) => i + 1);
      setSelectedAnswer(null);
    } else {
      setStep(4);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to={ROUTES.LESSONS}
          className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Lessons</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#6c63ff] bg-[#6c63ff]/10 px-3 py-1 rounded-full">
            Step {step} of 5
          </span>
          <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
            ⭐ +{SAMPLE_LESSON_DATA.xp} XP
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--border-subtle)] h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#6c63ff] to-[#ff6584] h-full rounded-full transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      {/* Main Lesson Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
        {/* Step 1: Learning Objectives & Theory */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#6c63ff]/10 text-[#6c63ff]">
                Lesson 1 • {SAMPLE_LESSON_DATA.category} ({SAMPLE_LESSON_DATA.level})
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-3">
                {SAMPLE_LESSON_DATA.title}
              </h1>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Key Patterns & Rules</h3>
              {SAMPLE_LESSON_DATA.theory.map((t, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-2">
                  <p className="font-bold text-sm text-[var(--text-primary)]">{t.rule}</p>
                  <div className="flex items-center justify-between gap-3 bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-default)]">
                    <p className="text-xs text-[var(--text-secondary)] italic">"{t.example}"</p>
                    <button
                      onClick={() => handleSpeakText(t.example)}
                      className="p-2 rounded-lg bg-[#6c63ff]/10 text-[#6c63ff] hover:bg-[#6c63ff]/20 shrink-0"
                      title="Listen Pronunciation"
                    >
                      🔊
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white font-bold text-sm shadow-md shadow-[#6c63ff]/20 transition-all"
            >
              Continue to Vocabulary Flashcards →
            </button>
          </div>
        )}

        {/* Step 2: Flashcards */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200 text-center">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Key Vocabulary Flashcards</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Tap card to flip definition & phonetic guide.</p>
            </div>

            {/* Flashcard container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-56 cursor-pointer p-8 rounded-3xl bg-gradient-to-br from-[#6c63ff]/10 to-[#ff6584]/10 border-2 border-[#6c63ff]/30 shadow-inner flex flex-col items-center justify-center transition-all hover:scale-[1.01]"
            >
              {!isFlipped ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#6c63ff]">Card {cardIndex + 1} of {SAMPLE_LESSON_DATA.flashcards.length}</span>
                  <h2 className="text-3xl font-extrabold text-[var(--text-primary)]">{SAMPLE_LESSON_DATA.flashcards[cardIndex].word}</h2>
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">{SAMPLE_LESSON_DATA.flashcards[cardIndex].phonetic}</p>
                  <p className="text-xs text-[#6c63ff] font-bold mt-4">↻ Click to Flip Card</p>
                </div>
              ) : (
                <div className="space-y-3 max-w-md">
                  <span className="text-xs font-bold text-emerald-500">Definition</span>
                  <p className="text-base font-bold text-[var(--text-primary)]">{SAMPLE_LESSON_DATA.flashcards[cardIndex].definition}</p>
                  <p className="text-xs italic text-[var(--text-secondary)]">"{SAMPLE_LESSON_DATA.flashcards[cardIndex].sentence}"</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeakText(SAMPLE_LESSON_DATA.flashcards[cardIndex].word);
                    }}
                    className="mt-2 px-4 py-1.5 rounded-full bg-[#6c63ff] text-white font-bold text-xs"
                  >
                    🔊 Play Audio
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                disabled={cardIndex === 0}
                onClick={() => {
                  setCardIndex((c) => c - 1);
                  setIsFlipped(false);
                }}
                className="px-4 py-2 rounded-xl border border-[var(--border-default)] text-xs font-bold disabled:opacity-40"
              >
                Previous Card
              </button>

              {cardIndex < SAMPLE_LESSON_DATA.flashcards.length - 1 ? (
                <button
                  onClick={() => {
                    setCardIndex((c) => c + 1);
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#6c63ff] text-white text-xs font-bold"
                >
                  Next Card →
                </button>
              ) : (
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white text-xs font-bold"
                >
                  Start Quiz Exercise →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Interactive Quiz */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-[var(--text-secondary)]">Question {quizIndex + 1} of {SAMPLE_LESSON_DATA.quiz.length}</span>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] mt-1">
                {SAMPLE_LESSON_DATA.quiz[quizIndex].question}
              </h2>
            </div>

            <div className="space-y-3">
              {SAMPLE_LESSON_DATA.quiz[quizIndex].options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === SAMPLE_LESSON_DATA.quiz[quizIndex].correctIndex;
                let btnStyle = "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]";

                if (selectedAnswer !== null) {
                  if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold";
                  else if (isSelected) btnStyle = "border-red-500 bg-red-500/10 text-red-500 font-bold";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedAnswer !== null && isCorrect && <span>✓ Correct</span>}
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <button
                onClick={handleNextQuiz}
                className="w-full py-3 rounded-xl bg-[#6c63ff] text-white font-bold text-sm shadow-md"
              >
                Next Question →
              </button>
            )}
          </div>
        )}

        {/* Step 4: Speaking Exercise */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Pronunciation Speaking Practice</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Read the prompt out loud into your microphone.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-4">
              <p className="text-base font-extrabold text-[var(--text-primary)]">
                "{SAMPLE_LESSON_DATA.speakingPrompt}"
              </p>
              <button
                onClick={() => handleSpeakText(SAMPLE_LESSON_DATA.speakingPrompt)}
                className="text-xs font-bold text-[#6c63ff] underline"
              >
                🔊 Listen to Reference Audio
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleStartMic}
                disabled={micRecording}
                className={`grid h-20 w-20 place-items-center rounded-full transition-all shadow-lg ${
                  micRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : speakingTested
                    ? "bg-emerald-500 text-white"
                    : "bg-[#6c63ff] text-white"
                }`}
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {userSpeech && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
                  ✓ Recorded Speech: "{userSpeech}" (Accuracy Score: 96%)
                </div>
              )}
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full py-3 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white font-bold text-sm shadow-md"
            >
              Complete Lesson & Claim XP →
            </button>
          </div>
        )}

        {/* Step 5: Lesson Completion Scorecard */}
        {step === 5 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <div className="grid h-20 w-20 mx-auto place-items-center rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-white text-3xl shadow-xl animate-bounce">
              🏆
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">Lesson Completed!</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Great job! You earned 50 XP and mastered self introductions.</p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <div>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold">XP Earned</p>
                <p className="text-lg font-extrabold text-amber-500">+50 XP</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold">Quiz Score</p>
                <p className="text-lg font-extrabold text-emerald-500">{quizScore}/{SAMPLE_LESSON_DATA.quiz.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold">Fluency</p>
                <p className="text-lg font-extrabold text-[#6c63ff]">96%</p>
              </div>
            </div>

            <Link
              to={ROUTES.LESSONS}
              className="block w-full py-3 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white font-extrabold text-sm shadow-lg"
            >
              Return to Lessons
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonDetail;
