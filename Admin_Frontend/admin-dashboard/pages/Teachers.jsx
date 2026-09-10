import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    UserPlus,
    Plus,
    Search,
    Edit2,
    Trash2,
    UserX,
    UserCheck,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    Download,
    Filter,
    X,
    ChevronDown,
    Building2,
} from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import Modal from "@components/common/Modal";
import SchoolSelect from "@components/common/SchoolSelect";
import SectionCard from "@admin/components/SectionCard";
import InsigniaBadge from "@components/common/InsigniaBadge";
import { teacherApi } from "../../src/services/teacherApi";
import { schoolApi } from "../../src/services/schoolApi";
import { studentApi } from "../../src/services/studentApi";
import { getIndianMobileError, normalizeIndianMobile, sanitizeMobileInput } from "@utils/phoneValidator";
import { STANDARD_OPTIONS } from "../../src/constants/standardOptions";
import { TeacherStudentsModal } from "@school-admin/components/TeacherStudentsModal";
import { StandardDivisionPicker, validateStandardDivisions } from "@school-admin/components/StandardDivisionPicker";
import { StandardDivisionPicker, validateStandardDivisions } from "@school-admin/components/StandardDivisionPicker";

const STATUS_STYLES = {
    Active: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20",
    Inactive: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-500/20",
};

// Generates division labels (A, B, C, ...) from a school's configured division count.
// Mirrors StandardDivisionUtil.generateDivisions on the backend (clamped to 1-26).
const generateDivisionOptions = (divisionCount) => {
    const count = Math.max(1, Math.min(Number(divisionCount) || 1, 26));
    return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
};

const normalizeStd = (val) => {
    if (!val) return "";
    return String(val)
        .trim()
        .replace(/(st|nd|rd|th)?\s*(standard|std|grade|class)?$/i, "")
        .replace(/^(grade|class)\s*/i, "")
        .trim();
};

// In-memory cache for instantaneous display when switching tabs
let teachersCache = {
    teachers: null,
    schools: null,
    students: null
};

export function Teachers() {
    const [teachersList, setTeachersList] = useState(() => teachersCache.teachers || []);
    const [schools, setSchools] = useState(() => teachersCache.schools || []);
    const [students, setStudents] = useState(() => teachersCache.students || []);
    const [isLoading, setIsLoading] = useState(() => !teachersCache.teachers || teachersCache.teachers.length === 0);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        school: "All",
        department: "All",
        assignment: "All",
        status: "All",
        students: "Any"
    });
    const [searchParams] = useSearchParams();

    // Respect ?status=active or ?status=inactive from KPI card navigation
    useEffect(() => {
        const statusParam = searchParams.get("status");
        if (statusParam?.toLowerCase() === "active") {
            setFilters((prev) => ({ ...prev, status: "Active" }));
        } else if (statusParam?.toLowerCase() === "inactive") {
            setFilters((prev) => ({ ...prev, status: "Inactive" }));
        }
    }, [searchParams]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        schoolName: "",
        password: "",
        confirmPassword: "",
        department: "",
        experience: "",
        qualification: "",
        standardDivisions: [{ standard: "", division: "" }],
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [schoolStandardsConfig, setSchoolStandardsConfig] = useState([]);
    
    const selectedSchoolObj = useMemo(() => {
        if (!form.schoolName) return null;
        return (schools || []).find(
            (s) => s.name === form.schoolName ||
                   (s.name && s.name.trim().toLowerCase() === form.schoolName.trim().toLowerCase()) ||
                   String(s.id) === String(form.schoolName)
        ) || null;
    }, [schools, form.schoolName]);

    const currentSchoolId = selectedSchoolObj ? selectedSchoolObj.id : (editingTeacher?.schoolId || null);
    const currentSchoolName = selectedSchoolObj ? selectedSchoolObj.name : (form.schoolName || editingTeacher?.schoolName || null);

    useEffect(() => {
        if (selectedSchoolObj && selectedSchoolObj.id) {
            let cancelled = false;
            schoolApi.getSchoolStandards(selectedSchoolObj.id)
                .then((data) => {
                    if (!cancelled) setSchoolStandardsConfig(data || []);
                })
                .catch((err) => {
                    console.error("Failed to load school standards config:", err);
                    if (!cancelled) setSchoolStandardsConfig([]);
                });
            return () => { cancelled = true; };
        } else {
            setSchoolStandardsConfig([]);
        }
    }, [selectedSchoolObj]);

    // Checkbox-based Standard Assignment State
    const [assignmentGroups, setAssignmentGroups] = useState([
        { standard: "", divisions: [] }
    ]);

    const allSelectedAssignments = useMemo(() => {
        const seen = new Set();
        const result = [];
        assignmentGroups.forEach((g) => {
            if (g.standard && Array.isArray(g.divisions)) {
                g.divisions.forEach((d) => {
                    const key = `${g.standard}-${d}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        result.push({ standard: g.standard, division: d });
                    }
                });
            }
        });
        return result;
    }, [assignmentGroups]);

    // In-memory conflict lookup for teacher assignments within the currently selected school
    const schoolOccupiedAssignments = useMemo(() => {
        if (!form.schoolName || !teachersList || teachersList.length === 0) {
            return new Map();
        }

        const map = new Map();

        teachersList.forEach((t) => {
            // CRITICAL: Exclude the teacher currently being edited (self-exclusion)
            if (editingTeacher && String(t.id) === String(editingTeacher.id)) {
                return;
            }

            // Compare school: check schoolId first, fallback to schoolName
            const matchesSchool = currentSchoolId != null && t.schoolId != null
                ? String(t.schoolId) === String(currentSchoolId)
                : Boolean(t.schoolName && form.schoolName && t.schoolName.trim().toLowerCase() === form.schoolName.trim().toLowerCase());

            if (!matchesSchool) {
                return;
            }

            const teacherName = t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim() || t.email || "Another Teacher";

            // Extract all assignments for this teacher
            const pairs = [];
            if (Array.isArray(t.standardDivisions) && t.standardDivisions.length > 0) {
                t.standardDivisions.forEach((sd) => {
                    if (sd?.standard && sd?.division) {
                        pairs.push({ standard: sd.standard, division: sd.division });
                    }
                });
            } else if (t.standard && t.division) {
                pairs.push({ standard: t.standard, division: t.division });
            }

            pairs.forEach(({ standard, division }) => {
                const normStd = normalizeStd(standard);
                const normDiv = String(division).trim().toUpperCase();
                const key = `${normStd}-${normDiv}`;
                if (!map.has(key)) {
                    map.set(key, {
                        teacherId: t.id,
                        teacherName,
                        standard,
                        division: normDiv
                    });
                }
            });
        });

        return map;
    }, [teachersList, schools, form.schoolName, editingTeacher]);

    // Active assignment conflicts managed via StandardDivisionPicker
    const [conflicts, setConflicts] = useState([]);
    const assignmentConflicts = conflicts;

    const handleStandardChange = (index, newStandard) => {
        setAssignmentGroups((prev) => {
            const next = [...prev];
            next[index] = { standard: newStandard, divisions: [] };
            return next;
        });
        setErrors((prev) => ({ ...prev, standardDivisions: undefined }));
    };

    const handleToggleDivision = (groupIndex, division) => {
        setAssignmentGroups((prev) => {
            const next = [...prev];
            const group = next[groupIndex];
            const hasDiv = group.divisions.includes(division);
            const newDivs = hasDiv
                ? group.divisions.filter((d) => d !== division)
                : [...group.divisions, division].sort();
            next[groupIndex] = { ...group, divisions: newDivs };
            return next;
        });
        setErrors((prev) => ({ ...prev, standardDivisions: undefined }));
    };

    const handleSelectAllDivisions = (groupIndex, availableDivisions) => {
        setAssignmentGroups((prev) => {
            const next = [...prev];
            next[groupIndex] = { ...next[groupIndex], divisions: [...availableDivisions] };
            return next;
        });
        setErrors((prev) => ({ ...prev, standardDivisions: undefined }));
    };

    const handleClearAllDivisions = (groupIndex) => {
        setAssignmentGroups((prev) => {
            const next = [...prev];
            next[groupIndex] = { ...next[groupIndex], divisions: [] };
            return next;
        });
    };

    const handleAddStandardGroup = () => {
        setAssignmentGroups((prev) => [...prev, { standard: "", divisions: [] }]);
    };

    const handleRemoveStandardGroup = (groupIndex) => {
        setAssignmentGroups((prev) => {
            if (prev.length <= 1) {
                return [{ standard: "", divisions: [] }];
            }
            return prev.filter((_, i) => i !== groupIndex);
        });
    };

    const handleRemoveAssignment = (standard, division) => {
        setAssignmentGroups((prev) => {
            return prev.map((g) => {
                if (g.standard === standard || normalizeStd(g.standard) === normalizeStd(standard)) {
                    return { ...g, divisions: g.divisions.filter((d) => d !== division) };
                }
                return g;
            });
        });
    };

    const [selectedTeacherForStudents, setSelectedTeacherForStudents] = useState(null);

    // Sync cache when state updates
    useEffect(() => {
        if (teachersList && teachersList.length > 0) {
            teachersCache.teachers = teachersList;
        }
    }, [teachersList]);

    useEffect(() => {
        if (schools && schools.length > 0) {
            teachersCache.schools = schools;
        }
    }, [schools]);

    useEffect(() => {
        if (students && students.length > 0) {
            teachersCache.students = students;
        }
    }, [students]);

    // Cosmetic Toast notifications state
    const [toasts, setToasts] = useState([]);

    const triggerToast = (message, type = "success") => {
        const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    };

    // Modal Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
    });

    const triggerConfirm = (title, message, onConfirm) => {
        setConfirmDialog({
            isOpen: true,
            title,
            message,
            onConfirm,
        });
    };

    // Fast independent loaders
    const loadTeachers = async (isSilent = false) => {
        if (!isSilent && (!teachersCache.teachers || teachersCache.teachers.length === 0)) {
            setIsLoading(true);
        }
        try {
            const teachersData = await teacherApi.getTeachers();
            const currentSchools = teachersCache.schools || schools || [];
            const mappedTeachers = (teachersData || []).map((t) => {
                let sName = t.schoolName && t.schoolName !== "None" ? t.schoolName : null;
                if (!sName && t.schoolId && currentSchools.length > 0) {
                    const found = currentSchools.find(s => Number(s.id) === Number(t.schoolId));
                    if (found) sName = found.name;
                }
                return {
                    ...t,
                    schoolName: sName,
                    name: (`${t.firstName || ""} ${t.lastName || ""}`).trim() || "Unknown Teacher",
                    status: t.active ? "Active" : "Inactive"
                };
            });
            teachersCache.teachers = mappedTeachers;
            setTeachersList(mappedTeachers);
        } catch (err) {
            console.error("Failed to load teachers:", err);
            if (!teachersCache.teachers || teachersCache.teachers.length === 0) {
                triggerToast("Error loading teachers from server", "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loadSchools = async () => {
        try {
            if (teachersCache.schools && teachersCache.schools.length > 0) {
                setSchools(teachersCache.schools);
                return;
            }
            const schoolsData = await schoolApi.getSchools();
            const validSchools = schoolsData || [];
            teachersCache.schools = validSchools;
            setSchools(validSchools);
            setTeachersList(prev => prev.map(t => {
                if ((!t.schoolName || t.schoolName === "None") && t.schoolId) {
                    const found = validSchools.find(s => Number(s.id) === Number(t.schoolId));
                    if (found) return { ...t, schoolName: found.name };
                }
                return t;
            }));
            if (validSchools.length > 0) {
                setForm((prev) => ({
                    ...prev,
                    schoolName: prev.schoolName || validSchools[0].name
                }));
            }
        } catch (err) {
            console.error("Failed to load schools:", err);
        }
    };

    const loadStudents = async () => {
        try {
            if (teachersCache.students && teachersCache.students.length > 0) {
                setStudents(teachersCache.students);
                return;
            }
            // Fetch students in background with a reasonable page size for badges
            const studentsRes = await studentApi.getStudents(0, 500);
            const loadedStudents = studentsRes?.data?.content || [];
            teachersCache.students = loadedStudents;
            setStudents(loadedStudents);
        } catch (err) {
            console.error("Background student loading skipped:", err);
        }
    };

    useEffect(() => {
        const isCached = Boolean(teachersCache.teachers && teachersCache.teachers.length > 0);
        loadTeachers(isCached);
        loadSchools();
        loadStudents();

        const handleSchoolDataUpdated = (e) => {
            if (e?.detail?.type === "student") {
                teachersCache.students = null;
                studentApi.getStudents(0, 500).then((res) => {
                    const loaded = res?.data?.content || [];
                    teachersCache.students = loaded;
                    setStudents(loaded);
                }).catch(() => {});
            }
        };
        window.addEventListener("school_data_updated", handleSchoolDataUpdated);
        return () => window.removeEventListener("school_data_updated", handleSchoolDataUpdated);
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

    const validate = () => {
        const next = {};
        if (!(form.name || "").trim()) next.name = "Teacher name is required";
        if (!(form.email || "").trim()) next.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = "Enter a valid email";

        const phoneErr = getIndianMobileError(form.phone, "Phone number", true);
        if (phoneErr) next.phone = phoneErr;

        if (!editingTeacher) {
            // Password fields are only required when creating a new teacher
            if (!form.password.trim()) next.password = "Password is required";
            else if (form.password.length < 8) next.password = "Password must be at least 8 characters";
            else if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/.test(form.password)) {
                next.password = "Must contain uppercase, lowercase, digit, and special char";
            }
            if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match";
        } else {
            // In Edit Mode, only validate passwords if the user typed anything in them
            if (form.password) {
                if (form.password.length < 8) next.password = "Password must be at least 8 characters";
                else if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/.test(form.password)) {
                    next.password = "Must contain uppercase, lowercase, digit, and special char";
                }
                if (form.password !== form.confirmPassword) {
                    next.confirmPassword = "Passwords do not match";
                }
            }
        }

        const assignmentError = validateStandardDivisions(assignmentGroups, conflicts);
        if (assignmentError) {
            next.standardDivisions = assignmentError;
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (assignmentConflicts.length > 0) {
            triggerToast("Cannot save: Please resolve conflicting standard and division assignments.", "error");
            return;
        }
        if (!validate()) return;

        // Find the selected school's ID
        const selectedSchool = schools.find((s) => s.name === form.schoolName);
        const schoolId = selectedSchool ? selectedSchool.id : null;

        // Split name into first and last name
        const nameParts = (form.name || "").trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "Teacher";

        const payload = {
            firstName,
            lastName,
            email: (form.email || "").trim(),
            phone: normalizeIndianMobile(form.phone),
            password: form.password || undefined,
            schoolId,
            standardDivisions: allSelectedAssignments,
            active: editingTeacher ? (editingTeacher.status === "Active") : true,
            department: form.department,
            experience: form.experience,
            qualification: form.qualification
        };

        setIsSubmitting(true);
        try {
            if (editingTeacher) {
                // Edit Mode
                const updated = await teacherApi.updateTeacher(editingTeacher.id, payload);
                setTeachersList((prev) =>
                    prev.map((t) =>
                        t.id === editingTeacher.id
                            ? {
                                ...t,
                                firstName: updated.firstName,
                                lastName: updated.lastName,
                                name: `${updated.firstName || ""} ${updated.lastName || ""}`.trim(),
                                email: updated.email,
                                phone: updated.phone,
                                standardDivisions: updated.standardDivisions,
                                schoolId: updated.schoolId,
                                schoolName: updated.schoolName,
                                status: updated.active ? "Active" : "Inactive",
                                department: updated.department,
                                experience: updated.experience,
                                qualification: updated.qualification,
                            }
                            : t
                    )
                );
                teachersCache.teachers = null;
                window.dispatchEvent(new CustomEvent("school_data_updated", { detail: { type: "teacher", action: "update" } }));
                triggerToast(`Teacher "${form.name}" updated successfully!`);
            } else {
                // Add Mode
                const created = await teacherApi.createTeacher(payload);
                teachersCache.teachers = null;
                const newTeacher = {
                    id: created.id,
                    firstName: created.firstName,
                    lastName: created.lastName,
                    name: `${created.firstName || ""} ${created.lastName || ""}`.trim(),
                    email: created.email,
                    phone: created.phone,
                    standardDivisions: created.standardDivisions,
                    schoolId: created.schoolId,
                    schoolName: created.schoolName,
                    status: created.active ? "Active" : "Inactive",
                    department: created.department,
                    experience: created.experience,
                    qualification: created.qualification,
                };
                setTeachersList((prev) => [newTeacher, ...prev]);
                window.dispatchEvent(new CustomEvent("school_data_updated", { detail: { type: "teacher", action: "create" } }));
                if (created.emailSent !== false) {
                    triggerToast(`Teacher "${form.name}" added successfully and login credentials sent to ${created.email}!`);
                } else {
                    triggerToast(`Teacher "${form.name}" added successfully, but credential email could not be sent.`);
                }
            }

            setModalOpen(false);
            setEditingTeacher(null);
            setForm({
                name: "",
                email: "",
                phone: "",
                schoolName: schools.length > 0 ? schools[0].name : "",
                password: "",
                confirmPassword: "",
                standardDivisions: [{ standard: "", division: "" }],
            });
            setAssignmentGroups([{ standard: "", divisions: [] }]);
            setErrors({});
        } catch (err) {
            console.error("Save teacher error:", err);
            const msg = err.response?.data?.message || err.response?.data?.error || err.response?.data || err.message || "Failed to save teacher";
            const isConflictErr = err.response?.status === 409;
            const isEmailErr = isConflictErr && (typeof msg === 'string' && msg.toLowerCase().includes("email"));
            const isAssignmentConflictErr = isConflictErr && (typeof msg === 'string' && (msg.toLowerCase().includes("assigned") || msg.toLowerCase().includes("division")));

            triggerToast(typeof msg === 'string' ? msg : "Failed to save teacher", "error");
            if (isEmailErr) {
                setErrors((prev) => ({ ...prev, email: typeof msg === 'string' ? msg : "An account with this email already exists" }));
            } else if (isAssignmentConflictErr) {
                setErrors((prev) => ({ ...prev, standardDivisions: typeof msg === 'string' ? msg : "Conflict: Standard and Division already assigned to another teacher" }));
            }
            const validationErrors = err.response?.data?.errors;
            if (validationErrors && typeof validationErrors === 'object') {
                setErrors((prev) => ({ ...prev, ...validationErrors }));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddClick = () => {
        setEditingTeacher(null);
        setAssignmentGroups([{ standard: "", divisions: [] }]);
        setForm({
            name: "",
            email: "",
            phone: "",
            standardDivisions: [{ standard: "", division: "" }],
            schoolName: schools.length > 0 ? schools[0].name : "",
            password: "",
            confirmPassword: "",
            department: "",
            experience: "",
            qualification: "",
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleEditClick = (teacher) => {
        setEditingTeacher(teacher);
        
        let initialGroups = [];
        if (Array.isArray(teacher.standardDivisions) && teacher.standardDivisions.length > 0) {
            const map = new Map();
            teacher.standardDivisions.forEach((sd) => {
                const std = sd.standard || "";
                const div = sd.division || "";
                if (std) {
                    if (!map.has(std)) map.set(std, []);
                    if (div && !map.get(std).includes(div)) {
                        map.get(std).push(div);
                    }
                }
            });
            map.forEach((divs, std) => {
                initialGroups.push({ standard: std, divisions: divs.sort() });
            });
        } else if (teacher.standard || teacher.division) {
            initialGroups.push({
                standard: teacher.standard || "",
                divisions: teacher.division ? [teacher.division] : []
            });
        }
        if (initialGroups.length === 0) {
            initialGroups = [{ standard: "", divisions: [] }];
        }
        setAssignmentGroups(initialGroups);

        let assignments = [{ standard: "", division: "" }];
        if (Array.isArray(teacher.standardDivisions) && teacher.standardDivisions.length > 0) {
            assignments = teacher.standardDivisions.map(sd => ({
                standard: sd.standard || "",
                division: sd.division || ""
            }));
        } else if (teacher.standard || teacher.division) {
            assignments = [{
                standard: teacher.standard || "",
                division: teacher.division || ""
            }];
        }

        setForm({
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone || "",
            standardDivisions: assignments,
            schoolName: teacher.schoolName || (schools.length > 0 ? schools[0].name : ""),
            password: "",
            confirmPassword: "",
            department: teacher.department || "",
            experience: teacher.experience || "",
            qualification: teacher.qualification || "",
        });
        setErrors({});
        setModalOpen(true);
    };

    const location = useLocation();

    // Auto-open teacher modal if navigated from notification
    useEffect(() => {
        const queryTeacherId = searchParams.get("teacherId") || searchParams.get("id");
        const targetTeacherId = location.state?.viewTeacherId || (queryTeacherId ? Number(queryTeacherId) : null);
        if (targetTeacherId) {
            if (location.state?.viewTeacherId) {
                window.history.replaceState({}, document.title);
            }
            teacherApi.getTeacherById(targetTeacherId)
                .then((teacherData) => {
                    if (teacherData) {
                        handleEditClick({
                            ...teacherData,
                            name: (`${teacherData.firstName || ""} ${teacherData.lastName || ""}`).trim() || "Unknown Teacher",
                            status: teacherData.active ? "Active" : "Inactive"
                        });
                    }
                })
                .catch((err) => {
                    console.warn("Could not load target teacher by id:", err);
                });
        }
    }, [location.state?.viewTeacherId, searchParams]);

    const handleDeleteClick = (teacher) => {
        triggerConfirm(
            "Delete Teacher?",
            `Are you sure you want to permanently remove teacher "${teacher.name}" from the system? They will be unlinked from ${teacher.schoolName || "their assigned school"}.`,
            async () => {
                setIsLoading(true);
                try {
                    teachersCache.teachers = null;
                    setTeachersList((prev) => prev.filter((t) => t.id !== teacher.id));
                    await teacherApi.deleteTeacher(teacher.id);
                    window.dispatchEvent(new CustomEvent("school_data_updated", { detail: { type: "teacher", action: "delete", id: teacher.id } }));
                    triggerToast(`Teacher "${teacher.name}" deleted successfully.`);
                    await loadTeachers(true);
                } catch (err) {
                    console.error("Delete error:", err);
                    triggerToast("Failed to delete teacher");
                } finally {
                    setIsLoading(false);
                }
            }
        );
    };

    const handleToggleStatus = async (teacher) => {
        const isCurrentlyActive = teacher.status === "Active";
        const nextStatus = isCurrentlyActive ? "Inactive" : "Active";

        try {
            if (isCurrentlyActive) {
                await teacherApi.deactivateTeacher(teacher.id);
            } else {
                await teacherApi.activateTeacher(teacher.id);
            }

            setTeachersList((prev) =>
                prev.map((t) => (t.id === teacher.id ? { ...t, status: nextStatus, active: !isCurrentlyActive } : t))
            );
            window.dispatchEvent(new CustomEvent("school_data_updated", { detail: { type: "teacher", action: "status", id: teacher.id } }));
            triggerToast(`Status for "${teacher.name}" changed to ${nextStatus}.`);
        } catch (err) {
            console.error("Toggle status error:", err);
            triggerToast("Failed to change teacher status");
        }
    };

    // Dynamic filter options derived from actual teacher data
    const schoolOptions = (() => {
        const set = new Set();
        teachersList.forEach((t) => {
            if (t.schoolName && t.schoolName !== "None" && String(t.schoolName).trim() !== "") {
                set.add(String(t.schoolName).trim());
            }
        });
        return ["All", ...Array.from(set).sort()];
    })();

    const departmentOptions = (() => {
        const set = new Set();
        teachersList.forEach((t) => {
            if (t.department) set.add(t.department);
        });
        return ["All", ...Array.from(set).sort()];
    })();

    const assignmentOptions = (() => {
        const set = new Set();
        teachersList.forEach((t) => {
            if (Array.isArray(t.standardDivisions)) {
                t.standardDivisions.forEach(sd => {
                    if (sd.standard && sd.division) set.add(`${sd.standard}-${sd.division}`);
                });
            } else if (t.standard && t.division) {
                set.add(`${t.standard}-${t.division}`);
            }
        });
        return ["All", ...Array.from(set).sort()];
    })();

    const getStudentsForTeacher = (teacherParam) => {
        if (!teacherParam) return [];
        const teacherId = teacherParam.id;
        const teacherName = (teacherParam.name || `${teacherParam.firstName || ""} ${teacherParam.lastName || ""}`).trim();
        const teacherSchoolId = teacherParam.schoolId;
        const teacherSchoolName = teacherParam.schoolName;
        const teacherStandardDivisions = Array.isArray(teacherParam.standardDivisions) && teacherParam.standardDivisions.length > 0
            ? teacherParam.standardDivisions
            : (teacherParam.standard || teacherParam.division ? [{ standard: teacherParam.standard, division: teacherParam.division }] : []);

        return students.filter((s) => {
            // Rule 1: Direct teacher ID match (primary reliable database relationship)
            if (teacherId && s.teacherId && Number(s.teacherId) === Number(teacherId)) {
                return true;
            }
            // Rule 2: Direct teacher name match (checks assignedTeacher from DTO first, falls back to teacherName)
            const studentAssignedTeacher = (s.assignedTeacher || s.teacherName || "").trim().toLowerCase();
            if (teacherName && studentAssignedTeacher && studentAssignedTeacher === teacherName.toLowerCase()) {
                return true;
            }
            // Rule 3: School-scoped standard and division match
            const matchesSchool = !teacherSchoolName && !teacherSchoolId ? true : (
                (teacherSchoolId && s.schoolId && Number(s.schoolId) === Number(teacherSchoolId)) ||
                (teacherSchoolName && s.schoolName && s.schoolName.trim().toLowerCase() === teacherSchoolName.trim().toLowerCase()) ||
                (!s.schoolId && !s.schoolName)
            );

            if (matchesSchool && teacherStandardDivisions.length > 0) {
                return teacherStandardDivisions.some(sd => {
                    const tStd = normalizeStd(sd.standard);
                    const sStd = normalizeStd(s.standard);
                    const tDiv = String(sd.division || "").trim().toUpperCase();
                    const sDiv = String(s.division || "").trim().toUpperCase();

                    if (!tStd || !sStd) return false;
                    if (tStd !== sStd) return false;

                    if (tDiv && sDiv) {
                        return tDiv === sDiv;
                    }
                    return true;
                });
            }
            return false;
        });
    };

    const getStudentCount = (teacherParam) => {
        return getStudentsForTeacher(teacherParam).length;
    };

    const selectedSchool = schools.find((s) => s.name === form.schoolName);
    const formDivisionOptions = generateDivisionOptions(selectedSchool?.divisionCount);
    const fallbackStandards = STANDARD_OPTIONS.map(std => ({
        standard: std,
        divisions: formDivisionOptions
    }));
    const activeConfig = schoolStandardsConfig.length > 0 ? schoolStandardsConfig : fallbackStandards;

    const filtered = teachersList.filter((t) => {
        const q = (search || "").trim().toLowerCase();
        const teacherSchool = (t.schoolName && t.schoolName !== "None" ? t.schoolName : "").trim();
        const matchesSearch =
            !q ||
            t.name.toLowerCase().includes(q) ||
            t.email.toLowerCase().includes(q) ||
            teacherSchool.toLowerCase().includes(q) ||
            (t.department && t.department.toLowerCase().includes(q));
            
        const matchesSchool = filters.school === "All" || teacherSchool === filters.school;
        const matchesDept = filters.department === "All" || t.department === filters.department;
        const matchesStatus = filters.status === "All" || t.status === filters.status;
        
        let matchesAssignment = filters.assignment === "All";
        if (!matchesAssignment) {
            if (Array.isArray(t.standardDivisions)) {
                matchesAssignment = t.standardDivisions.some(sd => `${sd.standard}-${sd.division}` === filters.assignment);
            } else if (t.standard && t.division) {
                matchesAssignment = `${t.standard}-${t.division}` === filters.assignment;
            }
        }
        
        return matchesSearch && matchesSchool && matchesDept && matchesStatus && matchesAssignment;
    });

    const activeFilterCount = Object.values(filters).filter(v => v !== "All" && v !== "Any").length;

    const handleExport = () => {
        if (filtered.length === 0) {
            triggerToast("No data to export");
            return;
        }

        const sortedData = [...filtered].sort((a, b) => {
            const numA = a?.id !== null && a?.id !== undefined && a?.id !== "" && !isNaN(Number(a.id)) ? Number(a.id) : Infinity;
            const numB = b?.id !== null && b?.id !== undefined && b?.id !== "" && !isNaN(Number(b.id)) ? Number(b.id) : Infinity;
            return numA - numB;
        });
        
        const headers = ["Name", "Email", "Phone", "Department", "Assignment", "Status", "School"];
        const csvRows = [headers.join(",")];
        
        sortedData.forEach(t => {
            const assignments = (t.standardDivisions && t.standardDivisions.length > 0) 
                ? t.standardDivisions.map(sd => `${sd.standard}-${sd.division}`).join("; ")
                : (t.standard && t.division) ? `${t.standard}-${t.division}` : "";
            
            const row = [
                `"${t.name}"`,
                `"${t.email}"`,
                `"${t.phone || ""}"`,
                `"${t.department || ""}"`,
                `"${assignments}"`,
                `"${t.status}"`,
                `"${t.schoolName || ""}"`
            ];
            csvRows.push(row.join(","));
        });
        
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `teachers_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        <UserPlus className="h-5 w-5" />
                    </span>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                                Teachers
                            </h1>
                            {isLoading && (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                            )}
                        </div>
                        <p className="text-[13px] text-[var(--text-secondary)]">
                            {isLoading ? "Loading teachers..." : `${filtered.length} teachers registered`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={handleExport} className="!h-10 shrink-0 font-medium hidden sm:flex">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button onClick={handleAddClick} className="!h-10 shrink-0 font-medium">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Teacher
                    </Button>
                </div>
            </motion.div>

            {/* List panel */}
            <SectionCard
                title="All Teachers"
                subtitle="Manage teachers and view their assigned students"
                delay={0.05}
                bodyClassName="p-0"
                action={
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                            <Input
                                placeholder="Search teachers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="!h-10 !pl-9 text-sm"
                            />
                        </div>
                    </div>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="px-5 py-3"></th>
                                <th className="px-5 py-3">
                                    <select
                                        value={filters.school}
                                        onChange={(e) => setFilters(prev => ({ ...prev, school: e.target.value }))}
                                        className="form-control h-8 w-full min-w-[150px] rounded-md border border-slate-200 bg-white px-2 py-0 text-[13px] text-slate-700 shadow-sm focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {schoolOptions.map(s => <option key={s} value={s}>{s === 'All' ? 'All Schools' : s}</option>)}
                                    </select>
                                </th>
                                <th className="px-5 py-3">
                                    <select
                                        value={filters.department}
                                        onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                                        className="form-control h-8 w-full min-w-[140px] rounded-md border border-slate-200 bg-white px-2 py-0 text-[13px] text-slate-700 shadow-sm focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {departmentOptions.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                                    </select>
                                </th>
                                <th className="px-5 py-3">
                                    <select
                                        value={filters.assignment}
                                        onChange={(e) => setFilters(prev => ({ ...prev, assignment: e.target.value }))}
                                        className="form-control h-8 w-full min-w-[140px] rounded-md border border-slate-200 bg-white px-2 py-0 text-[13px] text-slate-700 shadow-sm focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {assignmentOptions.map(a => <option key={a} value={a}>{a === 'All' ? 'All Classes' : a}</option>)}
                                    </select>
                                </th>
                                <th className="px-5 py-3"></th>
                                <th className="px-5 py-3">
                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                        className="form-control h-8 w-full min-w-[130px] rounded-md border border-slate-200 bg-white px-2 py-0 text-[13px] text-slate-700 shadow-sm focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </th>
                                <th className="px-5 py-3 text-right">
                                    {activeFilterCount > 0 && (
                                        <button 
                                            onClick={() => setFilters({ school: "All", department: "All", assignment: "All", status: "All", students: "Any" })}
                                            className="text-[12px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </th>
                            </tr>
                            <tr className="border-b border-[var(--border-subtle)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                <th className="px-5 py-4 w-[24%]">TEACHER</th>
                                <th className="px-5 py-4 w-[18%]">SCHOOL</th>
                                <th className="px-5 py-4 w-[13%]">DEPARTMENT</th>
                                <th className="px-5 py-4 w-[18%]">CLASSES</th>
                                <th className="px-5 py-4 w-[13%]">ASSIGNED STUDENTS</th>
                                <th className="px-5 py-4 w-[9%]">STATUS</th>
                                <th className="px-5 py-4 w-[5%] text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                            {isLoading && (!filtered || filtered.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 text-center">
                                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-500 shadow-sm" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">Loading teachers...</p>
                                                <p className="text-xs text-[var(--text-secondary)]">Please wait while teacher records are being fetched.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {(!isLoading || (filtered && filtered.length > 0)) && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
                                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                                <UserPlus className="h-6 w-6" />
                                            </div>
                                            <h3 className="mb-1 text-lg font-semibold text-[var(--text-primary)]">
                                                {teachersList.length === 0 ? "No teachers registered" : "No matches found"}
                                            </h3>
                                            <p className="text-sm text-[var(--text-secondary)]">
                                                {teachersList.length === 0 
                                                    ? "Add your first teacher to get started managing their assignments and schedules." 
                                                    : "Try adjusting your search term to find what you're looking for."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {filtered && filtered.length > 0 && filtered.map((t) => (
                                <tr
                                    key={t.id}
                                    className="text-[13px] transition-colors hover:bg-[var(--bg-hover)]"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <InsigniaBadge
                                                name={t.name}
                                                email={t.email}
                                                role="TEACHER"
                                                size="sm"
                                                className="!h-9 !w-9 shrink-0 text-xs rounded-full shadow-xs"
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[var(--text-primary)]">{t.name}</span>
                                                <span className="text-[12px] text-[var(--text-muted)] mt-0.5">
                                                    {t.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {t.schoolName && t.schoolName !== "None" ? (
                                            <div className="flex items-center gap-1.5 max-w-[200px]">
                                                <Building2 className="h-3.5 w-3.5 text-indigo-500/70 shrink-0" />
                                                <span className="font-medium text-[var(--text-secondary)] truncate" title={t.schoolName}>
                                                    {t.schoolName}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[var(--text-muted)] font-medium">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 font-medium text-[var(--text-secondary)]">{t.department || "—"}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                            {(() => {
                                                let stds = [];
                                                if (Array.isArray(t.standardDivisions) && t.standardDivisions.length > 0) {
                                                    stds = t.standardDivisions;
                                                } else if (t.standard || t.division) {
                                                    stds = [{ standard: t.standard, division: t.division }];
                                                }
                                                
                                                if (stds.length === 0) {
                                                    return <span className="text-[var(--text-muted)] font-medium">—</span>;
                                                }
                                                
                                                return stds.map((sd, idx) => (
                                                    <span
                                                        key={`${sd.standard}-${sd.division || ""}-${idx}`}
                                                        className="inline-flex items-center rounded-md bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)] whitespace-nowrap"
                                                    >
                                                        {sd.standard}{sd.division ? `-${sd.division}` : ""}
                                                    </span>
                                                ));
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedTeacherForStudents(t);
                                                if (students.length === 0) {
                                                    loadStudents();
                                                }
                                            }}
                                            className="inline-flex items-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition cursor-pointer"
                                            title="Click to view assigned students"
                                        >
                                            {getStudentCount(t)}
                                        </button>
                                    </td>
                                    <td className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(t)}
                                            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold cursor-pointer hover:opacity-80 transition ${STATUS_STYLES[t.status] || STATUS_STYLES["Inactive"]
                                                }`}
                                            title="Click to toggle status"
                                        >
                                            {t.status}
                                        </button>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {t.status === "Active" ? (
                                                <button
                                                    type="button"
                                                    title="Deactivate Teacher"
                                                    aria-label={`Deactivate ${t.name}`}
                                                    onClick={() => handleToggleStatus(t)}
                                                    className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm transition hover:bg-amber-50 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-amber-900/30 dark:hover:text-amber-400"
                                                >
                                                    <UserX className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    title="Activate Teacher"
                                                    aria-label={`Activate ${t.name}`}
                                                    onClick={() => handleToggleStatus(t)}
                                                    className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
                                                >
                                                    <UserCheck className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleEditClick(t)}
                                                aria-label={`Edit ${t.name}`}
                                                className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteClick(t)}
                                                aria-label={`Delete ${t.name}`}
                                                className="rounded-md border border-rose-100 bg-rose-50 p-1.5 text-rose-600 shadow-sm transition hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* Add / Edit Modal Dialog */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingTeacher ? "Edit Teacher Settings" : "Add Teacher Account"}
                description={editingTeacher ? "Update teacher's profile and credentials." : "Register a new teacher profile."}
                maxWidth="max-w-3xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Input
                                label="Teacher Name"
                                placeholder="Enter Full Name"
                                value={form.name}
                                onChange={update("name")}
                                error={errors.name}
                            />
                        </div>
                        <div>
                            <Input
                                label="Teacher Email"
                                type="email"
                                placeholder="Enter Email Address"
                                value={form.email}
                                onChange={update("email")}
                                error={errors.email}
                            />
                        </div>
                        <div>
                            <Input
                                label="Phone Number"
                                placeholder="e.g. +91 98765 43210"
                                value={form.phone}
                                onChange={update("phone")}
                                error={errors.phone}
                            />
                        </div>
                        <div>
                            <Input
                                label="Department"
                                placeholder="e.g. Science & Maths"
                                value={form.department}
                                onChange={update("department")}
                                error={errors.department}
                            />
                        </div>
                        <div>
                            <Input
                                label="Qualification"
                                placeholder="e.g. B.Ed, M.Sc"
                                value={form.qualification}
                                onChange={update("qualification")}
                                error={errors.qualification}
                            />
                        </div>
                        <div>
                            <Input
                                label="Experience"
                                placeholder="e.g. 5 Years"
                                value={form.experience}
                                onChange={update("experience")}
                                error={errors.experience}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                Assigned School
                            </span>
                            <SchoolSelect
                                value={form.schoolName}
                                onChange={(e) => {
                                    const nextSchoolName = e.target.value;
                                    setForm((prev) => ({
                                        ...prev,
                                        schoolName: nextSchoolName,
                                        standardDivisions: [{ standard: "", division: "" }] // reset assignments when school changes
                                    }));
                                    setAssignmentGroups([{ standard: "", divisions: [] }]);
                                }}
                                schools={schools}
                                disabled={schools.length === 0}
                                placeholder="Select a school"
                            />
                        </div>
                        <StandardDivisionPicker
                            assignmentGroups={assignmentGroups}
                            onChange={(newGroups, newAssignments) => {
                                setAssignmentGroups(newGroups);
                                setForm((prev) => ({ ...prev, standardDivisions: newAssignments }));
                                if (errors.standardDivisions) {
                                    setErrors((prev) => ({ ...prev, standardDivisions: undefined }));
                                }
                            }}
                            activeConfig={activeConfig}
                            error={errors.standardDivisions}
                            disabled={isSubmitting}
                            teachers={teachersList}
                            editingTeacherId={editingTeacher?.id}
                            editingTeacherEmail={editingTeacher?.email}
                            editingTeacherName={editingTeacher?.name}
                            schoolId={schools.find((s) => s.name === form.schoolName)?.id || editingTeacher?.schoolId}
                            onConflictsChange={setConflicts}
                        />
                        <div>
                            <Input
                                label={editingTeacher ? "New Password (Optional)" : "Password"}
                                type="password"
                                placeholder="••••••••"
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
                                placeholder="••••••••"
                                value={form.confirmPassword}
                                onChange={update("confirmPassword")}
                                error={errors.confirmPassword}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className="sticky bottom-0 z-10 bg-[var(--bg-surface)] mt-4 flex justify-end gap-3 border-t border-[var(--border-subtle)] pt-3 pb-1">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || assignmentConflicts.length > 0}
                            title={assignmentConflicts.length > 0 ? "Resolve assignment conflicts to continue" : undefined}
                        >
                            {isSubmitting ? (editingTeacher ? "Saving..." : "Adding...") : (editingTeacher ? "Save Changes" : "Add Teacher")}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Custom Modal Confirmation Dialog */}
            <AnimatePresence>
                {confirmDialog.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
                        onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                    >
                        <motion.div
                            role="alertdialog"
                            initial={{ y: 20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 text-rose-600 mb-3">
                                <AlertTriangle className="h-6 w-6" />
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                    {confirmDialog.title}
                                </h3>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {confirmDialog.message}
                            </p>
                            <div className="mt-6 flex justify-end gap-2.5">
                                <Button
                                    variant="secondary"
                                    onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                                    className="!h-10 text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={async () => {
                                        setIsLoading(true);
                                        await confirmDialog.onConfirm();
                                        setIsLoading(false);
                                        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                                    }}
                                    className="!h-10 text-xs"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Deleting..." : "Confirm Action"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toasts Notification Overlay */}
            <div className="fixed bottom-5 right-5 z-[150] flex flex-col gap-2 max-w-md w-full">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            role="status"
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl ${
                                t.type === "error"
                                    ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/90 dark:text-rose-200"
                                    : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            }`}
                        >
                            {t.type === "error" ? (
                                <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                            ) : (
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                            )}
                            <span className="font-medium leading-snug">{t.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Teacher Students Modal */}
            <TeacherStudentsModal
                isOpen={Boolean(selectedTeacherForStudents)}
                teacher={selectedTeacherForStudents ? {
                    ...selectedTeacherForStudents,
                    name: selectedTeacherForStudents.name || `${selectedTeacherForStudents.firstName || ""} ${selectedTeacherForStudents.lastName || ""}`.trim(),
                    subject: selectedTeacherForStudents.department || "Teacher"
                } : null}
                students={selectedTeacherForStudents ? getStudentsForTeacher(selectedTeacherForStudents).map(s => ({
                    id: s.id,
                    name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.name || "Student",
                    standard: s.standard,
                    division: s.division,
                    rollNo: s.rollNumber || s.rollNo || s.studentId || `RN-${s.id}`,
                    progress: { xp: s.totalLessonsCompleted ? s.totalLessonsCompleted * 100 : 0 }
                })) : []}
                onClose={() => setSelectedTeacherForStudents(null)}
            />
        </div>
    );
}

export default Teachers;
