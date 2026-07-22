import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import Loader from "@components/common/Loader";
import ModulePageShell from "@components/common/ModulePageShell";
import { grammarPracticeMockData } from "@data/moduleMockData";

export function GrammarPractice() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ModulePageShell title={grammarPracticeMockData.title} subtitle={grammarPracticeMockData.subtitle} badge={grammarPracticeMockData.badge}>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Loader label="Loading grammar exercises" />
        </div>
      </ModulePageShell>
    );
  }

  return (
    <ModulePageShell
      title={grammarPracticeMockData.title}
      subtitle={grammarPracticeMockData.subtitle}
      badge={grammarPracticeMockData.badge}
      actions={<Button>Start quiz</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
          {grammarPracticeMockData.challenges.map((item) => (
            <Card key={item.title} className="p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-slate-950">{item.title}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{item.level}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{item.prompt}</p>
              <p className="mt-4 text-sm font-semibold text-emerald-600">Answer: {item.answer}</p>
            </Card>
          ))}
        </motion.div>

        <Card className="p-6">
          <h2 className="text-lg font-black text-slate-950">Focus areas</h2>
          <div className="mt-4 space-y-3">
            {grammarPracticeMockData.focusAreas.map((area) => (
              <div key={area} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {area}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ModulePageShell>
  );
}

export default GrammarPractice;
