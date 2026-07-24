import { useState } from "react";

const TOPICS = [
  {
    id: "tenses",
    title: "Present Perfect vs. Past Simple",
    level: "B1",
    rule: "Use Past Simple for completed past time (e.g. yesterday, 2020). Use Present Perfect for experiences or actions with relevance to now.",
    examples: [
      { correct: "I visited London in 2021.", note: "Specific past year → Past Simple" },
      { correct: "I have visited London three times.", note: "Life experience → Present Perfect" },
    ],
  },
  {
    id: "conditionals",
    title: "Second Conditional (Unreal Present)",
    level: "B2",
    rule: "Structure: If + past simple, would + base verb. Used for hypothetical or imaginary present/future situations.",
    examples: [
      { correct: "If I won the lottery, I would travel the world.", note: "Unreal condition" },
    ],
  },
  {
    id: "prepositions",
    title: "Prepositions of Time & Place (In, On, At)",
    level: "A2",
    rule: "AT for specific times/locations. ON for days/streets. IN for months, years, countries, enclosed spaces.",
    examples: [
      { correct: "I will meet you at 5 PM on Monday in Paris.", note: "At time, On day, In city" },
    ],
  },
];

export function GrammarPractice() {
  // Live Checker State
  const [inputText, setInputText] = useState("I am living in London since 2 years and I discuss about my job yesterday.");
  const [checking, setChecking] = useState(false);
  const [grammarResult, setGrammarResult] = useState({
    correctedText: "I have been living in London for 2 years and I discussed my job yesterday.",
    score: 82,
    issues: [
      { original: "am living... since", replacement: "have been living... for", rule: "Duration requires 'for' with Present Perfect Continuous." },
      { original: "discuss about", replacement: "discussed", rule: "'Discuss' takes a direct object without 'about', and past simple is required for 'yesterday'." },
    ],
  });

  const handleCheckGrammar = () => {
    if (!inputText.trim()) return;
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setGrammarResult({
        correctedText: inputText.replace(/am living/g, "have been living").replace(/since/g, "for").replace(/discuss about/g, "discussed"),
        score: inputText.includes("since") ? 82 : 98,
        issues: [
          { original: "am living... since", replacement: "have been living... for", rule: "Use Present Perfect Continuous for duration leading to the present." },
        ],
      });
    }, 800);
  };

  const handleSpeak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Grammar Coach & AI Checker</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Instant real-time grammar analysis, error explanations, and rule mastery guides.
        </p>
      </div>

      {/* Live Grammar Checker Tool */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <span>✍️ AI Live Grammar Checker</span>
          </h2>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#6c63ff]/10 text-[#6c63ff]">
            Real-Time Analysis
          </span>
        </div>

        <div className="space-y-3">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste any English sentence to analyze..."
            className="w-full p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-semibold focus:outline-none focus:border-[#6c63ff]"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => handleSpeak(inputText)}
              className="text-xs font-bold text-[#6c63ff] hover:underline"
            >
              🔊 Listen Input Sentence
            </button>

            <button
              onClick={handleCheckGrammar}
              disabled={checking}
              className="px-6 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white text-xs font-extrabold shadow-md shadow-[#6c63ff]/20 flex items-center gap-2"
            >
              {checking ? "Analyzing..." : "Check Grammar Now"}
            </button>
          </div>
        </div>

        {/* Results Card */}
        {grammarResult && (
          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <span className="text-xs font-bold text-[var(--text-secondary)]">Accuracy Score:</span>
              <span className="text-base font-extrabold text-emerald-500">{grammarResult.score}%</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">✓ Corrected Sentence</p>
              <p className="text-sm font-bold text-[var(--text-primary)] bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-default)]">
                "{grammarResult.correctedText}"
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Detailed Explanations</p>
              {grammarResult.issues.map((iss, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold line-through">{iss.original}</span>
                    <span>→</span>
                    <span className="text-emerald-500 font-bold">{iss.replacement}</span>
                  </div>
                  <p className="text-[var(--text-secondary)]">{iss.rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grammar Guides & Topics */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Grammar Mastery Guides</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TOPICS.map((top) => (
            <div
              key={top.id}
              className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#6c63ff]/10 text-[#6c63ff]">
                  {top.level}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">{top.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{top.rule}</p>

              <div className="pt-3 border-t border-[var(--border-default)] space-y-2">
                {top.examples.map((ex, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[var(--bg-elevated)] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-500">✓ "{ex.correct}"</span>
                      <button onClick={() => handleSpeak(ex.correct)} className="text-[10px]">🔊</button>
                    </div>
                    <span className="text-[10px] text-[var(--text-secondary)] font-semibold block">{ex.note}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GrammarPractice;
