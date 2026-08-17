import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Card from "@components/common/Card";

function SkeletonChart() {
  return (
    <div className="flex h-[300px] items-center justify-center">
      <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
    </div>
  );
}

export function SpeakingSessionsChart({ data, loading }) {
  if (loading) return <Card className="p-6"><SkeletonChart /></Card>;
  if (!data || data.length === 0) {
    return <Card className="p-6 text-center text-sm text-slate-400">No session data available</Card>;
  }

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-slate-950 mb-4">Speaking Sessions</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} interval={0} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
          />
          <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#sessionGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default SpeakingSessionsChart;