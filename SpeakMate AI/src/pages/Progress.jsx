import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "@components/common/Card";
import Loader from "@components/common/Loader";
import ModulePageShell from "@components/common/ModulePageShell";
import { progressMockData } from "@data/moduleMockData";

export function Progress() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ModulePageShell title={progressMockData.title} subtitle={progressMockData.subtitle} badge={progressMockData.badge}>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Loader label="Loading your progress" />
        </div>
      </ModulePageShell>
    );
  }

  return (
    <ModulePageShell title={progressMockData.title} subtitle={progressMockData.subtitle} badge={progressMockData.badge}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="grid gap-4 md:grid-cols-3">
          {progressMockData.metrics.map((metric) => (
            <Card key={metric.label} className="p-5">
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{metric.value}</p>
              <p className="mt-2 text-sm text-emerald-600">{metric.detail}</p>
            </Card>
          ))}
        </motion.div>

        <Card className="p-6">
          <h2 className="text-lg font-black text-slate-950">Recent milestones</h2>
          <div className="mt-4 space-y-3">
            {progressMockData.milestones.map((milestone) => (
              <div key={milestone.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{milestone.title}</p>
                <p className="mt-1 text-sm text-slate-500">{milestone.date}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ModulePageShell>
  );
}

export default Progress;
