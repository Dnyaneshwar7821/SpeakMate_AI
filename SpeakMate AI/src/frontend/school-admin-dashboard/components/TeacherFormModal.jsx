import { useEffect, useState } from "react";
import Modal from "@components/common/Modal";
import Input from "@components/common/Input";
import Button from "@components/common/Button";

const EMPTY_FORM = {
    name: "",
    email: "",
    subject: "",
    status: "active",
};

const SELECT_CLASSES =
    "h-11 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20";

export function TeacherFormModal({ isOpen, mode = "add", initialData, onClose, onSubmit }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;
        setForm({
            name: initialData?.name ?? "",
            email: initialData?.email ?? "",
            subject: initialData?.subject ?? "",
            status: initialData?.status ?? "active",
        });
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
        if (!form.subject.trim()) nextErrors.subject = "Subject is required";
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
            title={mode === "edit" ? "Edit Teacher" : "Add New Teacher"}
            description={
                mode === "edit"
                    ? "Update this teacher's details below."
                    : "Fill in the details to add a new teacher."
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Full name"
                    placeholder="e.g. Mr. Sharma"
                    value={form.name}
                    onChange={handleChange("name")}
                    error={errors.name}
                />

                <Input
                    label="Email address"
                    type="email"
                    placeholder="e.g. sharma@school.edu"
                    value={form.email}
                    onChange={handleChange("email")}
                    error={errors.email}
                />

                <Input
                    label="Subject"
                    placeholder="e.g. English Literature"
                    value={form.subject}
                    onChange={handleChange("subject")}
                    error={errors.subject}
                />

                <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Status</span>
                    <select value={form.status} onChange={handleChange("status")} className={SELECT_CLASSES}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </label>

                <div className="mt-2 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">{mode === "edit" ? "Save changes" : "Add Teacher"}</Button>
                </div>
            </form>
        </Modal>
    );
}

export default TeacherFormModal;
