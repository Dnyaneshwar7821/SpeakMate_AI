import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, CheckCircle2, AlertCircle, X } from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import SectionCard from "@school-admin/components/SectionCard";
import { schoolAdminDataApi } from "../../src/services/schoolAdminDataApi";
import { useTeachers } from "@school-admin/hooks/useSchoolData";
import { getIndianMobileError, normalizeIndianMobile, sanitizeMobileInput } from "@utils/phoneValidator";
import StandardDivisionPicker, {
    computeAllSelectedAssignments,
    validateStandardDivisions
} from "@school-admin/components/StandardDivisionPicker";

const EMPTY_FORM = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    standardDivisions: [],
    department: "",
    experience: "",
    qualification: "",
};

export function AddTeacher() {
    const { teachers } = useTeachers();
    const [form, setForm] = useState(EMPTY_FORM);
    const [assignmentGroups, setAssignmentGroups] = useState([{ standard: "", divisions: [] }]);
    const [conflicts, setConflicts] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    
    // This will hold the complete configuration from the backend
    const [schoolStandardsConfig, setSchoolStandardsConfig] = useState([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await schoolAdminDataApi.getSchoolDivisions();
                if (cancelled) return;
                setSchoolStandardsConfig(data || []);
            } catch (error) {
                console.error("Failed to load school standards config:", error);
                if (!cancelled) setSchoolStandardsConfig([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const update = (field) => (event) => {
        let val = event.target.value;
        if (field === "phone") {
            val = sanitizeMobileInput(val);
        }
        setForm((prev) => ({ ...prev, [field]: val }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    useEffect(() => {
        if (successMessage || submitError) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
                setSubmitError("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, submitError]);

    const validate = () => {
        const next = {};
        if (!(form.firstName || "").trim()) next.firstName = "First name is required";
        if (!(form.lastName || "").trim()) next.lastName = "Last name is required";
        if (!(form.email || "").trim()) next.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = "Enter a valid email";
        if (!(form.password || "").trim()) next.password = "Password is required";
        else if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}$/.test(form.password)) {
            next.password = "Use 8+ characters with upper, lower, number, and special character";
        }
        if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match";
        
        const phoneErr = getIndianMobileError(form.phone, "Phone number", true);
        if (phoneErr) next.phone = phoneErr;
        
        // Validate Standard Divisions
        const assignmentError = validateStandardDivisions(assignmentGroups, conflicts);
        if (assignmentError) {
            next.standardDivisions = assignmentError;
        }
        
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (conflicts.length > 0) {
            setSubmitError("Cannot add teacher: Please resolve conflicting standard and division assignments.");
            return;
        }
        try {
            if (!validate() || isSubmitting) return;

            setIsSubmitting(true);
            setSubmitError("");
            setSuccessMessage("");
            
            const res = await schoolAdminDataApi.createTeacher({
                firstName: (form.firstName || "").trim(),
                lastName: (form.lastName || "").trim(),
                email: (form.email || "").trim(),
                password: form.password,
                phone: normalizeIndianMobile(form.phone),
                standardDivisions: computeAllSelectedAssignments(assignmentGroups),
                active: true,
                department: (form.department || "").trim(),
                experience: (form.experience || "").trim(),
                qualification: (form.qualification || "").trim(),
            });
            const teacherEmail = (form.email || "").trim();
            setForm(EMPTY_FORM);
            setAssignmentGroups([{ standard: "", divisions: [] }]);
            setConflicts([]);
            setErrors({});
            if (res?.emailSent !== false) {
                setSuccessMessage(`Teacher added successfully and login credentials sent to ${teacherEmail}.`);
            } else {
                setSuccessMessage("Teacher added successfully, but credential email could not be sent.");
            }
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || "Unable to add the teacher.";
            setSubmitError(msg);
            const isConflictErr = error?.response?.status === 409;
            const isEmailErr = isConflictErr && (typeof msg === 'string' && msg.toLowerCase().includes("email"));
            const isAssignmentConflict = isConflictErr && (typeof msg === 'string' && (msg.toLowerCase().includes("assigned") || msg.toLowerCase().includes("division")));

            if (isEmailErr) {
                setErrors((prev) => ({ ...prev, email: msg }));
            } else if (isAssignmentConflict) {
                setErrors((prev) => ({ ...prev, standardDivisions: msg }));
            }
            const validationErrors = error?.response?.data?.errors;
            if (validationErrors && typeof validationErrors === 'object') {
                setErrors((prev) => ({ ...prev, ...validationErrors }));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (isSubmitting) return;
        setForm(EMPTY_FORM);
        setAssignmentGroups([{ standard: "", divisions: [] }]);
        setConflicts([]);
        setErrors({});
        setSubmitError("");
        setSuccessMessage("");
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
                        <Input label="First name" placeholder="Enter first name" value={form.firstName} onChange={update("firstName")} error={errors.firstName} autoComplete="given-name" disabled={isSubmitting} />
                        <Input label="Last name" placeholder="Enter last name" value={form.lastName} onChange={update("lastName")} error={errors.lastName} autoComplete="family-name" disabled={isSubmitting} />
                        <div className="sm:col-span-2">
                            <Input label="Teacher Email" type="email" placeholder="Enter teacher email" value={form.email} onChange={update("email")} error={errors.email} autoComplete="email" disabled={isSubmitting} />
                        </div>
                        <Input label="Password" type="password" placeholder="Enter password" value={form.password} onChange={update("password")} error={errors.password} autoComplete="new-password" disabled={isSubmitting} />
                        <Input label="Confirm Password" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={update("confirmPassword")} error={errors.confirmPassword} autoComplete="new-password" disabled={isSubmitting} />
                        <Input label="Phone" placeholder="e.g. 9876543210" value={form.phone} onChange={update("phone")} error={errors.phone} autoComplete="tel" disabled={isSubmitting} />
                        <Input label="Department" placeholder="English" value={form.department} onChange={update("department")} autoComplete="organization-title" disabled={isSubmitting} />
                        <Input label="Experience" placeholder="5 years" value={form.experience} onChange={update("experience")} disabled={isSubmitting} />
                        <Input label="Qualification" placeholder="M.A., B.Ed." value={form.qualification} onChange={update("qualification")} disabled={isSubmitting} />
                        
                        <StandardDivisionPicker
                            assignmentGroups={assignmentGroups}
                            onChange={(newGroups, newAssignments) => {
                                setAssignmentGroups(newGroups);
                                setForm((prev) => ({ ...prev, standardDivisions: newAssignments }));
                                if (errors.standardDivisions) {
                                    setErrors((prev) => {
                                        const next = { ...prev };
                                        delete next.standardDivisions;
                                        return next;
                                    });
                                }
                            }}
                            activeConfig={schoolStandardsConfig}
                            error={errors.standardDivisions}
                            disabled={isSubmitting}
                            teachers={teachers}
                            onConflictsChange={setConflicts}
                        />
                    </div>

                    <AnimatePresence>
                        {(successMessage || submitError) && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border backdrop-blur-sm ${
                                    successMessage 
                                        ? "bg-emerald-50/90 border-emerald-200 text-emerald-800" 
                                        : "bg-rose-50/90 border-rose-200 text-rose-800"
                                }`}
                            >
                                {successMessage ? (
                                    <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500 mt-0.5" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 shrink-0 text-rose-500 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm">
                                        {successMessage ? "Success" : "Error"}
                                    </h3>
                                    <p className="mt-1 text-sm opacity-90 leading-relaxed">
                                        {successMessage || submitError}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSuccessMessage("");
                                        setSubmitError("");
                                    }}
                                    className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                                        successMessage 
                                            ? "hover:bg-emerald-100 text-emerald-600" 
                                            : "hover:bg-rose-100 text-rose-600"
                                    }`}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-6 flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
                        <Button type="button" variant="secondary" onClick={handleReset} className="w-full sm:w-auto" disabled={isSubmitting}>
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={isSubmitting || conflicts.length > 0}
                            isLoading={isSubmitting}
                            loadingText="Adding..."
                            title={conflicts.length > 0 ? "Resolve assignment conflicts to continue" : undefined}
                        >
                            Add Teacher
                        </Button>
                    </div>
                </form>
            </SectionCard>
        </div>
    );
}

export default AddTeacher;
