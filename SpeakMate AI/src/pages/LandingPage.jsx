import { Link } from "react-router-dom";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import ROUTES from "@constants/routes";

const steps = [
  {
    title: "Choose a speaking goal",
    text: "Practice interviews, travel conversations, meetings, or daily English with guided prompts.",
  },
  {
    title: "Speak naturally",
    text: "Use your voice and get supportive feedback on pronunciation, grammar, and clarity.",
  },
  {
    title: "Improve every session",
    text: "Track streaks, review weak spots, and turn short daily practice into real confidence.",
  },
];

export function LandingPage() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
            AI-powered English speaking coach
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Speak English with confidence, one focused session at a time.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            SpeakMate AI helps learners practice real conversations, correct grammar, improve pronunciation, and build a daily habit without pressure.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={ROUTES.REGISTER}>
              <Button className="w-full sm:w-auto">Start free practice</Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button variant="secondary" className="w-full sm:w-auto">I already have an account</Button>
            </Link>
          </div>
        </div>

        <Card className="overflow-hidden p-5">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-200">Live practice</p>
                <p className="text-xs text-slate-400">Daily conversation drill</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                12 min
              </span>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-slate-300">Learner</p>
                <p className="mt-1 font-semibold">I am preparing for a client meeting tomorrow.</p>
              </div>
              <div className="rounded-2xl bg-indigo-500 p-4">
                <p className="text-sm text-indigo-100">SpeakMate AI</p>
                <p className="mt-1 font-semibold">Good sentence. Try adding one detail about your meeting goal.</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xl font-black">86%</p>
                  <p className="text-xs text-slate-400">Clarity</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xl font-black">7</p>
                  <p className="text-xs text-slate-400">Streak</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xl font-black">A2</p>
                  <p className="text-xs text-slate-400">Level</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">How it works</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Simple practice flow for everyday fluency
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title} className="p-6">
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-sm font-black text-indigo-700">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default LandingPage;
