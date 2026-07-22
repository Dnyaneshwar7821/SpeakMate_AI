import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import Loader from "@components/common/Loader";
import ModulePageShell from "@components/common/ModulePageShell";
import { speakingPracticeMockData } from "@data/moduleMockData";

export function SpeakingPractice() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ModulePageShell title={speakingPracticeMockData.title} subtitle={speakingPracticeMockData.subtitle} badge={speakingPracticeMockData.badge}>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Loader label="Preparing your speaking practice" />
        </div>
      </ModulePageShell>
    );
  }

  return (
    <ModulePageShell
      title={speakingPracticeMockData.title}
      subtitle={speakingPracticeMockData.subtitle}
      badge={speakingPracticeMockData.badge}
      actions={[
        <Button key="start">Start today</Button>,
        <Button key="review" variant="secondary">Review notes</Button>,
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Card className="overflow-hidden p-6">
            <div className="rounded-2xl bg-slate-950 p-6 text-white">
              <p className="text-sm font-semibold text-indigo-200">Today’s focus</p>
              <h2 className="mt-2 text-2xl font-black">Practice a confident introduction</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                Speak slowly, add one detail, and describe your experience in a calm and natural way.
              </p>
            </div>
          </Card>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {speakingPracticeMockData.highlights.map((item) => (
              <Card key={item.label} className="p-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-lg font-black text-slate-950">{item.value}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-black text-slate-950">Practice drills</h2>
            <div className="mt-4 space-y-3">
              {speakingPracticeMockData.drills.map((drill) => (
                <div key={drill.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-950">{drill.title}</p>
                    <span className="text-sm text-indigo-600">{drill.duration}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{drill.description}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{drill.difficulty}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-black text-slate-950">Coach tips</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {speakingPracticeMockData.tips.map((tip) => (
                <li key={tip} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </ModulePageShell>
  );
}

export default SpeakingPractice;
