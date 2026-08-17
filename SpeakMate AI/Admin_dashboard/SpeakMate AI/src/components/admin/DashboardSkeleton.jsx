import Card from "@components/common/Card";

function MetricSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-16 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card className="p-6">
      <div className="h-4 w-32 rounded bg-slate-200 animate-pulse mb-4" />
      <div className="h-[280px] bg-slate-100 rounded-xl animate-pulse" />
    </Card>
  );
}

function TableSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="h-4 w-10 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
            <div className="h-6 w-16 rounded bg-slate-200 animate-pulse" />
            <div className="h-6 w-20 rounded bg-slate-200 animate-pulse" />
            <div className="h-8 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="h-8 w-24 rounded bg-slate-200 animate-pulse" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function WidgetSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
        <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-slate-100 animate-pulse" />
      </div>
    </Card>
  );
}

function QuickActionSkeleton() {
  return (
    <Card className="h-full p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-24 rounded bg-slate-200 animate-pulse" />
          <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
        <div className="h-10 w-64 rounded bg-slate-200 animate-pulse" />
        <div className="h-4 w-96 rounded bg-slate-200 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="h-6 w-40 rounded bg-slate-200 animate-pulse" />
            <TableSkeleton />
          </div>
        </div>
        <div className="space-y-6">
          <WidgetSkeleton />
          <WidgetSkeleton />
          <WidgetSkeleton />
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-6 w-32 rounded bg-slate-200 animate-pulse" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <QuickActionSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
