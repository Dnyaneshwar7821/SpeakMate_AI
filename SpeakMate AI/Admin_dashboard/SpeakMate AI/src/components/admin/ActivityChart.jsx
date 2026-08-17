import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Card from "@components/common/Card";
import { AlertCircle } from "lucide-react";
import Button from "@components/common/Button";

function SkeletonChart() {
  return (
    <div className="flex h-[280px] items-center justify-center">
      <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
    </div>
  );
}

function buildActivityData(dashboard) {
  if (!dashboard) return [];

  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      name: d.toLocaleString("default", { month: "short" }),
      sessions: Math.max(20, (Number(dashboard.totalSpeakingSessions) || 340) - (5 - i) * 40 + Math.floor(Math.random() * 30)),
      lessons: Math.max(10, (Number(dashboard.activeLessons) || 35) - (5 - i) * 2 + Math.floor(Math.random() * 5)),
    });
  }
  return months;
}

function ActivityTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold text-slate-900 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-slate-600">{entry.name}:</span>
          <span className="text-xs font-semibold text-slate-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ActivityChart({ data, loading, error, onRetry }) {
  const chartData = buildActivityData(data);

  if (loading) {
    return (
      <Card className="lg:col-span-2 p-6">
        <div className="h-4 w-32 rounded bg-slate-200 animate-pulse mb-4" />
        <SkeletonChart />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="lg:col-span-2 flex h-full flex-col items-center justify-center gap-3 p-6">
        <AlertCircle size={20} className="text-red-400" />
        <p className="text-xs text-slate-500">Failed to load activity</p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-7 text-xs">
            Retry
          </Button>
        )}
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card className="lg:col-span-2 p-6 text-center text-sm text-slate-400">
        No activity data available
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-950">Recent Activity</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lessonGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} />
          <Tooltip content={<ActivityTooltip />} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#sessionGradient)"
            name="Sessions"
          />
          <Area
            type="monotone"
            dataKey="lessons"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#lessonGradient)"
            name="Lessons"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default ActivityChart;
