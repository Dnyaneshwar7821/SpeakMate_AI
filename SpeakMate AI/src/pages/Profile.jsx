import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function Profile() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "Alex Johnson");
  const [email, setEmail] = useState(user?.email || "alex@example.com");
  const [nativeLang, setNativeLang] = useState(user?.nativeLang || "Spanish");
  const [level, setLevel] = useState(user?.level || "B1");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateUser({ name, email, nativeLang, level });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="grid h-24 w-24 place-items-center rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 text-4xl font-black shadow-inner shrink-0">
          {name ? name.charAt(0).toUpperCase() : "U"}
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider">
            {level} Intermediate • Student
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{name}</h1>
          <p className="text-xs opacity-90">{email}</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-6">
        <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Personal Details & Preferences</h2>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold text-center">
            ✓ Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Native Language</label>
              <input
                type="text"
                value={nativeLang}
                onChange={(e) => setNativeLang(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Target CEFR Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
              >
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white text-xs font-extrabold shadow-md"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
