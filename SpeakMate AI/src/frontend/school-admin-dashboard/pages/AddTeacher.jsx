import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import SectionCard from "@school-admin/components/SectionCard";

const EMPTY_FORM = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
};

export function AddTeacher() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    const update = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = "Teacher name is required";
        if (!form.email.trim()) next.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = "Enter a valid email";
        if (!form.password.trim()) next.password = "Password is required";
        if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validate()) return;
        alert("Teacher added successfully");
        setForm(EMPTY_FORM);
        setErrors({});
    };

    const handleReset = () => {
        setForm(EMPTY_FORM);
        setErrors({});
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-8"
            >
                <div
                    className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20 blur-3xl"
                    style={{ background: "linear-gradient(135deg,#6c63ff,#ff6584)" }}
                />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                            <UserPlus className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                            School Admin
                        </span>
                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                            Add Teacher
                        </h1>
                        <p className="mt-1.5 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
                            Register a new teacher for your school.
                        </p>
                    </div>
                </div>
            </motion.div>

            <SectionCard
                title="Teacher Details"
                subtitle="Enter teacher information and credentials"
                delay={0.05}
            >
                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Input
                                label="Teacher Name"
                                placeholder="Enter Teacher Name"
                                value={form.name}
                                onChange={update("name")}
                                error={errors.name}
                                autoComplete="off"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Input
                                label="Teacher Email"
                                type="email"
                                placeholder="Enter Teacher Email"
                                value={form.email}
                                onChange={update("email")}
                                error={errors.email}
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter Password"
                                value={form.password}
                                onChange={update("password")}
                                error={errors.password}
                                autoComplete="new-password"
                            />
                        </div>
                        <div>
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm Password"
                                value={form.confirmPassword}
                                onChange={update("confirmPassword")}
                                error={errors.confirmPassword}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
                        <Button type="button" variant="secondary" onClick={handleReset} className="w-full sm:w-auto">
                            Reset
                        </Button>
                        <Button type="submit" className="w-full sm:w-auto">
                            Add Teacher
                        </Button>
                    </div>
                </form>
            </SectionCard>
        </div>
    );
}

export default AddTeacher;
