import { AlertTriangle } from "lucide-react";
import Card from "@components/common/Card";
import Button from "@components/common/Button";

export function DeleteConfirmDialog({ open, userName, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <Card className="relative z-10 w-full max-w-md p-0 overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Delete User</h2>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-slate-900">{userName}</span>? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20">
            Delete User
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default DeleteConfirmDialog;
