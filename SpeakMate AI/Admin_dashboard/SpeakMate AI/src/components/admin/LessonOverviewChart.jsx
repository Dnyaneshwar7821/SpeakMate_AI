import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
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

export function LessonOverviewChart({ data, loading, error, onRetry }) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-4 w-32 rounded bg-slate-200 animate-pulse mb-4" />
        <SkeletonChart />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <AlertCircle size={20} className="text-red-400" />
        <p className="text-xs text-slate-500">Failed to load chart</p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-7 text-xs">
            Retry
          </Button>
        )}
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-slate-400">
        No lesson data available
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-950">Lesson Overview</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} interval={0} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
          />
          <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total" />
          <Bar dataKey="active" fill="#10b981" radius={[4, 4, 0, 0]} name="Active" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default LessonOverviewChart;
