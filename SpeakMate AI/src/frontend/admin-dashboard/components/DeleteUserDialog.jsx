import Modal from "@components/common/Modal";
import Button from "@components/common/Button";

/**
 * admin-dashboard/components/DeleteUserDialog.jsx
 *
 * Confirmation dialog shown before a user is removed.
 */
export function DeleteUserDialog({ isOpen, user, onClose, onConfirm }) {
    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete user" maxWidth="max-w-sm">
            <p className="text-sm text-[var(--text-secondary)]">
                Are you sure you want to delete <span className="font-semibold text-[var(--text-primary)]">{user.name}</span>?
                This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={() => onConfirm(user)}>
                    Delete
                </Button>
            </div>
        </Modal>
    );
}

export default DeleteUserDialog;
