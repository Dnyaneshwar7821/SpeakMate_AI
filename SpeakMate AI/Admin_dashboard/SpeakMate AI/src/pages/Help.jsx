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
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Help & Support</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Frequently asked questions and direct support contact.</p>
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Frequently Asked Questions</h2>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm cursor-pointer"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-bold text-sm text-[var(--text-primary)]">{faq.q}</h3>
                <span className="text-lg font-bold text-[#6c63ff]">{openFaq === idx ? "−" : "+"}</span>
              </div>
              {openFaq === idx && (
                <p className="text-xs text-[var(--text-secondary)] mt-3 pt-3 border-t border-[var(--border-subtle)] leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support Contact Form */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
        <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Contact Support Team</h2>

        {contactSubmitted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 text-xs font-bold text-center">
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
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Subject</label>
              <input
                type="text"
                placeholder="How can we help?"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Message</label>
              <textarea
                rows={4}
                placeholder="Describe your issue or question..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white font-bold text-xs shadow-md"
            >
              Submit Support Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Help;
