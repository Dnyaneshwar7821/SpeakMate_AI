import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import Loader from "@components/common/Loader";
import ModulePageShell from "@components/common/ModulePageShell";
import { settingsMockData } from "@data/moduleMockData";

export function Settings() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ModulePageShell title={settingsMockData.title} subtitle={settingsMockData.subtitle} badge={settingsMockData.badge}>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Loader label="Loading settings" />
        </div>
      </ModulePageShell>
    );
  }

  return (
    <ModulePageShell title={settingsMockData.title} subtitle={settingsMockData.subtitle} badge={settingsMockData.badge} actions={<Button>Save changes</Button>}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {settingsMockData.options.map((option) => (
              <div key={option.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{option.label}</p>
                <p className="mt-1 font-semibold text-slate-950">{option.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </ModulePageShell>
  );
}

export default Settings;
