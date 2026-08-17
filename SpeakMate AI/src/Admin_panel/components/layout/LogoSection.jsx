import { Link } from "react-router-dom";

export function LogoSection({ align = "center" }) {
  return (
    <div className={`flex flex-col ${align === "center" ? "items-center text-center" : "items-start text-left"}`}>
      <Link to="/" className="inline-flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 text-base font-black text-white shadow-lg shadow-indigo-600/25">
          SM
        </span>
        <span className="text-xl font-black tracking-tight text-slate-950">SpeakMate AI</span>
      </Link>
    </div>
  );
}

export default LogoSection;
