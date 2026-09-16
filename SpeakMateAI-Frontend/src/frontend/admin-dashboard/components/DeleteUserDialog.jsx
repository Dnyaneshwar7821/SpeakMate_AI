import Modal from "@components/common/Modal";
import Button from "@components/common/Button";
import { Loader2 } from "lucide-react";

/**
 * admin-dashboard/components/DeleteUserDialog.jsx
 *
 * Confirmation dialog shown before a user is removed.
 */
export function DeleteUserDialog({
    isOpen,
    user,
    isDeleting = false,
    title = "Delete user",
    onClose,
    onConfirm
}) {
    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={() => !isDeleting && onClose()} title={title} maxWidth="max-w-sm">
            <p className="text-sm text-[var(--text-secondary)]">
                Are you sure you want to delete <span className="font-semibold text-[var(--text-primary)]">{user.name}</span>?
                This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
                    Cancel
                </Button>
                <Button
                    variant="danger"
                    onClick={() => onConfirm(user)}
                    disabled={isDeleting}
                    isLoading={isDeleting}
                    loadingText="Deleting..."
                    className="min-w-[100px] flex items-center justify-center gap-2"
                >
                    {isDeleting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                            <span>Deleting...</span>
                        </>
                    ) : (
                        "Delete"
                    )}
                </Button>
            </div>
        </Modal>
    );
}

export default DeleteUserDialog;
