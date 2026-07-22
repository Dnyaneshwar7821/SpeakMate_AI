import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import Loader from "@components/common/Loader";
import ModulePageShell from "@components/common/ModulePageShell";
import { vocabularyMockData } from "@data/moduleMockData";

export function Vocabulary() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ModulePageShell title={vocabularyMockData.title} subtitle={vocabularyMockData.subtitle} badge={vocabularyMockData.badge}>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Loader label="Loading vocabulary cards" />
        </div>
      </ModulePageShell>
    );
  }

  return (
    <ModulePageShell
      title={vocabularyMockData.title}
      subtitle={vocabularyMockData.subtitle}
      badge={vocabularyMockData.badge}
      actions={<Button>Start review</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="grid gap-4 md:grid-cols-2">
          {vocabularyMockData.words.map((word) => (
            <Card key={word.term} className="p-5">
              <p className="text-lg font-black text-slate-950">{word.term}</p>
              <p className="mt-2 text-sm text-slate-600">{word.meaning}</p>
              <p className="mt-3 text-sm text-indigo-600">Example: {word.example}</p>
            </Card>
          ))}
        </motion.div>

        <Card className="p-6">
          <h2 className="text-lg font-black text-slate-950">Study plan</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {vocabularyMockData.goals.map((goal) => (
              <li key={goal} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {goal}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </ModulePageShell>
  );
}

export default Vocabulary;
