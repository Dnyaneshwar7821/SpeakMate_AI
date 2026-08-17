import { motion } from "framer-motion";
import Card from "@components/common/Card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Card className="border border-slate-200 p-3 shadow-xl">
      <p className="text-xs font-bold text-slate-900 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="font-medium text-slate-700">{entry.name}:</span>
          <span className="font-bold text-slate-900">{entry.value} sessions</span>
        </div>
      ))}
    </Card>
  );
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Card className="border border-slate-200 p-3 shadow-xl">
      <p className="text-xs font-bold text-slate-900 mb-1">{label}</p>
      <p className="text-sm font-black text-slate-900">{payload[0].value}%</p>
    </Card>
  );
}

export function ChartsSection({ chartData, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6">
            <div className="h-4 w-40 rounded bg-slate-200 animate-pulse mb-6" />
            <div className="h-64 w-full rounded bg-slate-100 animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  if (!chartData) return null;

  const activityData = chartData.monthlyActivity || [];
  const skillData = chartData.skillDistribution || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="grid grid-cols-1 gap-4 lg:grid-cols-2"
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-950">Learning Activity</h3>
            <p className="text-xs text-slate-500 mt-0.5">Monthly sessions across modules</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
            Year to date
          </span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpeaking" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGrammar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVocab" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorListening" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px", fontWeight: 600, paddingTop: 16 }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="speaking"
                name="Speaking"
                stroke="#4f46e5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSpeaking)"
              />
              <Area
                type="monotone"
                dataKey="grammar"
                name="Grammar"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorGrammar)"
              />
              <Area
                type="monotone"
                dataKey="vocab"
                name="Vocabulary"
                stroke="#d97706"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVocab)"
              />
              <Area
                type="monotone"
                dataKey="listening"
                name="Listening"
                stroke="#0891b2"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorListening)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-950">Skill Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Time spent by category</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
            Total hours
          </span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(15, 23, 42, 0.02)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                {skillData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}

export default ChartsSection;
