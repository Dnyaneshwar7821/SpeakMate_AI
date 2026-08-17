import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import Loader from "@components/common/Loader";
import ModulePageShell from "@components/common/ModulePageShell";
import { fluentAIMockData } from "@data/moduleMockData";
import {
  MessageSquare,
  FileText,
  BookOpen,
  Sparkles,
  Mic,
  HelpCircle,
  Send,
} from "lucide-react";

const iconMap = {
  MessageSquare,
  FileText,
  BookOpen,
  Sparkles,
  Mic,
  HelpCircle,
};

function ToolCard({ tool, onSelect, selected }) {
  const IconComponent = iconMap[tool.icon] || MessageSquare;

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(tool)}
      className={`w-full rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-indigo-500 bg-indigo-50 shadow-md"
          : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            selected ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          <IconComponent size={20} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-950">{tool.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{tool.description}</p>
        </div>
      </div>
    </motion.button>
  );
}

function PracticeArea({ tool }) {
  const [draft, setDraft] = useState(tool.prompt);
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRun = () => {
    setIsProcessing(true);
    setOutput("");
    window.setTimeout(() => {
      setIsProcessing(false);
      setOutput(`AI result for "${tool.title}": Your input has been processed successfully.`);
    }, 900);
  };

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-slate-950 mb-4">{tool.title}</h3>
      <label className="block text-xs font-medium text-slate-500 mb-1">Input</label>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        className="mb-4 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white"
      />
      <div className="flex items-center justify-between">
        <Button size="sm" onClick={handleRun} disabled={isProcessing}>
          <Send size={14} className="mr-1" />
          {isProcessing ? "Thinking..." : "Run"}
        </Button>
        <span className="text-xs text-slate-400">{draft.length} chars</span>
      </div>
      {output && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-700"
        >
          {output}
        </motion.div>
      )}
    </Card>
  );
}

export function FluentAI() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedToolId, setSelectedToolId] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedTool = useMemo(
    () => fluentAIMockData.tools.find((tool) => tool.id === selectedToolId) || null,
    [selectedToolId],
  );

  if (isLoading) {
    return (
      <ModulePageShell title={fluentAIMockData.title} subtitle={fluentAIMockData.subtitle} badge={fluentAIMockData.badge}>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Loader label="Loading FluentAI coach" />
        </div>
      </ModulePageShell>
    );
  }

  return (
    <ModulePageShell
      title={fluentAIMockData.title}
      subtitle={fluentAIMockData.subtitle}
      badge={fluentAIMockData.badge}
      actions={<Button>Start practice</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {fluentAIMockData.tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onSelect={setSelectedToolId}
                selected={selectedToolId === tool.id}
              />
            ))}
          </div>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-950 mb-2">Recent sessions</h3>
            <div className="divide-y divide-slate-100">
              {fluentAIMockData.recentSessions.map((session) => (
                <div key={session.title} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{session.title}</p>
                    <p className="text-xs text-slate-500">{session.time}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{session.score}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <div className="space-y-6">
          {selectedTool ? (
            <PracticeArea tool={selectedTool} />
          ) : (
            <Card className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-sm text-slate-500">
              <Sparkles size={28} className="text-indigo-400" />
              <p>Select a tool from the list to start practicing.</p>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-lg font-black text-slate-950">Fluency tips</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Speak slowly and add one detail to each answer.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Use linking words like however, moreover, and furthermore.
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Record yourself and review pronunciation after each session.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </ModulePageShell>
  );
}

export default FluentAI;