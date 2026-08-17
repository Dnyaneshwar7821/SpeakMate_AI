import Modal from "@components/common/Modal";
import Button from "@components/common/Button";
import { LogOut } from "lucide-react";

/**
 * admin-dashboard/components/LogoutDialog.jsx
 *
 * Confirmation popup shown before a super admin logs out.
 *  - Cancel closes the popup.
 *  - Logout calls onConfirm (which logs out + redirects to Login).
 */
export function LogoutDialog({ isOpen, onClose, onConfirm }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log out" maxWidth="max-w-sm">
            <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-500">
                    <LogOut className="h-5 w-5" />
                </span>
                <p className="text-sm leading-6 text-slate-600">
                    Are you sure you want to log out of the Super Admin Console? You will be
                    redirected to the login page.
                </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="button" variant="danger" onClick={onConfirm}>
                    Logout
                </Button>
            </div>
        </Modal>
    );
}

export default LogoutDialog;
