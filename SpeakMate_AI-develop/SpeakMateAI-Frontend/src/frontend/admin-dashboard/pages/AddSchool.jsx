import { useEffect, useState, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Building2, Plus, Search, Edit, Trash2, AlertTriangle, X, CheckCircle2, Mail, ShieldCheck, UserX, UserCheck, User } from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import Modal from "@components/common/Modal";
import SectionCard from "@admin/components/SectionCard";
import AcademicStructureBuilder from "@admin/components/AcademicStructureBuilder";
import InsigniaBadge from "@components/common/InsigniaBadge";
import { schoolApi } from "@services/admin/schoolApi";
import { adminUserApi } from "@services/admin/adminUserApi";
import { getIndianMobileError, normalizeIndianMobile, sanitizeMobileInput } from "@utils/phoneValidator";

const EMPTY_FORM = {
    schoolName: "",
    schoolAddress: "",
    schoolEmail: "",
    city: "",
    state: "",
    pincode: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
};

let schoolsCache = null;

export function AddSchool() {
    const [pageMode, setPageMode] = useState("list");
    const [schools, setSchools] = useState(() => schoolsCache || []);
    const [isLoadingSchools, setIsLoadingSchools] = useState(() => !schoolsCache || schoolsCache.length === 0);
    const [schoolsError, setSchoolsError] = useState("");
    const [form, setForm] = useState(EMPTY_FORM);
    const [academicStructure, setAcademicStructure] = useState([]);
    const [errors, setErrors] = useState({});

    // Admin Email Verification state (memory only, never persisted)
    const [verificationToken, setVerificationToken] = useState(null);
    const [verifiedAdminEmail, setVerifiedAdminEmail] = useState(null);
    const [emailVerified, setEmailVerified] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [verificationError, setVerificationError] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toasts, setToasts] = useState([]);
    
    // Edit & Delete State
    const [schoolToDelete, setSchoolToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [schoolToEdit, setSchoolToEdit] = useState(null);
    const [editForm, setEditForm] = useState({ 
        schoolName: "", 
        address: "", 
        contactPhone: "",
        adminEmail: "" 
    });
    const [isEditing, setIsEditing] = useState(false);
    
    // Search, Status & Sort state
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchParams] = useSearchParams();

    // Respect ?status=active or ?status=inactive from KPI card navigation
    useEffect(() => {
        const statusParam = searchParams.get("status");
        if (statusParam?.toLowerCase() === "active") {
            setStatusFilter("active");
        } else if (statusParam?.toLowerCase() === "inactive") {
            setStatusFilter("inactive");
        }
    }, [searchParams]);

    const filteredSchools = useMemo(() => {
        let result = [...schools];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => 
                (s.name && s.name.toLowerCase().includes(q)) || 
                (s.schoolCode && s.schoolCode.toLowerCase().includes(q)) ||
                (s.adminName && s.adminName.toLowerCase().includes(q)) ||
                (s.adminEmail && s.adminEmail.toLowerCase().includes(q))
            );
        }
        if (statusFilter === "active") {
            result = result.filter(s => s.active !== false);
        } else if (statusFilter === "inactive") {
            result = result.filter(s => s.active === false);
        }
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });
        return result;
    }, [schools, searchQuery, sortOrder, statusFilter]);

    const loadSchools = async (isBackground = false) => {
        if (!isBackground && (!schoolsCache || schoolsCache.length === 0)) {
            setIsLoadingSchools(true);
        }
        setSchoolsError("");
        try {
            const data = await schoolApi.getSchools();
            let list = Array.isArray(data) ? data : [];

            // If any school has missing admin details, enrich via adminUserApi
            try {
                const needsAdminLookup = list.some(s => !s.adminName && !s.adminEmail);
                if (needsAdminLookup) {
                    const usersRes = await adminUserApi.getAllUsers(0, 100);
                    const allUsers = usersRes?.data?.content || [];
                    const adminMap = new Map();
                    allUsers.forEach(u => {
                        const r = String(u.role || "").toUpperCase();
                        if ((r.includes("SCHOOL_ADMIN") || r.includes("SCHOOL")) && u.schoolId) {
                            if (!adminMap.has(Number(u.schoolId))) {
                                adminMap.set(Number(u.schoolId), u);
                            }
                        }
                    });
                    list = list.map(s => {
                        if (s.adminName || s.adminEmail) return s;
                        const adm = adminMap.get(Number(s.id));
                        if (adm) {
                            return {
                                ...s,
                                adminId: adm.id,
                                adminName: (`${adm.firstName || ""} ${adm.lastName || ""}`).trim() || adm.name || "School Admin",
                                adminEmail: adm.email,
                                adminPhone: adm.phone
                            };
                        }
                        return s;
                    });
                }
            } catch (enrichErr) {
                console.debug("School admin enrichment note:", enrichErr);
            }

            schoolsCache = list;
            setSchools(list);
        } catch (err) {
            console.error("Failed to load schools:", err);
            const message = err.response?.data?.message || err.message || "Unable to load schools.";
            if (!schoolsCache || schoolsCache.length === 0) {
                setSchoolsError(message);
            }
        } finally {
            setIsLoadingSchools(false);
        }
    };

    useEffect(() => {
        loadSchools(Boolean(schoolsCache));
    }, []);

    const openCreateForm = () => {
        handleReset();
        setPageMode("form");
    };

    const handleBackToSchools = () => {
        if (isSubmitting) return;
        handleReset();
        setPageMode("list");
    };

    const formatCreatedDate = (value) => {
        if (!value) return "—";
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? value
            : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };

    const triggerToast = (message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    const update = (field) => (event) => {
        let val = event.target.value;
        if (field === "adminPhone") {
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
        // Mandatory Reset: If adminEmail is modified after verification, reset state
        if (field === "adminEmail") {
            setVerificationError("");
            if (emailVerified || verificationToken || verifiedAdminEmail) {
                setEmailVerified(false);
                setVerificationToken(null);
                setVerifiedAdminEmail(null);
                setOtp("");
                setOtpError("");
            }
        }
    };

    const validate = () => {
        const next = {};
        if (!form.schoolName.trim()) next.schoolName = "School name is required";
        if (!form.schoolAddress.trim()) next.schoolAddress = "Address is required";
        if (!form.schoolEmail.trim()) next.schoolEmail = "School email is required";
        else if (!/\S+@\S+\.\S+/.test(form.schoolEmail)) next.schoolEmail = "Enter a valid email";
        if (!form.city.trim()) next.city = "City is required";
        if (!form.state.trim()) next.state = "State is required";
        if (!form.pincode.trim()) next.pincode = "Pincode is required";
        
        if (academicStructure.length === 0) {
            next.academicStructure = "At least one standard must be configured";
        } else {
            for (let i = 0; i < academicStructure.length; i++) {
                if (academicStructure[i].divisions.length === 0) {
                    next.academicStructure = `Standard ${academicStructure[i].standard} must have at least one division`;
                    break;
                }
            }
        }

        if (!form.adminName.trim()) next.adminName = "Admin name is required";
        if (!form.adminEmail.trim()) next.adminEmail = "Admin email is required";
        else if (!/\S+@\S+\.\S+/.test(form.adminEmail)) next.adminEmail = "Enter a valid email";
        
        const phoneErr = getIndianMobileError(form.adminPhone, "Phone number", true);
        if (phoneErr) next.adminPhone = phoneErr;

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSendOtp = async () => {
        const email = form.adminEmail.trim();
        if (!email) {
            setErrors((prev) => ({ ...prev, adminEmail: "Admin email is required" }));
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors((prev) => ({ ...prev, adminEmail: "Enter a valid email" }));
            return;
        }

        setIsSendingOtp(true);
        setVerificationError("");
        setOtpError("");
        try {
            const res = await schoolApi.sendAdminVerificationOtp(email);
            setOtp("");
            setOtpModalOpen(true);
            triggerToast(res?.message || "A 6-digit OTP has been sent to the School Admin email.");
        } catch (err) {
            console.error("Failed to send OTP:", err);
            const msg = err.response?.data?.message || err.message || "Failed to send OTP. Please try again.";
            setVerificationError(msg);
            triggerToast(msg);
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        const cleanOtp = otp.trim();
        if (!cleanOtp || cleanOtp.length !== 6) {
            setOtpError("Please enter a valid 6-digit numeric OTP");
            return;
        }

        const email = form.adminEmail.trim();
        setIsVerifyingOtp(true);
        setOtpError("");
        try {
            const res = await schoolApi.verifyAdminVerificationOtp(email, cleanOtp);
            if (res.verificationToken) {
                setVerificationToken(res.verificationToken);
                setVerifiedAdminEmail(res.verifiedEmail || email);
                setEmailVerified(true);
                setOtpModalOpen(false);
                setOtp("");
                setOtpError("");
                setVerificationError("");
                triggerToast(res.message || "Email verified successfully.");
            } else {
                setOtpError("Verification failed. No token received.");
            }
        } catch (err) {
            console.error("OTP verification failed:", err);
            const msg = err.response?.data?.message || err.message || "Invalid OTP. Please try again.";
            setOtpError(msg);
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        if (!emailVerified || !verificationToken) {
            triggerToast("Please verify the School Admin email first.");
            return;
        }

        // Strict client-side check: form adminEmail must match verified adminEmail
        if (form.adminEmail.trim().toLowerCase() !== (verifiedAdminEmail || "").toLowerCase()) {
            triggerToast("School Admin email does not match the verified email. Please verify again.");
            setEmailVerified(false);
            setVerificationToken(null);
            setVerifiedAdminEmail(null);
            return;
        }

        setIsSubmitting(true);
        try {
            // Split Admin Name into First and Last names
            const nameParts = form.adminName.trim().split(/\s+/);
            const adminFirstName = nameParts[0] || "";
            const adminLastName = nameParts.slice(1).join(" ") || "Admin";

            // Combine school address with city, state, pincode for backend TEXT address
            const addressParts = [
                form.schoolAddress.trim(),
                form.city.trim(),
                form.state.trim(),
                form.pincode.trim()
            ].filter(Boolean);
            const combinedAddress = addressParts.join(", ");

            // Calculate legacy divisionCount based on max configured divisions
            const maxDivisions = academicStructure.reduce((max, std) => 
                std.divisions.length > max ? std.divisions.length : max
            , 1);

            const payload = {
                schoolName: form.schoolName.trim(),
                address: combinedAddress,
                contactPhone: normalizeIndianMobile(form.adminPhone),
                divisionCount: maxDivisions,
                adminFirstName: adminFirstName,
                adminLastName: adminLastName,
                adminEmail: form.adminEmail.trim(),
                verificationToken: verificationToken
            };

            // 1. Create School
            const newSchool = await schoolApi.createSchool(payload);
            
            try {
                // 2. Configure Academic Structure
                await schoolApi.configureSchoolStandards(newSchool.id, academicStructure);
                
                triggerToast(`School created successfully! Complete institutional details and credentials emailed to ${payload.adminEmail}`);
                handleReset();
                setPageMode("list");
                await loadSchools();
            } catch (configErr) {
                console.error("Failed to configure academic structure:", configErr);
                triggerToast(`School created and credentials emailed to ${payload.adminEmail}, but academic structure configuration could not be saved.`);
                handleReset();
                setPageMode("list");
                await loadSchools();
            }

        } catch (err) {
            console.error("Failed to create school:", err);
            const errMsg = err.response?.data?.message || err.message || "An error occurred while creating the school.";
            triggerToast(errMsg);
            
            if (err.response?.status === 400 || err.response?.status === 403) {
                const lower = errMsg.toLowerCase();
                if (lower.includes("verification") || lower.includes("token") || lower.includes("expired") || lower.includes("consumed")) {
                    setEmailVerified(false);
                    setVerificationToken(null);
                    setVerifiedAdminEmail(null);
                }
            }

            const validationErrors = err.response?.data?.errors;
            if (validationErrors && typeof validationErrors === "object" && validationErrors.contactPhone) {
                setErrors((prev) => ({ ...prev, adminPhone: validationErrors.contactPhone }));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (isSubmitting) return;
        setForm(EMPTY_FORM);
        setAcademicStructure([]);
        setErrors({});
        setVerificationToken(null);
        setVerifiedAdminEmail(null);
        setEmailVerified(false);
        setOtp("");
        setOtpError("");
        setOtpModalOpen(false);
        setVerificationError("");
    };

    const confirmDeleteSchool = (school) => {
        setSchoolToDelete(school);
    };

    const handleDeleteSchool = async () => {
        if (!schoolToDelete) return;
        const targetId = schoolToDelete.id;
        const schoolName = schoolToDelete.name || "School";
        setIsDeleting(true);
        try {
            setSchools((prev) => prev.filter((s) => s.id !== targetId));
            setSchoolToDelete(null);
            await schoolApi.deleteSchool(targetId);
            window.dispatchEvent(new CustomEvent("school_data_updated", { detail: { type: "school", action: "delete", id: targetId } }));
            triggerToast(`School "${schoolName}" deleted successfully`);
            await loadSchools();
        } catch (err) {
            console.error("Failed to delete school:", err);
            triggerToast(err.response?.data?.message || err.message || "Failed to delete school");
            await loadSchools();
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditModal = (school) => {
        setSchoolToEdit(school);
        setEditForm({
            schoolName: school.name || "",
            address: school.address || "",
            contactPhone: school.contactPhone || "",
            adminEmail: school.adminEmail || ""
        });
    };

    const location = useLocation();

    // Auto-open school modal if navigated from notification
    useEffect(() => {
        const querySchoolId = searchParams.get("schoolId") || searchParams.get("id");
        const targetSchoolId = location.state?.viewSchoolId || (querySchoolId ? Number(querySchoolId) : null);
        if (targetSchoolId) {
            schoolApi.getSchoolById(targetSchoolId)
                .then((schoolData) => {
                    if (schoolData) {
                        openEditModal(schoolData);
                    }
                })
                .catch((err) => {
                    console.warn("Could not load target school details:", err);
                });
        }
    }, [location.state?.viewSchoolId, searchParams]);

    const handleUpdateSchool = async (e) => {
        e.preventDefault();
        if (!schoolToEdit) return;
        
        if (!editForm.schoolName.trim() || !editForm.address.trim() || !editForm.contactPhone.trim() || !editForm.adminEmail.trim()) {
            triggerToast("All fields are required");
            return;
        }

        const phoneErr = getIndianMobileError(editForm.contactPhone, "Contact phone", true);
        if (phoneErr) {
            triggerToast(phoneErr);
            return;
        }

        setIsEditing(true);
        try {
            // Need to pass dummy adminFirstName, adminLastName, and actual divisionCount to satisfy @Valid constraints
            const payload = {
                ...editForm,
                contactPhone: normalizeIndianMobile(editForm.contactPhone),
                adminFirstName: "Admin",
                adminLastName: "User",
                divisionCount: schoolToEdit.divisionCount || schoolToEdit.totalDivisions || 1
            };
            await schoolApi.updateSchool(schoolToEdit.id, payload);
            triggerToast("School updated successfully");
            setSchoolToEdit(null);
            loadSchools();
        } catch (err) {
            console.error("Failed to update school:", err);
            triggerToast(err.response?.data?.message || err.message || "Failed to update school");
        } finally {
            setIsEditing(false);
        }
    };

    const handleToggleSchoolStatus = async (school) => {
        const nextActive = !school.active;
        const nextStatus = nextActive ? "Active" : "Inactive";

        try {
            if (nextActive) {
                await schoolApi.activateSchool(school.id);
            } else {
                await schoolApi.deactivateSchool(school.id);
            }

            setSchools((prev) =>
                prev.map((s) => (s.id === school.id ? { ...s, active: nextActive } : s))
            );
            window.dispatchEvent(new CustomEvent("school_data_updated", { detail: { type: "school", action: "status", id: school.id } }));
            triggerToast(`School "${school.name || school.schoolName}" is now ${nextStatus}.`);
        } catch (err) {
            console.error("Failed to toggle school status:", err);
            triggerToast(err.response?.data?.message || err.message || "Failed to update school status");
            loadSchools();
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            {pageMode === "list" ? (
                <>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                        <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                <Building2 className="h-5 w-5" />
                            </span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Schools</h1>
                                    {isLoadingSchools && (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                                    )}
                                </div>
                                <p className="text-xs text-[var(--text-secondary)]">
                                    {isLoadingSchools ? "Loading schools..." : `${schools.length} enrolled school${schools.length === 1 ? "" : "s"}`}
                                </p>
                            </div>
                        </div>
                        <Button onClick={openCreateForm} className="!h-11 shrink-0">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add School
                        </Button>
                    </motion.div>

                    <SectionCard
                        title="Enrolled Schools"
                        subtitle="Schools registered across the platform"
                        delay={0.05}
                        bodyClassName="p-0"
                        action={
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                                    <input
                                        type="text"
                                        placeholder="Search schools..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-9 w-full sm:w-64 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                >
                                    <option value="desc">Latest First</option>
                                    <option value="asc">Oldest First</option>
                                </select>
                            </div>
                        }
                    >
                        {isLoadingSchools && (!schools || schools.length === 0) ? (
                            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-500 shadow-sm" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">Loading schools...</p>
                                    <p className="text-xs text-[var(--text-secondary)]">Please wait while enrolled school records are being fetched.</p>
                                </div>
                            </div>
                        ) : schoolsError && (!schools || schools.length === 0) ? (
                            <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
                                <p className="text-sm font-semibold text-rose-500">Unable to load schools</p>
                                <p className="text-sm text-[var(--text-secondary)]">{schoolsError}</p>
                                <Button type="button" variant="secondary" onClick={() => loadSchools(false)}>Try Again</Button>
                            </div>
                        ) : filteredSchools.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-1 px-4 py-16 text-center">
                                <p className="text-sm font-semibold text-[var(--text-primary)]">
                                    {schools.length === 0 ? "No schools enrolled yet." : "No schools found matching your search."}
                                </p>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {schools.length === 0 ? "Add a school to get started." : "Try a different search term."}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-[var(--border-subtle)] text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                                            <th className="px-4 py-3.5 font-semibold">School ID</th>
                                            <th className="px-4 py-3.5 font-semibold sm:px-5">School Name</th>
                                            <th className="px-4 py-3.5 font-semibold">School Code</th>
                                            <th className="px-4 py-3.5 font-semibold">School Admin</th>
                                            <th className="px-4 py-3.5 font-semibold">Address</th>
                                            <th className="px-4 py-3.5 font-semibold">Contact Phone</th>
                                            <th className="px-4 py-3.5 font-semibold">Academic Structure</th>
                                            <th className="px-4 py-3.5 font-semibold">Status</th>
                                            <th className="px-4 py-3.5 font-semibold sm:px-5">Created Date</th>
                                            <th className="px-4 py-3.5 font-semibold text-right sm:pr-5">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                                        {filteredSchools.map((school) => (
                                            <tr key={school.id} className="text-sm transition-colors hover:bg-[var(--bg-hover)]">
                                                <td className="px-4 py-3 text-[var(--text-secondary)]">{school.id ?? "—"}</td>
                                                <td className="px-4 py-3 font-semibold sm:px-5">{school.name || "—"}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-block font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                                        {school.schoolCode || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {school.adminName || school.adminEmail ? (
                                                        <div className="flex items-center gap-2.5 min-w-[170px]">
                                                            <InsigniaBadge
                                                                name={school.adminName || "School Admin"}
                                                                email={school.adminEmail}
                                                                role="SCHOOL_ADMIN"
                                                                size="sm"
                                                                className="!h-8 !w-8 shrink-0 text-xs rounded-full shadow-xs"
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                                                                    {school.adminName || "School Admin"}
                                                                </p>
                                                                {school.adminEmail && (
                                                                    <p className="truncate text-[11px] text-[var(--text-muted)]" title={school.adminEmail}>
                                                                        {school.adminEmail}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center text-xs text-[var(--text-muted)] italic">
                                                            Not Assigned
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-[var(--text-secondary)]">{school.address || "—"}</td>
                                                <td className="px-4 py-3 text-[var(--text-secondary)]">{school.contactPhone || "—"}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="inline-flex items-center rounded-md bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)] ring-1 ring-inset ring-[var(--color-primary)]/20">
                                                                {school.standardsCount || (school.academicStructure?.length) || 0} Standards
                                                            </span>
                                                            <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400 ring-1 ring-inset ring-purple-500/20">
                                                                {school.totalDivisions || school.divisionCount || (school.academicStructure ? school.academicStructure.reduce((acc, s) => acc + (s.divisions?.length || 0), 0) : 0)} Divisions
                                                            </span>
                                                        </div>
                                                        {Array.isArray(school.academicStructure) && school.academicStructure.length > 0 && (
                                                            <div 
                                                                className="text-[11px] text-[var(--text-muted)] font-medium max-w-[220px] truncate cursor-help"
                                                                title={school.academicStructure.map(s => `Std ${s.standard} (${s.divisions?.join(", ") || "—"})`).join(" | ")}
                                                            >
                                                                {school.academicStructure.slice(0, 3).map(s => `Std ${s.standard}`).join(", ")}
                                                                {school.academicStructure.length > 3 ? ` +${school.academicStructure.length - 3} more` : ""}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleSchoolStatus(school)}
                                                        title="Click to toggle status"
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer hover:opacity-80 transition ${school.active ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"}`}
                                                    >
                                                        {school.active ? "Active" : "Inactive"}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-[var(--text-secondary)] sm:px-5">{formatCreatedDate(school.createdAt)}</td>
                                                <td className="px-4 py-3 text-right sm:pr-5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {school.active ? (
                                                            <button
                                                                type="button"
                                                                title="Deactivate School"
                                                                aria-label={`Deactivate ${school.name || school.schoolName}`}
                                                                onClick={() => handleToggleSchoolStatus(school)}
                                                                className="rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-amber-500/10 hover:text-amber-500"
                                                            >
                                                                <UserX className="h-4 w-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                title="Activate School"
                                                                aria-label={`Activate ${school.name || school.schoolName}`}
                                                                onClick={() => handleToggleSchoolStatus(school)}
                                                                className="rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-emerald-500/10 hover:text-emerald-500"
                                                            >
                                                                <UserCheck className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(school)}
                                                            className="rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                                                            title="Edit School"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDeleteSchool(school)}
                                                            className="rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                                                            title="Delete School"
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
                        )}
                    </SectionCard>
                </>
            ) : (
                <>
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
                                    <Building2 className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                                    School Admin
                                </span>
                                <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                                    Add School
                                </h1>
                                <p className="mt-1.5 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
                                    Register a new school and assign its administrator credentials.
                                </p>
                            </div>
                            <Button type="button" variant="secondary" onClick={handleBackToSchools} disabled={isSubmitting}>
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Back
                            </Button>
                        </div>
                    </motion.div>

                    <SectionCard
                        title="School Details"
                        subtitle="Basic information about the school"
                        delay={0.05}
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Input
                                        label="School Name"
                                        placeholder="Enter School Name"
                                        value={form.schoolName}
                                        onChange={update("schoolName")}
                                        error={errors.schoolName}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Input
                                        label="School Address"
                                        placeholder="Enter School Address"
                                        value={form.schoolAddress}
                                        onChange={update("schoolAddress")}
                                        error={errors.schoolAddress}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="School Email"
                                        type="email"
                                        placeholder="Enter School Email"
                                        value={form.schoolEmail}
                                        onChange={update("schoolEmail")}
                                        error={errors.schoolEmail}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="City"
                                        placeholder="Enter City"
                                        value={form.city}
                                        onChange={update("city")}
                                        error={errors.city}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="State"
                                        placeholder="Enter State"
                                        value={form.state}
                                        onChange={update("state")}
                                        error={errors.state}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Pincode"
                                        placeholder="Enter Pincode"
                                        value={form.pincode}
                                        onChange={update("pincode")}
                                        error={errors.pincode}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </form>
                    </SectionCard>

                    <SectionCard
                        title="Academic Structure"
                        subtitle="Configure the standards and divisions offered by this school"
                        delay={0.08}
                    >
                        <AcademicStructureBuilder
                            value={academicStructure}
                            onChange={(newStructure) => {
                                setAcademicStructure(newStructure);
                                if (errors.academicStructure) {
                                    setErrors(prev => {
                                        const next = { ...prev };
                                        delete next.academicStructure;
                                        return next;
                                    });
                                }
                            }}
                            disabled={isSubmitting}
                        />
                        {errors.academicStructure && (
                            <p className="mt-2 text-sm text-rose-500 font-medium">
                                {errors.academicStructure}
                            </p>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="School Admin Details"
                        subtitle="Invite the school administrator to set up their account"
                        delay={0.1}
                    >
                        <form onSubmit={handleSubmit} autoComplete="off">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Input
                                        label="School Admin Name"
                                        placeholder="Enter School Admin Name"
                                        value={form.adminName}
                                        onChange={update("adminName")}
                                        error={errors.adminName}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        School Admin Email
                                    </label>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Enter School Admin Email"
                                                type="email"
                                                value={form.adminEmail}
                                                onChange={update("adminEmail")}
                                                error={errors.adminEmail}
                                                disabled={isSubmitting || isSendingOtp}
                                                autoComplete="off"
                                            />
                                        </div>
                                        {emailVerified ? (
                                            <div className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Email Verified</span>
                                            </div>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={handleSendOtp}
                                                disabled={!form.adminEmail.trim() || isSendingOtp || isSubmitting}
                                                isLoading={isSendingOtp}
                                                loadingText="Sending OTP..."
                                                className="!h-11 shrink-0 px-5"
                                            >
                                                Verify
                                            </Button>
                                        )}
                                    </div>
                                    {verificationError && (
                                        <p className="mt-1.5 text-xs font-medium text-rose-500">{verificationError}</p>
                                    )}

                                    {/* Helper note upon successful OTP verification */}
                                    {emailVerified && (
                                        <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2 text-xs font-medium text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                            <span>Email verified. Login credentials and institutional details will be automatically emailed to this address upon school creation.</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Input
                                        label="School Admin Phone"
                                        placeholder="Enter School Admin Phone"
                                        value={form.adminPhone}
                                        onChange={update("adminPhone")}
                                        error={errors.adminPhone}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
                                <Button type="button" variant="secondary" onClick={handleReset} className="w-full sm:w-auto" disabled={isSubmitting}>
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full sm:w-auto"
                                    disabled={!emailVerified || !verificationToken || isSubmitting}
                                    isLoading={isSubmitting}
                                    loadingText="Creating School..."
                                >
                                    Create School
                                </Button>
                            </div>
                        </form>
                    </SectionCard>

                </>
            )}

            {/* Edit School Modal */}
            <Modal isOpen={!!schoolToEdit} onClose={() => !isEditing && setSchoolToEdit(null)}>
                <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-surface)] p-6 shadow-xl sm:w-full sm:max-w-lg">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            <Edit className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">Edit School</h3>
                            <p className="text-sm text-[var(--text-secondary)]">Update school details below.</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateSchool} className="space-y-4">
                        <Input
                            label="School Name"
                            value={editForm.schoolName}
                            onChange={(e) => setEditForm(prev => ({...prev, schoolName: e.target.value}))}
                            disabled={isEditing}
                            required
                        />
                        <Input
                            label="Address"
                            value={editForm.address}
                            onChange={(e) => setEditForm(prev => ({...prev, address: e.target.value}))}
                            disabled={isEditing}
                            required
                        />
                        <Input
                            label="Contact Phone"
                            value={editForm.contactPhone}
                            placeholder="e.g. 9876543210"
                            onChange={(e) => setEditForm(prev => ({...prev, contactPhone: sanitizeMobileInput(e.target.value)}))}
                            disabled={isEditing}
                            required
                        />
                        <Input
                            label="Admin Email"
                            type="email"
                            value={editForm.adminEmail}
                            onChange={(e) => setEditForm(prev => ({...prev, adminEmail: e.target.value}))}
                            disabled={isEditing}
                            required
                        />

                        <div className="mt-6 flex justify-end gap-3">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={() => setSchoolToEdit(null)}
                                disabled={isEditing}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                isLoading={isEditing}
                                loadingText="Saving..."
                                disabled={!editForm.schoolName || !editForm.address || !editForm.contactPhone || !editForm.adminEmail}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!schoolToDelete} onClose={() => !isDeleting && setSchoolToDelete(null)}>
                <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-surface)] p-6 shadow-xl sm:w-full sm:max-w-md">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-[var(--text-primary)]">Delete School?</h3>
                        <p className="mb-6 text-sm text-[var(--text-secondary)]">
                            Are you sure you want to delete <strong>{schoolToDelete?.name}</strong>? This will permanently remove the school and all associated data, including users and structures. This action cannot be undone.
                        </p>
                        <div className="flex w-full flex-col gap-3 sm:flex-row">
                            <Button
                                variant="secondary"
                                onClick={() => setSchoolToDelete(null)}
                                disabled={isDeleting}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteSchool}
                                isLoading={isDeleting}
                                loadingText="Deleting..."
                                className="w-full !bg-rose-500 hover:!bg-rose-600 focus:!ring-rose-500/20"
                            >
                                Yes, Delete School
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* OTP Verification Modal */}
            <Modal
                isOpen={otpModalOpen}
                onClose={() => !isVerifyingOtp && setOtpModalOpen(false)}
                title="Verify School Admin Email"
                description={`Enter the 6-digit OTP sent to ${form.adminEmail} to complete email verification.`}
            >
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                        <div className="flex items-start gap-2.5">
                            <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                            <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                A 6-digit OTP has been sent to <span className="font-semibold text-[var(--text-primary)]">{form.adminEmail}</span>.
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            Enter 6-Digit OTP
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => {
                                const numericVal = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setOtp(numericVal);
                                if (otpError) setOtpError("");
                            }}
                            placeholder="123456"
                            autoFocus
                            disabled={isVerifyingOtp}
                            className="h-12 w-full text-center font-mono text-2xl tracking-[0.4em] font-bold rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        />
                        {otpError && (
                            <p className="mt-2 text-xs font-medium text-rose-500 text-center">
                                {otpError}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp || isVerifyingOtp}
                            className="text-xs font-semibold text-[var(--color-primary)] hover:underline disabled:opacity-50 disabled:no-underline"
                        >
                            {isSendingOtp ? "Resending OTP..." : "Resend OTP"}
                        </button>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setOtpModalOpen(false)}
                                disabled={isVerifyingOtp}
                                className="!h-10 text-xs px-4"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={otp.length !== 6 || isVerifyingOtp}
                                isLoading={isVerifyingOtp}
                                loadingText="Verifying..."
                                className="!h-10 text-xs px-5"
                            >
                                Verify OTP
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Floating Toasts Notification Overlay */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            className="rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold shadow-lg pointer-events-auto"
                        >
                            {t.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default AddSchool;
