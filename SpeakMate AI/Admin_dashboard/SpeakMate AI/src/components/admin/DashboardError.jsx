import { AlertCircle, RefreshCw } from "lucide-react";
import Card from "@components/common/Card";
import Button from "@components/common/Button";

function DashboardError({ error, onRetry }) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <p className="text-base font-semibold text-slate-900">Failed to load dashboard</p>
      <p className="mt-1 text-sm text-slate-500 mb-5">{error || "An unexpected error occurred."}</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
        <RefreshCw size={14} /> Retry
      </Button>
    </Card>
  );
}

export default DashboardError;
