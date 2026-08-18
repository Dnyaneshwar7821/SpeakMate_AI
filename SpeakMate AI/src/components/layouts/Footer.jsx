import { Link } from "react-router-dom";
import ROUTES from "../../constants/routes";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-default)] bg-[var(--bg-surface)]/60 backdrop-blur-md py-8 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#FF6584] text-white font-black text-xs shadow-md">
            SM
          </span>
          <p className="text-xs sm:text-sm font-bold text-[var(--text-secondary)]">
            © {new Date().getFullYear()} <span className="text-[var(--text-primary)] font-black">SpeakMate AI</span>. Built for accelerated English fluency.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs font-bold text-[var(--text-secondary)]">
          <Link to={ROUTES.ABOUT} className="hover:text-[#6C63FF] transition-colors">About Us</Link>
          <Link to={ROUTES.HELP} className="hover:text-[#6C63FF] transition-colors">Help & FAQ</Link>
          <Link to={ROUTES.SETTINGS} className="hover:text-[#6C63FF] transition-colors">Voice Settings</Link>
          <span className="flex items-center gap-1 text-emerald-500 font-extrabold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Speech Engine Ready
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
