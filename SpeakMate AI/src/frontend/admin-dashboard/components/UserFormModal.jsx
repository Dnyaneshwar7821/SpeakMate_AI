import { useEffect, useState } from "react";
import Modal from "@components/common/Modal";
import Input from "@components/common/Input";
import Button from "@components/common/Button";
import {
    USER_STATUS_OPTIONS,
    USER_TYPE_OPTIONS,
    STANDARD_OPTIONS,
} from "@admin/data/adminUsersMockData";

const EMPTY_FORM = {
    name: "",
    email: "",
    role: "Learner",
    userType: USER_TYPE_OPTIONS[0],
    standard: STANDARD_OPTIONS[0],
    assignedTeacher: "",
    rollNo: "",
    schoolName: "",
};

const SELECT_CLASSES =
    "h-11 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20";

/**
 * admin-dashboard/components/UserFormModal.jsx
 *
 * Shared modal for both "Add User" and "Edit User" — mode decides
 * the copy and submit behavior; the form fields stay the same.
 *
 * Supports the new `userType` (general | school) and `standard` (1..10)
 * fields used by the All Users / School Users screens.
 */

const STANDARD_LABEL = (std) => {
    if (!std || Number.isNaN(std)) return "";
    const s = ["th", "st", "nd", "rd"];
    const v = std % 100;
    const suffix = s[(v - 20) % 10] || s[v] || s[0];
    return `${std}${suffix} Standard`;
};
export function UserFormModal({ isOpen, mode = "add", initialData, teachers = [], schools = [], isStudentForm = false, onClose, onSubmit }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;
        setForm({
            name: initialData?.name ?? "",
            email: initialData?.email ?? "",
            status: initialData?.status ?? "active",
            userType: initialData?.userType || (isStudentForm ? "school" : USER_TYPE_OPTIONS[0]),
            standard: initialData?.standard || STANDARD_OPTIONS[0],
            assignedTeacher: initialData?.assignedTeacher || (teachers.length > 0 ? teachers[0].name : ""),
            rollNo: initialData?.rollNo ?? "",
            schoolName: initialData?.schoolName || (schools.length > 0 ? schools[0] : ""),
        });
        setErrors({});
    }, [isOpen, initialData, teachers, schools]);

    const handleChange = (field) => (event) => {
        const value = field === "standard" ? Number(event.target.value) : event.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
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

                {isStudentForm && (
                    <Input
                        label="Roll Number"
                        placeholder="e.g. 10A01"
                        value={form.rollNo}
                        onChange={handleChange("rollNo")}
                        error={errors.rollNo}
                    />
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Role</span>
                        <span className="flex h-11 w-full items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)]">
                            Learner
                        </span>
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Status</span>
                        <select value={form.status} onChange={handleChange("status")} className={SELECT_CLASSES}>
                            {USER_STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status === "active" ? "Active" : "Inactive"}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">User Type</span>
                        <select value={form.userType} onChange={handleChange("userType")} className={SELECT_CLASSES}>
                            {USER_TYPE_OPTIONS.map((type) => (
                                <option key={type} value={type}>
                                    {type === "general" ? "General" : "School"}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                            Standard {form.userType === "school" ? "" : "(optional)"}
                        </span>
                        <select
                            value={form.standard}
                            onChange={handleChange("standard")}
                            className={SELECT_CLASSES}
                            disabled={form.userType !== "school"}
                        >
                            {STANDARD_OPTIONS.map((std) => (
                                <option key={std} value={std}>
                                    {STANDARD_LABEL(std)}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {form.userType === "school" && schools.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-1">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                                Assign School
                            </span>
                            <select
                                value={form.schoolName}
                                onChange={handleChange("schoolName")}
                                className={SELECT_CLASSES}
                            >
                                {schools.map((school) => (
                                    <option key={school} value={school}>
                                        {school}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}

                {teachers.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-1">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                                Assign Teacher
                            </span>
                            <select
                                value={form.assignedTeacher}
                                onChange={handleChange("assignedTeacher")}
                                className={SELECT_CLASSES}
                            >
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.name}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}

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
