import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import Loader from "@components/common/Loader";
import ModulePageShell from "@components/common/ModulePageShell";
import { listeningPracticeMockData } from "@data/moduleMockData";

export function ListeningPractice() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ModulePageShell title={listeningPracticeMockData.title} subtitle={listeningPracticeMockData.subtitle} badge={listeningPracticeMockData.badge}>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Loader label="Loading listening drills" />
        </div>
      </ModulePageShell>
    );
  }

  return (
    <ModulePageShell
      title={listeningPracticeMockData.title}
      subtitle={listeningPracticeMockData.subtitle}
      badge={listeningPracticeMockData.badge}
      actions={<Button>Start listening drill</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
          {listeningPracticeMockData.lessons.map((lesson) => (
            <Card key={lesson.title} className="p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-slate-950">{lesson.title}</h2>
                <span className="text-sm font-semibold text-indigo-600">{lesson.duration}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{lesson.excerpt}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{lesson.level}</p>
            </Card>
          ))}
        </motion.div>

        <Card className="p-6">
          <h2 className="text-lg font-black text-slate-950">Listening tips</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {listeningPracticeMockData.tips.map((tip) => (
              <li key={tip} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </ModulePageShell>
  );
}

export default ListeningPractice;
