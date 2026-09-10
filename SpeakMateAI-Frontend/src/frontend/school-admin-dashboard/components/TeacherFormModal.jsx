import { useEffect, useState } from "react";
import Modal from "@components/common/Modal";
import Input from "@components/common/Input";
import Button from "@components/common/Button";
import { schoolAdminDataApi } from "@services/admin/schoolAdminDataApi";
import { STANDARD_OPTIONS } from "@constants/standardOptions";
import { getIndianMobileError, normalizeIndianMobile, sanitizeMobileInput } from "@utils/phoneValidator";
import StandardDivisionPicker, {
    loadInitialAssignmentGroups,
    computeAllSelectedAssignments,
    validateStandardDivisions
} from "./StandardDivisionPicker";

const EMPTY_FORM = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    standardDivisions: [],
    department: "",
    experience: "",
    qualification: "",
    active: true,
};

const SELECT_CLASSES =
    "h-11 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20";

export function TeacherFormModal({ isOpen, mode = "add", initialData, onClose, onSubmit, teachers = [] }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [assignmentGroups, setAssignmentGroups] = useState([{ standard: "", divisions: [] }]);
    const [conflicts, setConflicts] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    
    // Config from backend
    const [schoolStandardsConfig, setSchoolStandardsConfig] = useState([]);

    useEffect(() => {
        if (!isOpen) return;
        
        const initialGroups = loadInitialAssignmentGroups(
            initialData,
            schoolStandardsConfig.length > 0 ? schoolStandardsConfig : STANDARD_OPTIONS
        );
        setAssignmentGroups(initialGroups);
        const assignments = computeAllSelectedAssignments(initialGroups);

        setForm({
            firstName: initialData?.firstName ?? "",
            lastName: initialData?.lastName ?? "",
            email: initialData?.email ?? "",
            password: "",
            phone: initialData?.phone ?? "",
            standardDivisions: assignments,
            department: initialData?.department ?? "",
            experience: initialData?.experience ?? "",
            qualification: initialData?.qualification ?? "",
            active: initialData?.active ?? true,
        });
        setErrors({});
        setSubmitError("");
        setIsSubmitting(false);
    }, [isOpen, initialData, schoolStandardsConfig]);

    useEffect(() => {
        if (!isOpen) return;
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
    }, [isOpen]);

    const handleChange = (field) => (event) => {
        let value = field === "active" ? event.target.value === "true" : event.target.value;
        if (field === "phone") {
            value = sanitizeMobileInput(value);
        }
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        setSubmitError("");
    };

    const validate = () => {
        const nextErrors = {};
        if (!(form.firstName || "").trim()) nextErrors.firstName = "First name is required";
        if (!(form.lastName || "").trim()) nextErrors.lastName = "Last name is required";
        if (!(form.email || "").trim()) nextErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = "Enter a valid email";
        if (mode === "add" && !form.password) nextErrors.password = "Password is required";
        else if (form.password && !/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}$/.test(form.password)) {
            nextErrors.password = "Use 8+ characters with upper, lower, number, and special character";
        }
        const phoneErr = getIndianMobileError(form.phone, "Phone number", true);
        if (phoneErr) nextErrors.phone = phoneErr;
        
        // Validate Standard Divisions
        const assignmentError = validateStandardDivisions(assignmentGroups, conflicts);
        if (assignmentError) {
            nextErrors.standardDivisions = assignmentError;
        }
        
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (conflicts.length > 0) {
            setSubmitError("Cannot save: Please resolve conflicting standard and division assignments.");
            return;
        }
        if (!validate() || isSubmitting) return;

        setIsSubmitting(true);
        setSubmitError("");
        try {
            const payload = {
                ...form,
                standardDivisions: computeAllSelectedAssignments(assignmentGroups),
                phone: normalizeIndianMobile(form.phone)
            };
            await onSubmit(payload);
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || "Unable to save the teacher.";
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

    const activeConfig = schoolStandardsConfig.length > 0
        ? schoolStandardsConfig
        : STANDARD_OPTIONS.map(std => ({ standard: std, divisions: ["A", "B", "C", "D", "E"] }));

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
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="First name" value={form.firstName} onChange={handleChange("firstName")} error={errors.firstName} disabled={isSubmitting} />
                    <Input label="Last name" value={form.lastName} onChange={handleChange("lastName")} error={errors.lastName} disabled={isSubmitting} />
                    <Input label="Email address" type="email" value={form.email} onChange={handleChange("email")} error={errors.email} disabled={mode === "edit" || isSubmitting} />
                    <Input label={mode === "edit" ? "New password (optional)" : "Password"} type="password" value={form.password} onChange={handleChange("password")} error={errors.password} autoComplete="new-password" disabled={isSubmitting} />
                    <Input label="Phone" placeholder="e.g. 9876543210" value={form.phone} onChange={handleChange("phone")} error={errors.phone} disabled={isSubmitting} />
                    <Input label="Department" placeholder="English" value={form.department} onChange={handleChange("department")} disabled={isSubmitting} />
                    
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
                        activeConfig={activeConfig}
                        error={errors.standardDivisions}
                        disabled={isSubmitting}
                        teachers={teachers}
                        editingTeacherId={initialData?.id || initialData?.teacherId || initialData?.userId}
                        editingTeacherEmail={initialData?.email || form.email}
                        editingTeacherName={
                            initialData?.name ||
                            (initialData?.firstName ? `${initialData.firstName} ${initialData.lastName || ""}`.trim() : "") ||
                            (form.firstName ? `${form.firstName} ${form.lastName || ""}`.trim() : "")
                        }
                        onConflictsChange={setConflicts}
                    />
                    
                    <Input label="Experience" placeholder="5 years" value={form.experience} onChange={handleChange("experience")} disabled={isSubmitting} />
                    <Input label="Qualification" placeholder="M.A., B.Ed." value={form.qualification} onChange={handleChange("qualification")} disabled={isSubmitting} />
                    <label className="block sm:col-span-2">
                        <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Status</span>
                        <select value={String(form.active)} onChange={handleChange("active")} disabled={isSubmitting} className={SELECT_CLASSES}>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </label>
                </div>

                {submitError && (
                    <p role="alert" className="text-sm font-medium text-rose-500">
                        {submitError}
                    </p>
                )}

                <div className="mt-2 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || conflicts.length > 0}
                        isLoading={isSubmitting}
                        loadingText={mode === "edit" ? "Saving changes..." : "Adding teacher..."}
                        title={conflicts.length > 0 ? "Resolve assignment conflicts to continue" : undefined}
                    >
                        {mode === "edit" ? "Save changes" : "Add Teacher"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default TeacherFormModal;
