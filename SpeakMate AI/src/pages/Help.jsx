import { useState } from "react";

const FAQS = [
  {
    q: "How does SpeakMate AI evaluate my English speaking?",
    a: "SpeakMate AI uses advanced Speech-to-Text and AI natural language evaluation to analyze your fluency, pronunciation accuracy, vocabulary usage, and grammatical correctness in real-time.",
  },
  {
    q: "Can I use microphone voice recording on mobile browsers?",
    a: "Yes! SpeakMate AI leverages the native browser Web Speech API on desktop and mobile browsers (Chrome, Safari, Edge) to recognize your voice effortlessly.",
  },
  {
    q: "What are CEFR levels (A1 to C2)?",
    a: "CEFR is the international standard for describing language ability. A1/A2 is beginner/elementary, B1/B2 is intermediate, and C1/C2 is advanced/mastery.",
  },
];

export function Help() {
  const [openFaq, setOpenFaq] = useState(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-2">
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white shadow-2xl space-y-2 border border-white/10">
        <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-amber-300 border border-white/20">
          💡 Knowledge Base & Support
        </span>
        <h1 className="text-2xl sm:text-3xl font-black">Help & FAQ Center</h1>
        <p className="text-xs sm:text-sm text-indigo-200 font-medium">Frequently asked questions and direct support contact.</p>
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-[var(--text-primary)]">Frequently Asked Questions</h2>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl glass-card glass-card-hover border border-[var(--border-default)] shadow-sm cursor-pointer transition-all"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-black text-sm text-[var(--text-primary)]">{faq.q}</h3>
                <span className="text-xl font-black text-[#6C63FF]">{openFaq === idx ? "−" : "+"}</span>
              </div>
              {openFaq === idx && (
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-3 pt-3 border-t border-[var(--border-default)] leading-relaxed animate-in fade-in duration-150">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support Contact Form */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-[var(--border-default)] shadow-xl space-y-5">
        <h2 className="text-xl font-black text-[var(--text-primary)]">Contact Support Team</h2>

        {contactSubmitted ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black text-center">
            ✓ Message sent! Our team will respond within 24 hours.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setContactSubmitted(true);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] mb-1.5">Subject</label>
              <input
                type="text"
                placeholder="How can we help?"
                required
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] mb-1.5">Message</label>
              <textarea
                rows={4}
                placeholder="Describe your issue or question..."
                required
                className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white font-black text-xs shadow-xl shadow-[#6C63FF]/25 hover:scale-105 active:scale-95 transition-all"
            >
              Submit Support Request →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Help;
