import { useEffect, useState } from "react";
import Modal from "@components/common/Modal";
import Input from "@components/common/Input";
import Button from "@components/common/Button";
import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS } from "@admin/data/adminUsersMockData";

const EMPTY_FORM = { name: "", email: "", role: USER_ROLE_OPTIONS[0], status: "active" };

const SELECT_CLASSES =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

/**
 * admin-dashboard/components/UserFormModal.jsx
 *
 * Shared modal for both "Add User" and "Edit User" — mode decides
 * the copy and submit behavior; the form fields stay the same.
 */
export function UserFormModal({ isOpen, mode = "add", initialData, onClose, onSubmit }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;
        setForm(
            initialData
                ? {
                    name: initialData.name,
                    email: initialData.email,
                    role: initialData.role,
                    status: initialData.status,
                }
                : EMPTY_FORM,
        );
        setErrors({});
    }, [isOpen, initialData]);

    const handleChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const validate = () => {
        const nextErrors = {};
        if (!form.name.trim()) nextErrors.name = "Name is required";
        if (!form.email.trim()) nextErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = "Enter a valid email";
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validate()) return;
        onSubmit(form);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === "edit" ? "Edit user" : "Add new user"}
            description={
                mode === "edit"
                    ? "Update this user's details below."
                    : "Fill in the details to create a new user."
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Full name"
                    placeholder="e.g. Priya Sharma"
                    value={form.name}
                    onChange={handleChange("name")}
                    error={errors.name}
                />

                <Input
                    label="Email address"
                    type="email"
                    placeholder="e.g. priya@speakmate.ai"
                    value={form.email}
                    onChange={handleChange("email")}
                    error={errors.email}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Role</span>
                        <select value={form.role} onChange={handleChange("role")} className={SELECT_CLASSES}>
                            {USER_ROLE_OPTIONS.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
                        <select value={form.status} onChange={handleChange("status")} className={SELECT_CLASSES}>
                            {USER_STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status === "active" ? "Active" : "Inactive"}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="mt-2 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">{mode === "edit" ? "Save changes" : "Add user"}</Button>
                </div>
            </form>
        </Modal>
    );
}

export default UserFormModal;
