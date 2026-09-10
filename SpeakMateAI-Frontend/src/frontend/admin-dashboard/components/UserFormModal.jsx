import { useEffect, useState, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import Modal from "@components/common/Modal";
import Input from "@components/common/Input";
import Button from "@components/common/Button";
import SchoolSelect from "@components/common/SchoolSelect";
import { schoolApi } from "@services/admin/schoolApi";
import { getIndianMobileError, normalizeIndianMobile, sanitizeMobileInput } from "@utils/phoneValidator";
const USER_STATUS_OPTIONS = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Pending", value: "pending" }
];
const USER_TYPE_OPTIONS = [
    { label: "General", value: "general" },
    { label: "School", value: "school" }
];


const EMPTY_FORM = {
    name: "",
    email: "",
    role: "Learner",
    status: "active",
    userType: "school",
    standard: "1",
    assignedTeacher: "",
    rollNo: "",
    schoolName: "",
    division: "",
    phone: "",
    parentName: "",
    parentPhone: "",
    password: "",
};

const SELECT_CLASSES =
    "h-11 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20";

function getOrdinal(n) {
    const num = parseInt(n, 10);
    if (isNaN(num)) return n;
    const s = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function UserFormModal({ isOpen, mode = "add", initialData, teachers = [], schools = [], assignedSchoolName, isStudentForm = false, isSubmitting = false, onClose, onSubmit }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [schoolStandardsConfig, setSchoolStandardsConfig] = useState([]);
    const [standardsLoading, setStandardsLoading] = useState(false);
    const [assignedTeacherLookup, setAssignedTeacherLookup] = useState({ loading: false, teacher: null, error: null });
    const [localSubmitting, setLocalSubmitting] = useState(false);
    const effectiveSubmitting = isSubmitting || localSubmitting;

    useEffect(() => {
        if (!form.schoolName || !schools || schools.length === 0) {
            setSchoolStandardsConfig([]);
            return;
        }
        const schoolObj = schools.find(s => s.name === form.schoolName);
        if (schoolObj && schoolObj.id) {
            setStandardsLoading(true);
            schoolApi.getSchoolStandards(schoolObj.id).then(data => {
                const config = (Array.isArray(data) && data.length > 0) ? data : (schoolObj.academicStructure || []);
                setSchoolStandardsConfig(config);
                if (config.length > 0) {
                    const validStds = config.map(s => String(s.standard));
                    setForm(prev => {
                        const currentStd = String(prev.standard || "").replace(/[^0-9]/g, "");
                        const nextStd = validStds.includes(currentStd) ? currentStd : validStds[0];
                        const stdConfig = config.find(s => String(s.standard) === String(nextStd));
                        const validDivs = stdConfig?.divisions || [];
                        const nextDiv = (prev.division && validDivs.includes(prev.division)) ? prev.division : (validDivs[0] || "");
                        return {
                            ...prev,
                            standard: nextStd,
                            division: nextDiv
                        };
                    });
                }
            }).catch(e => {
                console.error("Failed to load standards:", e);
                const fallback = schoolObj.academicStructure || [];
                setSchoolStandardsConfig(fallback);
            }).finally(() => {
                setStandardsLoading(false);
            });
        } else {
            setSchoolStandardsConfig([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.schoolName, schools?.length]);

    const availableStandards = schoolStandardsConfig.map(s => String(s.standard));
    const selectedStandardConfig = schoolStandardsConfig.find(s => String(s.standard) === String(form.standard));
    const availableDivisions = selectedStandardConfig ? (selectedStandardConfig.divisions || []) : [];

    const displayTeachers = useMemo(() => {
        if (!teachers || teachers.length === 0) return [];
        if (!form.schoolName || form.schoolName === "All Schools") return teachers;
        const schoolObj = schools?.find(s => s.name === form.schoolName);
        const filtered = teachers.filter(t => {
            if (schoolObj?.id && t.schoolId) {
                return Number(t.schoolId) === Number(schoolObj.id);
            }
            if (t.schoolName && form.schoolName) {
                return t.schoolName.trim().toLowerCase() === form.schoolName.trim().toLowerCase();
            }
            return true;
        });
        return filtered.length > 0 ? filtered : teachers;
    }, [teachers, schools, form.schoolName]);

    useEffect(() => {
        if (!isOpen) return;
        const initialStdRaw = String(initialData?.standard || "1").replace(/[^0-9]/g, "");
        const initialActive = initialData?.active !== undefined
            ? Boolean(initialData.active)
            : (initialData?.status ? String(initialData.status).toLowerCase() === "active" : true);
        setForm({
            name: initialData?.name ?? "",
            email: initialData?.email ?? "",
            status: initialActive ? "active" : "inactive",
            userType: initialData?.userType || (isStudentForm ? "school" : "general"),
            standard: initialStdRaw || "1",
            teacherId: initialData?.teacherId || (initialData?.assignedTeacher && teachers.length > 0 ? (teachers.find(t => t.name === initialData?.assignedTeacher)?.id || "") : ""),
            assignedTeacher: initialData?.assignedTeacher || "",
            rollNo: initialData?.rollNo ?? "",
            schoolName: initialData?.schoolName || assignedSchoolName || (schools.length > 0 ? schools[0].name : ""),
            division: initialData?.division ?? "",
            phone: initialData?.phone ?? "",
            parentName: initialData?.parentName ?? "",
            parentPhone: initialData?.parentPhone ?? "",
            password: "",
        });
        setErrors({});
        if (initialData?.assignedTeacher) {
            setAssignedTeacherLookup({
                loading: false,
                teacher: {
                    id: initialData.teacherId,
                    firstName: initialData.assignedTeacher.split(" ")[0] || initialData.assignedTeacher,
                    lastName: initialData.assignedTeacher.split(" ").slice(1).join(" ") || ""
                },
                error: null
            });
        } else {
            setAssignedTeacherLookup({ loading: false, teacher: null, error: null });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData]);

    useEffect(() => {
        if (!isStudentForm || !form.schoolName || !form.standard || !form.division || !schools || schools.length === 0) {
            setAssignedTeacherLookup({ loading: false, teacher: null, error: null });
            return;
        }

        const schoolObj = schools.find(s => s.name === form.schoolName);
        if (schoolObj && schoolObj.id) {
            const normStd = String(form.standard).replace(/[^0-9]/g, "") || String(form.standard);
            const normDiv = String(form.division).trim();

            setAssignedTeacherLookup(prev => ({ ...prev, loading: true, error: null }));
            schoolApi.getAssignedTeacher(schoolObj.id, normStd, normDiv)
                .then(teacher => {
                    if (teacher && teacher.id) {
                        setAssignedTeacherLookup({ loading: false, teacher, error: null });
                        setForm(prev => ({ ...prev, teacherId: teacher.id, assignedTeacher: `${teacher.firstName} ${teacher.lastName}`.trim() }));
                    } else {
                        setAssignedTeacherLookup({ loading: false, teacher: null, error: null });
                        // CRITICAL: If automatic lookup returns null, do NOT wipe an existing valid teacher assignment
                    }
                })
                .catch(err => {
                    console.error("Failed to lookup teacher:", err);
                    setAssignedTeacherLookup({ loading: false, teacher: null, error: null });
                    // CRITICAL: Do NOT wipe existing valid teacher assignment on lookup error
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStudentForm, form.schoolName, form.standard, form.division, schools?.length]);

    const handleChange = (field) => (event) => {
        let value = event.target.value;
        if (field === "teacherId") {
            const numVal = value ? Number(value) : "";
            const selectedTeacher = (teachers || []).find(t => Number(t.id) === Number(numVal));
            const teacherName = selectedTeacher
                ? (selectedTeacher.name || `${selectedTeacher.firstName || ""} ${selectedTeacher.lastName || ""}`.trim())
                : "";
            setForm((prev) => ({
                ...prev,
                teacherId: numVal,
                assignedTeacher: teacherName
            }));
            return;
        }
        if (field === "phone" || field === "parentPhone") {
            value = sanitizeMobileInput(value);
        }
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleStandardChange = (e) => {
        const newStd = e.target.value;
        const stdConfig = schoolStandardsConfig.find(s => String(s.standard) === String(newStd));
        const validDivs = stdConfig?.divisions || [];
        setForm(prev => {
            const nextDiv = (prev.division && validDivs.includes(prev.division)) ? prev.division : (validDivs[0] || "");
            return {
                ...prev,
                standard: newStd,
                division: nextDiv
            };
        });
        if (errors.standard) {
            setErrors(prev => ({ ...prev, standard: undefined }));
        }
        if (errors.division) {
            setErrors(prev => ({ ...prev, division: undefined }));
        }
    };

    const validate = () => {
        const nextErrors = {};
        if (!form.name.trim()) nextErrors.name = "Name is required";

        if (mode === "add" || (initialData && initialData.email !== form.email)) {
            if (!form.email.trim()) nextErrors.email = "Email is required";
            else if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = "Enter a valid email";
        }

        if (isStudentForm) {
            if (!String(form.rollNo).trim()) {
                nextErrors.rollNo = "Roll Number is required";
            } else if (!/^[0-9]+$/.test(String(form.rollNo))) {
                nextErrors.rollNo = "Roll Number must be numeric";
            }

            if (!form.division.trim()) {
                nextErrors.division = "Division is required";
            }

            const phoneErr = getIndianMobileError(form.phone, "Student Phone", true);
            if (phoneErr) {
                nextErrors.phone = phoneErr;
            }

            if (!form.parentName.trim()) {
                nextErrors.parentName = "Parent Name is required";
            }

            const parentPhoneErr = getIndianMobileError(form.parentPhone, "Parent Phone", true);
            if (parentPhoneErr) {
                nextErrors.parentPhone = parentPhoneErr;
            }
        } else {
            if (form.phone && form.phone.trim()) {
                const phoneErr = getIndianMobileError(form.phone, "Mobile number", false);
                if (phoneErr) {
                    nextErrors.phone = phoneErr;
                }
            }
        }

        if (mode !== "edit") {
            if (!form.password) {
                nextErrors.password = "Password is required";
            } else if (form.password.length < 8) {
                nextErrors.password = "Password must be at least 8 characters";
            } else if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/.test(form.password)) {
                nextErrors.password = "Password must contain a digit, lowercase, uppercase, and special char";
            }
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;
        const schoolObj = schools.find(s => s.name === form.schoolName);
        const normStd = String(form.standard || "").replace(/[^0-9]/g, "") || String(form.standard || "1");
        const payload = {
            ...form,
            standard: normStd,
            schoolId: schoolObj?.id,
            phone: normalizeIndianMobile(form.phone),
            parentPhone: isStudentForm ? normalizeIndianMobile(form.parentPhone) : undefined,
            active: form.status === "active",
            status: form.status === "active" ? "ACTIVE" : "INACTIVE",
        };
        setLocalSubmitting(true);
        try {
            await onSubmit(payload);
        } finally {
            setLocalSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === "edit" ? (isStudentForm ? "Edit Student" : "Edit user") : (isStudentForm ? "Add Student" : "Add new user")}
            description={
                mode === "edit"
                    ? (isStudentForm ? "Update this student's details below." : "Update this user's details below.")
                    : (isStudentForm ? "Fill in the details to create a new student." : "Fill in the details to create a new user.")
            }
        >
            <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh]">
                <div className="flex-1 overflow-y-auto pr-1 pb-2 space-y-4 max-h-[55vh] thin-scrollbar">
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
                        disabled={mode === "edit" && isStudentForm}
                    />

                    {mode !== "edit" && (
                        <Input
                            label="Password"
                            type="password"
                            placeholder="e.g. User@123"
                            value={form.password}
                            onChange={handleChange("password")}
                            error={errors.password}
                        />
                    )}

                    {isStudentForm && assignedSchoolName !== undefined ? (
                        <div className="grid gap-4 sm:grid-cols-1">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">School</span>
                                <input
                                    value={form.schoolName}
                                    readOnly
                                    disabled
                                    className={`${SELECT_CLASSES} cursor-not-allowed opacity-70`}
                                />
                            </label>
                        </div>
                    ) : form.userType === "school" && schools.length > 0 && (
                        <div className="grid gap-4 sm:grid-cols-1">
                            <div>
                                <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                                    Assign School
                                </span>
                                <SchoolSelect
                                    value={form.schoolName}
                                    onChange={handleChange("schoolName")}
                                    schools={schools}
                                    disabled={effectiveSubmitting}
                                    placeholder="Select a school"
                                />
                            </div>
                        </div>
                    )}

                    {form.userType === "school" && (
                        <label className="block">
                            <span className="mb-2 flex items-center justify-between text-sm font-medium text-[var(--text-primary)]">
                                <span>Standard</span>
                                {standardsLoading && (
                                    <span className="text-xs text-blue-500 font-normal animate-pulse flex items-center gap-1">
                                        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading standards...
                                    </span>
                                )}
                            </span>
                            <select
                                value={String(form.standard)}
                                onChange={handleStandardChange}
                                className={SELECT_CLASSES}
                                disabled={standardsLoading}
                            >
                                {isStudentForm ? (
                                    availableStandards.length > 0 ? (
                                        availableStandards.map((std) => (
                                            <option key={std} value={std}>{getOrdinal(std)} Standard</option>
                                        ))
                                    ) : (
                                        <option value={String(form.standard)}>{getOrdinal(form.standard || 1)} Standard</option>
                                    )
                                ) : (
                                    [1,2,3,4,5,6,7,8,9,10].map(s => (
                                        <option key={s} value={s}>{getOrdinal(s)} Standard</option>
                                    ))
                                )}
                            </select>
                        </label>
                    )}

                    {isStudentForm && (
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Division</span>
                            <select
                                value={form.division}
                                onChange={handleChange("division")}
                                className={SELECT_CLASSES}
                            >
                                <option value="">Select Division</option>
                                {availableDivisions.map(div => (
                                    <option key={div} value={div}>{div}</option>
                                ))}
                            </select>
                            {errors.division && <span className="text-red-500 text-xs mt-1 block">{errors.division}</span>}
                        </label>
                    )}

                    {isStudentForm && (
                        <div className="grid gap-4 sm:grid-cols-1">
                            <Input
                                label="Roll Number"
                                placeholder="e.g. 1"
                                value={form.rollNo}
                                onChange={handleChange("rollNo")}
                                error={errors.rollNo}
                            />
                        </div>
                    )}

                    {!isStudentForm && (
                        <Input
                            label="Mobile Number"
                            placeholder="e.g. 9876543210"
                            value={form.phone || ""}
                            onChange={handleChange("phone")}
                            error={errors.phone}
                        />
                    )}

                    {isStudentForm && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                label="Student Phone"
                                placeholder="e.g. 9876543210"
                                value={form.phone || ""}
                                onChange={handleChange("phone")}
                                error={errors.phone}
                            />
                            <Input
                                label="Parent Name"
                                placeholder="e.g. Ramesh Sharma"
                                value={form.parentName}
                                onChange={handleChange("parentName")}
                                error={errors.parentName}
                            />
                        </div>
                    )}

                    {isStudentForm && (
                        <Input
                            label="Parent Phone"
                            placeholder="e.g. 9876543210"
                            value={form.parentPhone || ""}
                            onChange={handleChange("parentPhone")}
                            error={errors.parentPhone}
                        />
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Role</span>
                            <span className="flex h-11 w-full items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)]">
                                {isStudentForm ? "Student" : "Learner"}
                            </span>
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Status</span>
                            <select value={form.status} onChange={handleChange("status")} className={SELECT_CLASSES}>
                                {USER_STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {!isStudentForm && (
                        <div className="grid gap-4 sm:grid-cols-1">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">User Type</span>
                                <select value={form.userType} onChange={handleChange("userType")} className={SELECT_CLASSES}>
                                    {USER_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}

                    {!isStudentForm && teachers.length > 0 && (
                        <div className="grid gap-4 sm:grid-cols-1">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                                    Assign Teacher
                                </span>
                                <select
                                    value={form.teacherId || (teachers.find(t => t.name === form.assignedTeacher)?.id) || ""}
                                    onChange={handleChange("teacherId")}
                                    className={SELECT_CLASSES}
                                >
                                    <option value="">Select Teacher (Optional)</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}

                    {isStudentForm && (
                        <div className="grid gap-4 sm:grid-cols-1">
                            <label className="block">
                                <span className="mb-2 flex items-center justify-between text-sm font-medium text-[var(--text-primary)]">
                                    <span>Assign Teacher</span>
                                    {assignedTeacherLookup.loading && (
                                        <span className="text-xs text-blue-500 font-normal animate-pulse flex items-center gap-1">
                                            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Checking class teacher...
                                        </span>
                                    )}
                                </span>
                                {displayTeachers.length > 0 ? (
                                    <select
                                        value={form.teacherId || (displayTeachers.find(t => t.name === form.assignedTeacher)?.id) || ""}
                                        onChange={handleChange("teacherId")}
                                        className={SELECT_CLASSES}
                                    >
                                        <option value="">Select Teacher (Optional)</option>
                                        {displayTeachers.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim()}
                                                {t.department ? ` (${t.department})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        readOnly
                                        disabled
                                        value={form.assignedTeacher || "No teachers available"}
                                        className={`${SELECT_CLASSES} cursor-not-allowed opacity-75`}
                                    />
                                )}
                            </label>
                            {assignedTeacherLookup.teacher && (
                                <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs transition">
                                    <div className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                        <span>Detected Class Teacher: {assignedTeacherLookup.teacher.firstName} {assignedTeacherLookup.teacher.lastName}</span>
                                    </div>
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 shrink-0">
                                        Class Teacher
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex justify-end gap-3 shrink-0">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={effectiveSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={effectiveSubmitting}
                        isLoading={effectiveSubmitting}
                        loadingText={mode === "edit" ? "Saving..." : (isStudentForm ? "Adding Student..." : "Adding user...")}
                        className="flex items-center gap-2 min-w-[140px] justify-center"
                    >
                        {effectiveSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>{mode === "edit" ? "Saving..." : (isStudentForm ? "Adding Student..." : "Adding user...")}</span>
                            </span>
                        ) : (
                            mode === "edit" ? "Save changes" : (isStudentForm ? "Add Student" : "Add user")
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default UserFormModal;
