import { useEffect, useState, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Building2, Plus, Search, Edit, Trash2, AlertTriangle, X, CheckCircle2, Mail, ShieldCheck, UserX, UserCheck, User, CreditCard, Check, Sparkles, Zap, Users, Clock, Shield, Eye, History, UserPlus, RefreshCw, Phone, Calendar, ArrowRight, ArrowLeftRight, Power } from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import PhoneInput from "@components/common/PhoneInput";
import Modal from "@components/common/Modal";
import SectionCard from "@admin/components/SectionCard";
import AcademicStructureBuilder from "@admin/components/AcademicStructureBuilder";
import InsigniaBadge from "@components/common/InsigniaBadge";
import { schoolApi } from "@services/admin/schoolApi";
import { adminUserApi } from "@services/admin/adminUserApi";
import { subscriptionApi } from "@services/admin/subscriptionApi";
import { openRazorpayCheckout } from "@utils/razorpayUtils";
import { getIndianMobileError, normalizeIndianMobile, sanitizeMobileInput } from "@utils/phoneValidator";
import PaymentSuccessModal from "@admin/components/PaymentSuccessModal";

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

    // Subscription Plan & Multi-Step Creation state
    const [formStep, setFormStep] = useState(1); // 1 = Details & Email Verification, 2 = Plan Selection & Payment
    const [availablePlans, setAvailablePlans] = useState([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);
    const [paymentSuccessData, setPaymentSuccessData] = useState(null);

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

    // School Details & Administrator Management State
    const [openedSchool, setOpenedSchool] = useState(null);
    const [adminHistory, setAdminHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState("");

    // Replace / Add Admin Modal State
    const [replaceModalOpen, setReplaceModalOpen] = useState(false);
    const [replaceForm, setReplaceForm] = useState({
        adminFirstName: "",
        adminLastName: "",
        adminEmail: "",
        adminPhone: ""
    });
    const [replaceErrors, setReplaceErrors] = useState({});
    const [replaceVerificationToken, setReplaceVerificationToken] = useState(null);
    const [replaceEmailVerified, setReplaceEmailVerified] = useState(false);
    const [isSendingReplaceOtp, setIsSendingReplaceOtp] = useState(false);
    const [replaceOtpModalOpen, setReplaceOtpModalOpen] = useState(false);
    const [replaceOtp, setReplaceOtp] = useState("");
    const [replaceOtpError, setReplaceOtpError] = useState("");
    const [isVerifyingReplaceOtp, setIsVerifyingReplaceOtp] = useState(false);
    const [replaceVerificationError, setReplaceVerificationError] = useState("");
    const [replaceStep, setReplaceStep] = useState(1); // 1 = Details & Verification, 2 = Confirmation
    const [isSubmittingReplacement, setIsSubmittingReplacement] = useState(false);
    
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

    const parseFeatures = (features) => {
        if (!features) return [];
        if (Array.isArray(features)) return features;
        try {
            const parsed = JSON.parse(features);
            if (Array.isArray(parsed)) return parsed;
        } catch (_) {}
        return String(features).split(/[,\n]/).map(f => f.trim()).filter(Boolean);
    };

    const loadAvailablePlans = async () => {
        setIsLoadingPlans(true);
        try {
            const res = await subscriptionApi.getAllPlans(0, 100);
            const list = res?.data?.content || res?.content || (Array.isArray(res) ? res : []);
            const activePlans = list.filter(p => p.isActive !== false);

            if (activePlans.length > 0) {
                setAvailablePlans(activePlans);
                if (!selectedPlanId) {
                    setSelectedPlanId(activePlans[0].id);
                }
            } else {
                const fallbackPlans = [
                    {
                        id: 1,
                        planName: "Annual Institution Standard",
                        price: 1499,
                        currency: "INR",
                        billingCycle: "YEARLY",
                        durationMonths: 12,
                        studentLimit: 500,
                        aiMinutesLimit: 300,
                        features: "Up to 500 Students, AI Speaking Practice, Teacher & Division Management, Analytics Dashboard, Email Support"
                    },
                    {
                        id: 2,
                        planName: "Annual Institution Pro",
                        price: 1999,
                        currency: "INR",
                        billingCycle: "YEARLY",
                        durationMonths: 12,
                        studentLimit: 1500,
                        aiMinutesLimit: 1000,
                        features: "Up to 1500 Students, Unlimited AI Speaking, Advanced Speaking Analytics, Priority Support, Custom Assessments"
                    }
                ];
                setAvailablePlans(fallbackPlans);
                if (!selectedPlanId) {
                    setSelectedPlanId(fallbackPlans[0].id);
                }
            }
        } catch (err) {
            console.error("Failed to load subscription plans:", err);
            const fallbackPlans = [
                {
                    id: 1,
                    planName: "Annual Institution Standard",
                    price: 1499,
                    currency: "INR",
                    billingCycle: "YEARLY",
                    durationMonths: 12,
                    studentLimit: 500,
                    aiMinutesLimit: 300,
                    features: "Up to 500 Students, AI Speaking Practice, Teacher & Division Management, Analytics Dashboard, Email Support"
                },
                {
                    id: 2,
                    planName: "Annual Institution Pro",
                    price: 1999,
                    currency: "INR",
                    billingCycle: "YEARLY",
                    durationMonths: 12,
                    studentLimit: 1500,
                    aiMinutesLimit: 1000,
                    features: "Up to 1500 Students, Unlimited AI Speaking, Advanced Speaking Analytics, Priority Support, Custom Assessments"
                }
            ];
            setAvailablePlans(fallbackPlans);
            if (!selectedPlanId) {
                setSelectedPlanId(fallbackPlans[0].id);
            }
        } finally {
            setIsLoadingPlans(false);
        }
    };

    const selectedPlan = useMemo(() => {
        if (!availablePlans || availablePlans.length === 0) return null;
        return availablePlans.find(p => p.id === selectedPlanId) || availablePlans[0];
    }, [availablePlans, selectedPlanId]);

    const openCreateForm = () => {
        handleReset();
        setPageMode("form");
        setFormStep(1);
        loadAvailablePlans();
    };

    const handleBackToSchools = () => {
        if (isSubmitting || isProcessingPayment) return;
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

    const currentAdmin = useMemo(() => {
        if (!openedSchool) return null;
        const fromHistory = adminHistory.find((a) => a.currentAdmin || (a.active && a.status === "ACTIVE"));
        if (fromHistory) return fromHistory;
        if (openedSchool.adminEmail && (openedSchool.adminId || openedSchool.adminName)) {
            return {
                id: openedSchool.adminId,
                fullName: openedSchool.adminName || "School Administrator",
                email: openedSchool.adminEmail,
                phone: openedSchool.adminPhone,
                active: true,
                status: "ACTIVE",
                welcomeCompleted: false
            };
        }
        return null;
    }, [openedSchool, adminHistory]);

    const handleOpenSchool = async (school) => {
        setOpenedSchool(school);
        setPageMode("details");
        setIsLoadingHistory(true);
        setHistoryError("");
        try {
            const [freshSchool, history] = await Promise.all([
                schoolApi.getSchoolById(school.id).catch(() => school),
                schoolApi.getSchoolAdminHistory(school.id).catch(() => [])
            ]);
            setOpenedSchool(freshSchool);
            setAdminHistory(Array.isArray(history) ? history : []);
        } catch (err) {
            console.error("Failed to load school details or history:", err);
            setHistoryError("Failed to load administrator history.");
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const openAddOrReplaceModal = () => {
        setReplaceForm({
            adminFirstName: "",
            adminLastName: "",
            adminEmail: "",
            adminPhone: ""
        });
        setReplaceErrors({});
        setReplaceVerificationToken(null);
        setReplaceEmailVerified(false);
        setReplaceOtp("");
        setReplaceOtpError("");
        setReplaceVerificationError("");
        setReplaceStep(1);
        setReplaceModalOpen(true);
    };

    const handleQuickReplaceAdmin = async (school) => {
        setOpenedSchool(school);
        openAddOrReplaceModal();
        try {
            const [freshSchool, history] = await Promise.all([
                schoolApi.getSchoolById(school.id).catch(() => school),
                schoolApi.getSchoolAdminHistory(school.id).catch(() => [])
            ]);
            setOpenedSchool(freshSchool);
            setAdminHistory(Array.isArray(history) ? history : []);
        } catch (err) {
            console.warn("Could not load history for quick replace:", err);
        }
    };

    const updateReplaceField = (field) => (event) => {
        let val = event.target.value;
        if (field === "adminPhone") {
            val = sanitizeMobileInput(val);
        }
        setReplaceForm((prev) => ({ ...prev, [field]: val }));
        if (replaceErrors[field]) {
            setReplaceErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
        if (field === "adminEmail") {
            setReplaceVerificationError("");
            if (replaceEmailVerified || replaceVerificationToken) {
                setReplaceEmailVerified(false);
                setReplaceVerificationToken(null);
                setReplaceOtp("");
                setReplaceOtpError("");
            }
        }
    };

    const handleSendReplaceOtp = async () => {
        const email = replaceForm.adminEmail.trim().toLowerCase();
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setReplaceErrors((prev) => ({ ...prev, adminEmail: "Enter a valid email" }));
            return;
        }

        const activeAdmin = adminHistory.find((a) => a.currentAdmin || (a.active && a.status === "ACTIVE"));
        if (activeAdmin && activeAdmin.email && activeAdmin.email.toLowerCase() === email) {
            setReplaceVerificationError("This email is already the active administrator for this school.");
            return;
        }

        setIsSendingReplaceOtp(true);
        setReplaceVerificationError("");
        setReplaceOtpError("");
        try {
            await schoolApi.sendAdminVerificationOtp(email);
            setReplaceOtp("");
            setReplaceOtpModalOpen(true);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Failed to send verification OTP";
            setReplaceVerificationError(msg);
        } finally {
            setIsSendingReplaceOtp(false);
        }
    };

    const handleVerifyReplaceOtp = async (e) => {
        if (e) e.preventDefault();
        if (replaceOtp.length !== 6) {
            setReplaceOtpError("Please enter the complete 6-digit OTP");
            return;
        }

        setIsVerifyingReplaceOtp(true);
        setReplaceOtpError("");
        try {
            const email = replaceForm.adminEmail.trim().toLowerCase();
            const res = await schoolApi.verifyAdminVerificationOtp(email, replaceOtp);
            if (res && (res.verificationToken || res.success)) {
                setReplaceVerificationToken(res.verificationToken);
                setReplaceEmailVerified(true);
                setReplaceOtpModalOpen(false);
                setReplaceOtp("");
                setReplaceOtpError("");
                setReplaceVerificationError("");
                triggerToast("Email verified successfully.");
            } else {
                setReplaceOtpError(res?.message || "Verification failed. Invalid OTP.");
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Invalid OTP. Please check and try again.";
            setReplaceOtpError(msg);
        } finally {
            setIsVerifyingReplaceOtp(false);
        }
    };

    const handleProceedToReplaceConfirmation = (e) => {
        if (e) e.preventDefault();
        const nextErrors = {};
        if (!replaceForm.adminFirstName.trim()) nextErrors.adminFirstName = "First name is required";
        if (!replaceForm.adminEmail.trim()) nextErrors.adminEmail = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(replaceForm.adminEmail)) nextErrors.adminEmail = "Enter a valid email";

        const phoneErr = getIndianMobileError(replaceForm.adminPhone, "Phone number", true);
        if (phoneErr) nextErrors.adminPhone = phoneErr;

        if (!replaceEmailVerified || !replaceVerificationToken) {
            setReplaceVerificationError("Please verify the administrator's email first.");
            return;
        }

        if (Object.keys(nextErrors).length > 0) {
            setReplaceErrors(nextErrors);
            return;
        }

        setReplaceStep(2);
    };

    const handleConfirmReplacement = async () => {
        if (!openedSchool || !replaceVerificationToken) return;

        setIsSubmittingReplacement(true);
        try {
            const payload = {
                adminFirstName: replaceForm.adminFirstName.trim(),
                adminLastName: replaceForm.adminLastName.trim(),
                adminEmail: replaceForm.adminEmail.trim().toLowerCase(),
                adminPhone: normalizeIndianMobile(replaceForm.adminPhone),
                verificationToken: replaceVerificationToken
            };

            const updatedSchool = await schoolApi.replaceSchoolAdmin(openedSchool.id, payload);
            setOpenedSchool(updatedSchool);

            const history = await schoolApi.getSchoolAdminHistory(openedSchool.id);
            setAdminHistory(Array.isArray(history) ? history : []);

            loadSchools(true);

            setReplaceModalOpen(false);
            triggerToast("School administrator updated successfully! Temporary credentials dispatched via email.");
        } catch (err) {
            console.error("Replacement error:", err);
            const msg = err.response?.data?.message || err.message || "Failed to update school administrator.";
            triggerToast(msg);
        } finally {
            setIsSubmittingReplacement(false);
        }
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

    const handleProceedToSubscription = (event) => {
        if (event) event.preventDefault();
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

        if (!availablePlans || availablePlans.length === 0) {
            loadAvailablePlans();
        }
        setFormStep(2);
    };

    const handleProceedToPayment = async () => {
        if (!selectedPlan) {
            triggerToast("Please select a subscription plan.");
            return;
        }

        setIsProcessingPayment(true);
        try {
            // 1. Create Razorpay Payment Order via backend
            const orderRes = await schoolApi.createSchoolPaymentOrder({
                planId: selectedPlan.id,
                schoolName: form.schoolName.trim(),
                adminEmail: form.adminEmail.trim(),
                verificationToken: verificationToken
            });

            // 2. Open Razorpay Checkout modal
            await openRazorpayCheckout({
                orderData: orderRes,
                onSuccess: async (paymentData) => {
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
                            verificationToken: verificationToken,
                            subscriptionPlanId: selectedPlan.id,
                            razorpayOrderId: paymentData.razorpay_order_id,
                            razorpayPaymentId: paymentData.razorpay_payment_id,
                            razorpaySignature: paymentData.razorpay_signature
                        };

                        // 1. Create School with Subscription details and trigger email
                        const newSchool = await schoolApi.createSchool(payload);
                        try {
                            localStorage.removeItem(`pwd_set_${payload.adminEmail.toLowerCase().trim()}`);
                        } catch (_) {}
                        
                        try {
                            // 2. Configure Academic Structure
                            await schoolApi.configureSchoolStandards(newSchool.id, academicStructure);
                        } catch (configErr) {
                            console.error("Failed to configure academic structure:", configErr);
                        }

                        const successData = {
                            schoolName: form.schoolName.trim(),
                            schoolCode: newSchool?.schoolCode || ("SCH-" + (newSchool?.id || "ACTIVE")),
                            adminName: form.adminName.trim(),
                            adminEmail: payload.adminEmail,
                            adminPhone: payload.contactPhone,
                            schoolAddress: combinedAddress,
                            planName: selectedPlan.planName,
                            planPrice: selectedPlan.price,
                            durationMonths: selectedPlan.durationMonths,
                            studentLimit: selectedPlan.studentLimit,
                            paymentId: paymentData?.razorpay_payment_id || "PAY-VERIFIED",
                            orderId: paymentData?.razorpay_order_id || "ORD-COMPLETED",
                            paymentDate: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
                            isFree: false
                        };
                        setPaymentSuccessData(successData);
                        setPaymentSuccessModalOpen(true);
                        triggerToast(`Transaction successful! Institutional license for "${form.schoolName}" is active.`);
                        loadSchools();

                    } catch (err) {
                        console.error("Failed to create school after payment:", err);
                        const errMsg = err.response?.data?.message || err.message || "An error occurred while finalizing school creation.";
                        triggerToast(errMsg);
                        
                        if (err.response?.status === 400 || err.response?.status === 403) {
                            const lower = errMsg.toLowerCase();
                            if (lower.includes("verification") || lower.includes("token") || lower.includes("expired") || lower.includes("consumed")) {
                                setEmailVerified(false);
                                setVerificationToken(null);
                                setVerifiedAdminEmail(null);
                                setFormStep(1);
                            }
                        }
                    } finally {
                        setIsSubmitting(false);
                        setIsProcessingPayment(false);
                    }
                },
                onFailure: (paymentErr) => {
                    console.error("Payment failed or cancelled:", paymentErr);
                    const msg = paymentErr?.description || paymentErr?.message || "Payment transaction could not be completed. Please try again.";
                    triggerToast(msg);
                    setIsProcessingPayment(false);
                },
                onDismiss: () => {
                    setIsProcessingPayment(false);
                }
            });

        } catch (err) {
            console.error("Failed to create payment order:", err);
            const errMsg = err.response?.data?.message || err.message || "Unable to initiate payment order.";
            triggerToast(errMsg);
            setIsProcessingPayment(false);
        }
    };

    const handleCreateFreeSchool = async () => {
        if (!selectedPlan) {
            triggerToast("Please select a subscription plan.");
            return;
        }

        setIsSubmitting(true);
        try {
            const nameParts = form.adminName.trim().split(/\s+/);
            const adminFirstName = nameParts[0] || "";
            const adminLastName = nameParts.slice(1).join(" ") || "Admin";

            const addressParts = [
                form.schoolAddress.trim(),
                form.city.trim(),
                form.state.trim(),
                form.pincode.trim()
            ].filter(Boolean);
            const combinedAddress = addressParts.join(", ");

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
                verificationToken: verificationToken,
                subscriptionPlanId: selectedPlan.id,
                razorpayOrderId: null,
                razorpayPaymentId: null,
                razorpaySignature: null
            };

            const newSchool = await schoolApi.createSchool(payload);
            try {
                localStorage.removeItem(`pwd_set_${payload.adminEmail.toLowerCase().trim()}`);
            } catch (_) {}

            try {
                await schoolApi.configureSchoolStandards(newSchool.id, academicStructure);
            } catch (configErr) {
                console.error("Failed to configure academic structure:", configErr);
            }

            const successData = {
                schoolName: form.schoolName.trim(),
                schoolCode: newSchool?.schoolCode || ("SCH-" + (newSchool?.id || "ACTIVE")),
                adminName: form.adminName.trim(),
                adminEmail: payload.adminEmail,
                adminPhone: payload.contactPhone,
                schoolAddress: combinedAddress,
                planName: selectedPlan.planName,
                planPrice: 0,
                durationMonths: selectedPlan.durationMonths,
                studentLimit: selectedPlan.studentLimit,
                paymentId: "FREE_INSTITUTIONAL_GRANT",
                orderId: "INSTITUTIONAL_SETUP",
                paymentDate: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
                isFree: true
            };
            setPaymentSuccessData(successData);
            setPaymentSuccessModalOpen(true);
            triggerToast(`School "${form.schoolName}" created successfully with Free Plan!`);
            loadSchools();

        } catch (err) {
            console.error("Failed to create free school:", err);
            const errMsg = err.response?.data?.message || err.message || "An error occurred while finalizing school creation.";
            triggerToast(errMsg);
            
            if (err.response?.status === 400 || err.response?.status === 403) {
                const lower = errMsg.toLowerCase();
                if (lower.includes("verification") || lower.includes("token") || lower.includes("expired") || lower.includes("consumed")) {
                    setEmailVerified(false);
                    setVerificationToken(null);
                    setVerifiedAdminEmail(null);
                    setFormStep(1);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setPaymentSuccessModalOpen(false);
        setPaymentSuccessData(null);
        handleReset();
        setPageMode("list");
    };

    const handleReset = () => {
        if (isSubmitting || isProcessingPayment) return;
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
        setFormStep(1);
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
            await schoolApi.deleteSchool(targetId);
            setSchools((prev) => prev.filter((s) => s.id !== targetId));
            setSchoolToDelete(null);
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
                                            <th className="px-4 py-3.5 font-semibold">Subscription Plan</th>
                                            <th className="px-4 py-3.5 font-semibold">Status</th>
                                            <th className="px-4 py-3.5 font-semibold sm:px-5">Created Date</th>
                                            <th className="px-4 py-3.5 font-semibold text-right sm:pr-5">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                                        {filteredSchools.map((school) => (
                                            <tr key={school.id} className="text-sm transition-colors hover:bg-[var(--bg-hover)]">
                                                <td className="px-4 py-3 text-[var(--text-secondary)]">{school.id ?? "—"}</td>
                                                <td className="px-4 py-3 font-semibold sm:px-5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenSchool(school)}
                                                        className="text-left font-semibold text-[var(--text-primary)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors cursor-pointer"
                                                        title="Open School Details"
                                                    >
                                                        {school.name || "—"}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-block font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                                        {school.schoolCode || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {school.adminName || school.adminEmail ? (
                                                        <div className="flex flex-col gap-1.5 min-w-[170px]">
                                                            <div className="flex items-center gap-2.5">
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
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQuickReplaceAdmin(school)}
                                                                className="inline-flex items-center gap-1 self-start rounded-md px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors cursor-pointer"
                                                                title="Replace School Administrator"
                                                            >
                                                                <ArrowLeftRight className="h-2.5 w-2.5" />
                                                                <span>Replace Admin</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-1.5 items-start min-w-[140px]">
                                                            <span className="inline-flex items-center text-xs text-[var(--text-muted)] italic">
                                                                Not Assigned
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQuickReplaceAdmin(school)}
                                                                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-800/60 transition-colors cursor-pointer"
                                                                title="Assign School Administrator"
                                                            >
                                                                <UserPlus className="h-2.5 w-2.5" />
                                                                <span>+ Assign Admin</span>
                                                            </button>
                                                        </div>
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
                                                    {school.subscriptionPlanName ? (
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                                <Sparkles className="h-3 w-3" />
                                                                {school.subscriptionPlanName}
                                                            </span>
                                                            <span className="text-[11px] font-medium text-[var(--text-muted)]">
                                                                ₹{school.subscriptionPrice != null ? Number(school.subscriptionPrice).toLocaleString("en-IN") : "0"} {school.subscriptionBillingCycle ? `(${school.subscriptionBillingCycle.toLowerCase()})` : ""}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center text-xs text-[var(--text-muted)] italic">
                                                            Standard Plan
                                                        </span>
                                                    )}
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
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenSchool(school)}
                                                            className="rounded p-1.5 text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-500/10 cursor-pointer"
                                                            title="View School Details"
                                                            aria-label={`View ${school.name || school.schoolName} Details`}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        {school.active ? (
                                                            <button
                                                                type="button"
                                                                title="Deactivate School"
                                                                aria-label={`Deactivate ${school.name || school.schoolName}`}
                                                                onClick={() => handleToggleSchoolStatus(school)}
                                                                className="rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-amber-500/10 hover:text-amber-500 cursor-pointer"
                                                            >
                                                                <UserX className="h-4 w-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                title="Activate School"
                                                                aria-label={`Activate ${school.name || school.schoolName}`}
                                                                onClick={() => handleToggleSchoolStatus(school)}
                                                                className="rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-emerald-500/10 hover:text-emerald-500 cursor-pointer"
                                                            >
                                                                <UserCheck className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(school)}
                                                            className="rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
                                                            title="Edit School"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDeleteSchool(school)}
                                                            className="rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
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
            ) : pageMode === "details" && openedSchool ? (
                <>
                    {/* School Details Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-7"
                    >
                        <div
                            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20 blur-3xl"
                            style={{ background: "linear-gradient(135deg,#3b82f6,#10b981)" }}
                        />
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                                        <Building2 className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                                        School Workspace
                                    </span>
                                    <span className="inline-block font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                        {openedSchool.schoolCode || `SCH-${openedSchool.id}`}
                                    </span>
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${openedSchool.active !== false ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"}`}>
                                        {openedSchool.active !== false ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl truncate">
                                    {openedSchool.name || openedSchool.schoolName || "School Details"}
                                </h1>
                                <p className="mt-1 text-sm text-[var(--text-secondary)] flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <span>Address: {openedSchool.address || "—"}</span>
                                    <span>&bull;</span>
                                    <span>Contact Phone: {openedSchool.contactPhone || "—"}</span>
                                    <span>&bull;</span>
                                    <span>Enrolled: {formatCreatedDate(openedSchool.createdAt)}</span>
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button type="button" variant="secondary" onClick={() => setPageMode("list")}>
                                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                                    Back to Schools
                                </Button>
                                <Button
                                    type="button"
                                    onClick={openAddOrReplaceModal}
                                    className="!bg-indigo-600 hover:!bg-indigo-700 text-white font-bold"
                                >
                                    <ArrowLeftRight className="mr-1.5 h-4 w-4" />
                                    {currentAdmin ? "Replace School Admin" : "Add School Admin"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* School Administrator Section */}
                    <SectionCard
                        title="School Administrator"
                        subtitle="Current administrator assigned to manage teachers, classrooms, and students"
                        delay={0.05}
                        action={
                            currentAdmin ? (
                                <Button
                                    type="button"
                                    onClick={openAddOrReplaceModal}
                                    className="!h-9 text-xs !bg-indigo-600 hover:!bg-indigo-700 text-white font-semibold"
                                >
                                    <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                                    Replace School Admin
                                </Button>
                            ) : null
                        }
                    >
                        {currentAdmin ? (
                            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white dark:border-indigo-900/30 dark:from-indigo-950/20 dark:to-[var(--bg-surface)] p-6 shadow-xs">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <InsigniaBadge
                                            name={currentAdmin.fullName || currentAdmin.firstName || "School Admin"}
                                            email={currentAdmin.email}
                                            role="SCHOOL_ADMIN"
                                            size="lg"
                                            className="!h-16 !w-16 text-lg rounded-2xl shadow-sm shrink-0"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                                    {currentAdmin.fullName || `${currentAdmin.firstName || ""} ${currentAdmin.lastName || ""}`.trim() || "School Administrator"}
                                                </h3>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                                                    ACTIVE
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                                                <Mail className="h-3.5 w-3.5" />
                                                <span>{currentAdmin.email}</span>
                                            </p>
                                            <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mt-1">
                                                <Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                                <span>{currentAdmin.phone || "—"}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/80 dark:bg-slate-900/60 p-4 rounded-xl border border-[var(--border-subtle)]">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Credentials Status</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                {currentAdmin.welcomeCompleted ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                        <ShieldCheck className="h-4 w-4" />
                                                        Permanent Password Configured
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                        <Clock className="h-4 w-4" />
                                                        Temporary Password Issued (First Login Pending)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)]/50 text-center">
                                <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <h3 className="text-base font-bold text-[var(--text-primary)]">
                                    No active School Administrator is currently assigned.
                                </h3>
                                <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-md">
                                    This school currently has no active administrator. Add a School Administrator to grant access to manage teachers, classrooms, and student performance metrics.
                                </p>
                                <Button
                                    type="button"
                                    onClick={openAddOrReplaceModal}
                                    className="mt-4 !bg-indigo-600 hover:!bg-indigo-700 text-white font-bold"
                                >
                                    <UserPlus className="mr-1.5 h-4 w-4" />
                                    Add School Admin
                                </Button>
                            </div>
                        )}
                    </SectionCard>

                    {/* Administrator History Section */}
                    <SectionCard
                        title="Administrator History"
                        subtitle="Audit records of all current and previous administrators for this school"
                        delay={0.1}
                    >
                        {isLoadingHistory ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-200 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-500" />
                                <p className="mt-2 text-xs font-medium text-[var(--text-muted)]">Loading administrator history...</p>
                            </div>
                        ) : historyError ? (
                            <div className="text-center py-8">
                                <p className="text-xs text-rose-500">{historyError}</p>
                            </div>
                        ) : adminHistory.length === 0 ? (
                            <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                                No administrator history recorded for this school.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {adminHistory.map((adm) => {
                                    const isActive = adm.currentAdmin || (adm.active && adm.status === "ACTIVE");
                                    return (
                                        <div
                                            key={adm.id}
                                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                                                isActive
                                                    ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-800/40 dark:bg-emerald-950/20"
                                                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <InsigniaBadge
                                                    name={adm.fullName || adm.firstName || "Admin"}
                                                    email={adm.email}
                                                    role="SCHOOL_ADMIN"
                                                    size="sm"
                                                    className="!h-10 !w-10 text-xs rounded-full shrink-0 shadow-xs"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-bold text-[var(--text-primary)]">
                                                            {adm.fullName || `${adm.firstName || ""} ${adm.lastName || ""}`.trim() || adm.email}
                                                        </h4>
                                                        {isActive ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                                ACTIVE
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                                INACTIVE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                                                        <span>{adm.email}</span>
                                                        {adm.phone && (
                                                            <>
                                                                <span>&bull;</span>
                                                                <span>{adm.phone}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-right sm:justify-end">
                                                <div>
                                                    <span className={`inline-block text-xs font-semibold ${isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-[var(--text-muted)]"}`}>
                                                        {isActive ? "Current Administrator" : "Previous Administrator"}
                                                    </span>
                                                    <p className="text-[11px] text-[var(--text-muted)]">
                                                        Assigned: {formatCreatedDate(adm.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-800" />
                                                <div>
                                                    {adm.welcomeCompleted ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                            <ShieldCheck className="h-3.5 w-3.5" />
                                                            Password Configured
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            First Login Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </SectionCard>

                    {/* Institutional Details & Subscription Card */}
                    <SectionCard
                        title="Institutional Details & Subscription"
                        subtitle="Class structure, curriculum standards, and subscription limits"
                        delay={0.15}
                    >
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Academic Structure</h4>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="inline-flex items-center rounded-md bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                                        {openedSchool.standardsCount || (openedSchool.academicStructure?.length) || 0} Standards
                                    </span>
                                    <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                        {openedSchool.totalDivisions || openedSchool.divisionCount || (openedSchool.academicStructure ? openedSchool.academicStructure.reduce((acc, s) => acc + (s.divisions?.length || 0), 0) : 0)} Divisions
                                    </span>
                                </div>
                                {Array.isArray(openedSchool.academicStructure) && openedSchool.academicStructure.length > 0 ? (
                                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                                        {openedSchool.academicStructure.map((s, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-[var(--bg-subtle)]">
                                                <span className="font-semibold text-[var(--text-primary)]">Standard {s.standard}</span>
                                                <span className="text-[var(--text-muted)]">Divisions: {s.divisions?.join(", ") || "A"}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-[var(--text-muted)]">Default standards 1 to 10 configured.</p>
                                )}
                            </div>

                            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Subscription Plan</h4>
                                {openedSchool.subscriptionPlanName ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                {openedSchool.subscriptionPlanName}
                                            </span>
                                            <span className="text-sm font-bold text-[var(--text-primary)]">
                                                ₹{openedSchool.subscriptionPrice != null ? Number(openedSchool.subscriptionPrice).toLocaleString("en-IN") : "0"}
                                            </span>
                                        </div>
                                        <div className="text-xs text-[var(--text-secondary)] space-y-1">
                                            <p>Billing Cycle: <strong className="text-[var(--text-primary)]">{openedSchool.subscriptionBillingCycle || "Annual"}</strong></p>
                                            <p>Student Capacity: <strong className="text-[var(--text-primary)]">Up to {openedSchool.maxStudents || 500} Students</strong></p>
                                            {openedSchool.subscriptionStartDate && (
                                                <p>Active From: {formatCreatedDate(openedSchool.subscriptionStartDate)}</p>
                                            )}
                                            {openedSchool.subscriptionEndDate && (
                                                <p>Renews / Expires: {formatCreatedDate(openedSchool.subscriptionEndDate)}</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-[var(--text-muted)]">Standard Institutional Plan active.</p>
                                )}
                            </div>
                        </div>
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

                    {/* Step Wizard Indicator */}
                    <div className="mb-6 flex items-center justify-between rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                                formStep === 1 
                                    ? 'bg-indigo-600 text-white shadow-xs' 
                                    : 'bg-emerald-600 text-white'
                            }`}>
                                {formStep > 1 ? <Check className="h-4 w-4" /> : "1"}
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Step 1</p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">School & Admin Details</p>
                            </div>
                        </div>
                        <div className="hidden sm:block h-0.5 flex-1 max-w-[100px] md:max-w-[160px] bg-slate-200 dark:bg-slate-800 mx-4" />
                        <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                                formStep === 2 
                                    ? 'bg-indigo-600 text-white shadow-xs' 
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                                2
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Step 2</p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">Subscription Plan & Payment</p>
                            </div>
                        </div>
                    </div>

                    {formStep === 1 ? (
                        <>
                            <SectionCard
                                title="School Details"
                                subtitle="Basic information about the school"
                                delay={0.05}
                            >
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
                                            label="School Email"
                                            type="email"
                                            placeholder="Enter School Email"
                                            value={form.schoolEmail}
                                            onChange={update("schoolEmail")}
                                            error={errors.schoolEmail}
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
                                <form onSubmit={handleProceedToSubscription} autoComplete="off">
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
                                            <PhoneInput
                                                label="School Admin Phone"
                                                placeholder="Enter School Admin Phone"
                                                value={form.adminPhone}
                                                onChange={update("adminPhone")}
                                                error={errors.adminPhone}
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
                                                    <span>Email verified! You can now choose a dynamic subscription plan for this school.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
                                        <Button type="button" variant="secondary" onClick={handleReset} className="w-full sm:w-auto" disabled={isSubmitting}>
                                            Reset
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="w-full sm:w-auto font-bold"
                                            disabled={!emailVerified || !verificationToken || isSubmitting}
                                        >
                                            <span>Continue to Subscription Plan</span>
                                            <ArrowLeft className="ml-1.5 h-4 w-4 rotate-180" />
                                        </Button>
                                    </div>
                                </form>
                            </SectionCard>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <SectionCard
                                title="Choose Institutional Subscription Plan"
                                subtitle="Select the subscription plan tailored for this school. All enrolled students and teachers inherit the limits of this plan."
                                delay={0.05}
                            >
                                {isLoadingPlans ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="h-9 w-9 animate-spin rounded-full border-3 border-indigo-200 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-500 shadow-sm" />
                                        <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">Loading subscription plans...</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                        {availablePlans.map((plan) => {
                                            const isSelected = selectedPlanId === plan.id;
                                            const featuresList = parseFeatures(plan.features);
                                            const priceDisplay = plan.price != null ? Number(plan.price).toLocaleString("en-IN") : "0";
                                            const cycleDisplay = plan.billingCycle || (plan.durationMonths ? `${plan.durationMonths} Mo` : "Year");

                                            return (
                                                <div
                                                    key={plan.id}
                                                    onClick={() => setSelectedPlanId(plan.id)}
                                                    className={`relative flex flex-col justify-between rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer ${
                                                        isSelected
                                                            ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                                                            : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs"
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-bold text-white shadow-xs">
                                                            <Check className="h-3.5 w-3.5" />
                                                            Selected
                                                        </div>
                                                    )}

                                                    <div>
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-lg font-bold text-[var(--text-primary)]">{plan.planName}</h4>
                                                            <span className="inline-flex items-center rounded-md bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                                                                {plan.durationMonths ? `${plan.durationMonths} Months` : "Annual"}
                                                            </span>
                                                        </div>

                                                        <div className="mt-4 flex items-baseline gap-1">
                                                            <span className="text-3xl font-extrabold text-[var(--text-primary)]">
                                                                ₹{priceDisplay}
                                                            </span>
                                                            <span className="text-xs font-semibold text-[var(--text-muted)]">
                                                                / {cycleDisplay.toLowerCase()}
                                                            </span>
                                                        </div>

                                                        <div className="mt-4 flex flex-wrap gap-2">
                                                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                                                                <Users className="h-3.5 w-3.5" />
                                                                <span>Up to {plan.studentLimit || 500} Students</span>
                                                            </div>
                                                            {plan.aiMinutesLimit && (
                                                                <div className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40">
                                                                    <Zap className="h-3.5 w-3.5" />
                                                                    <span>{plan.aiMinutesLimit} AI Mins / Student</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="mt-5 space-y-2 border-t border-[var(--border-subtle)] pt-4">
                                                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Included Features</p>
                                                            {featuresList.length > 0 ? (
                                                                <ul className="space-y-2">
                                                                    {featuresList.slice(0, 5).map((feat, idx) => (
                                                                        <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                                                                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                                                            <span>{feat}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-xs text-[var(--text-secondary)]">Full institutional speaking curriculum, admin control, and student performance tracking.</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedPlanId(plan.id);
                                                            }}
                                                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                                                                isSelected
                                                                    ? "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700"
                                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                            }`}
                                                        >
                                                            {isSelected ? "Selected" : "Select This Plan"}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </SectionCard>

                            {/* Selected Plan Payment Summary Card */}
                            {selectedPlan && (
                                <SectionCard
                                    title="Institutional Subscription & Payment Summary"
                                    subtitle="Review your selection and proceed to secure Razorpay checkout"
                                    delay={0.1}
                                >
                                    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-5">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                                        <Sparkles className="h-3.5 w-3.5" />
                                                        {selectedPlan.planName}
                                                    </span>
                                                    <span className="text-xs font-medium text-[var(--text-muted)]">
                                                        • {selectedPlan.durationMonths ? `${selectedPlan.durationMonths} Months` : "Annual"}
                                                    </span>
                                                </div>
                                                <h4 className="mt-1 text-base font-bold text-[var(--text-primary)]">
                                                    {form.schoolName || "Institutional Subscription"}
                                                </h4>
                                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                                    Administrator: <span className="font-semibold text-[var(--text-primary)]">{form.adminName}</span> &bull; {form.adminEmail}
                                                </p>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <p className="text-xs font-medium text-[var(--text-muted)]">Total Amount</p>
                                                <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                                    ₹{selectedPlan.price != null ? Number(selectedPlan.price).toLocaleString("en-IN") : "0"}
                                                </p>
                                                <p className="text-[11px] text-[var(--text-muted)]">Includes all taxes & student seat licenses</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
                                            <div className="flex items-center gap-2 text-xs font-medium">
                                                {Number(selectedPlan.price || 0) === 0 ? (
                                                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                                                        <Sparkles className="h-4 w-4 text-indigo-600" />
                                                        <span>Free Institutional Tier • Direct Workspace Activation (No Payment Needed)</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                                        <span>100% Secure Transaction via Razorpay (Supports UPI, Cards & Net Banking)</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => setFormStep(1)}
                                                    disabled={isProcessingPayment || isSubmitting}
                                                    className="w-full sm:w-auto"
                                                >
                                                    &larr; Back to Details
                                                </Button>
                                                {Number(selectedPlan.price || 0) === 0 ? (
                                                    <Button
                                                        type="button"
                                                        onClick={handleCreateFreeSchool}
                                                        disabled={isSubmitting}
                                                        isLoading={isSubmitting}
                                                        loadingText="Creating School..."
                                                        className="w-full sm:w-auto !bg-indigo-600 hover:!bg-indigo-700 text-white font-bold"
                                                    >
                                                        <Building2 className="mr-2 h-4 w-4" />
                                                        Create School (Free Plan)
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        onClick={handleProceedToPayment}
                                                        disabled={isProcessingPayment || isSubmitting}
                                                        isLoading={isProcessingPayment || isSubmitting}
                                                        loadingText="Opening Payment Gateway..."
                                                        className="w-full sm:w-auto !bg-emerald-600 hover:!bg-emerald-700 text-white font-bold"
                                                    >
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        Proceed to Payment (₹{selectedPlan.price != null ? Number(selectedPlan.price).toLocaleString("en-IN") : "0"})
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>
                            )}
                        </div>
                    )}

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
                        <PhoneInput
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
                                onClick={() => !isDeleting && setSchoolToDelete(null)}
                                disabled={isDeleting}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteSchool}
                                disabled={isDeleting}
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

            {/* Blurred Transaction Success & PDF Receipt Modal */}
            <PaymentSuccessModal
                isOpen={paymentSuccessModalOpen}
                onClose={handleCloseSuccessModal}
                data={paymentSuccessData}
            />

            {/* Add or Replace School Administrator Modal */}
            <Modal
                isOpen={replaceModalOpen}
                onClose={() => !isSubmittingReplacement && setReplaceModalOpen(false)}
                title={
                    replaceStep === 1
                        ? (currentAdmin ? "Replace School Administrator" : "Assign School Administrator")
                        : (currentAdmin ? "Confirm Administrator Replacement" : "Confirm Administrator Assignment")
                }
                description={
                    replaceStep === 1
                        ? (currentAdmin ? `Enter the new administrator's details for ${openedSchool?.name || "this school"} and verify their email.` : `Enter the administrator's details for ${openedSchool?.name || "this school"} and verify their email.`)
                        : (currentAdmin ? `Review and confirm replacement of administrator for ${openedSchool?.name || "this school"}.` : `Review and confirm assignment of administrator for ${openedSchool?.name || "this school"}.`)
                }
            >
                {replaceStep === 1 ? (
                    <form onSubmit={handleProceedToReplaceConfirmation} className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <Input
                                    label="First Name"
                                    placeholder="e.g. Priya"
                                    value={replaceForm.adminFirstName}
                                    onChange={updateReplaceField("adminFirstName")}
                                    error={replaceErrors.adminFirstName}
                                    disabled={isSubmittingReplacement}
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    label="Last Name"
                                    placeholder="e.g. Sharma"
                                    value={replaceForm.adminLastName}
                                    onChange={updateReplaceField("adminLastName")}
                                    error={replaceErrors.adminLastName}
                                    disabled={isSubmittingReplacement}
                                />
                            </div>
                        </div>

                        {/* Phone Number BEFORE Email */}
                        <div>
                            <PhoneInput
                                label="Administrator Phone *"
                                placeholder="e.g. 9876543210"
                                value={replaceForm.adminPhone}
                                onChange={updateReplaceField("adminPhone")}
                                error={replaceErrors.adminPhone}
                                disabled={isSubmittingReplacement}
                                required
                            />
                        </div>

                        {/* Administrator Email with OTP Verification */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                Administrator Email *
                            </label>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                                <div className="flex-1">
                                    <Input
                                        placeholder="e.g. priya@example.com"
                                        type="email"
                                        value={replaceForm.adminEmail}
                                        onChange={updateReplaceField("adminEmail")}
                                        error={replaceErrors.adminEmail}
                                        disabled={isSubmittingReplacement || isSendingReplaceOtp}
                                        autoComplete="off"
                                        required
                                    />
                                </div>
                                {replaceEmailVerified ? (
                                    <div className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>Email Verified</span>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleSendReplaceOtp}
                                        disabled={!replaceForm.adminEmail.trim() || isSendingReplaceOtp || isSubmittingReplacement}
                                        isLoading={isSendingReplaceOtp}
                                        loadingText="Sending OTP..."
                                        className="!h-11 shrink-0 px-5"
                                    >
                                        Verify Email
                                    </Button>
                                )}
                            </div>
                            {replaceVerificationError && (
                                <p className="mt-1.5 text-xs font-medium text-rose-500">{replaceVerificationError}</p>
                            )}
                            {replaceEmailVerified && (
                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    <span>Email successfully verified! Ready to proceed.</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setReplaceModalOpen(false)}
                                disabled={isSubmittingReplacement}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="!bg-indigo-600 hover:!bg-indigo-700 text-white font-bold"
                                disabled={!replaceEmailVerified || !replaceVerificationToken || isSubmittingReplacement}
                            >
                                <span>{currentAdmin ? "Proceed to Replace Admin" : "Proceed to Assign Admin"}</span>
                                <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                ) : (
                    /* Step 2: Confirmation Prompt in Standard Format */
                    <div className="space-y-5">
                        {currentAdmin ? (
                            /* Replace Confirmation */
                            <>
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5">
                                        <AlertTriangle className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                        Confirm Administrator Replacement?
                                    </h3>
                                    <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-sm">
                                        Are you sure you want to replace the administrator for{" "}
                                        <span className="font-semibold text-[var(--text-primary)]">
                                            {openedSchool?.name || openedSchool?.schoolName || "this school"}
                                        </span>?
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-indigo-100 bg-slate-50 dark:border-indigo-900/40 dark:bg-slate-900/50 p-4 space-y-3">
                                    <div className="p-3.5 rounded-xl border border-amber-200/70 bg-white dark:border-amber-900/40 dark:bg-slate-900">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                                Current Administrator
                                            </span>
                                            <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-600">
                                                Will Be Deactivated
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-[var(--text-primary)]">
                                            {currentAdmin.fullName || currentAdmin.email}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)]">{currentAdmin.email} {currentAdmin.phone ? `• ${currentAdmin.phone}` : ""}</p>
                                    </div>

                                    <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/30">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                                New Administrator
                                            </span>
                                            <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                                                Will Be Appointed & Activated
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-[var(--text-primary)]">
                                            {replaceForm.adminFirstName} {replaceForm.adminLastName}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)]">{replaceForm.adminEmail} &bull; {replaceForm.adminPhone}</p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300 leading-relaxed">
                                    <strong>Important Security Notice:</strong>
                                    <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px]">
                                        <li>The current administrator will be safely deactivated (historical audit records preserved).</li>
                                        <li>Temporary login credentials will be emailed to <strong>{replaceForm.adminEmail}</strong>.</li>
                                        <li>Super Admins, the School Administrator, and all Teachers of this school will be notified immediately.</li>
                                    </ul>
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setReplaceStep(1)}
                                        disabled={isSubmittingReplacement}
                                    >
                                        &larr; Back to Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleConfirmReplacement}
                                        disabled={isSubmittingReplacement}
                                        isLoading={isSubmittingReplacement}
                                        loadingText="Replacing Administrator..."
                                        className="!bg-indigo-600 hover:!bg-indigo-700 text-white font-bold"
                                    >
                                        <ArrowLeftRight className="mr-1.5 h-4 w-4" />
                                        Yes, Replace Administrator
                                    </Button>
                                </div>
                            </>
                        ) : (
                            /* Assign Confirmation */
                            <>
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5">
                                        <UserPlus className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                        Confirm Administrator Assignment?
                                    </h3>
                                    <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-sm">
                                        Are you sure you want to appoint this administrator for{" "}
                                        <span className="font-semibold text-[var(--text-primary)]">
                                            {openedSchool?.name || openedSchool?.schoolName || "this school"}
                                        </span>?
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/20 p-4">
                                    <div className="p-3.5 rounded-xl border border-indigo-200 bg-white dark:border-indigo-800 dark:bg-slate-900">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                                Appointed Administrator
                                            </span>
                                            <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                                                Will Be Activated
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-[var(--text-primary)]">
                                            {replaceForm.adminFirstName} {replaceForm.adminLastName}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)]">{replaceForm.adminEmail} &bull; {replaceForm.adminPhone}</p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300 leading-relaxed">
                                    <strong>Next Steps:</strong>
                                    <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px]">
                                        <li>Temporary login credentials will be emailed to <strong>{replaceForm.adminEmail}</strong>.</li>
                                        <li>Super Admins and all Teachers of this school will be notified immediately.</li>
                                    </ul>
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setReplaceStep(1)}
                                        disabled={isSubmittingReplacement}
                                    >
                                        &larr; Back to Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleConfirmReplacement}
                                        disabled={isSubmittingReplacement}
                                        isLoading={isSubmittingReplacement}
                                        loadingText="Assigning Administrator..."
                                        className="!bg-indigo-600 hover:!bg-indigo-700 text-white font-bold"
                                    >
                                        <UserPlus className="mr-1.5 h-4 w-4" />
                                        Yes, Assign Administrator
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Replace Admin OTP Verification Modal */}
            <Modal
                isOpen={replaceOtpModalOpen}
                onClose={() => !isVerifyingReplaceOtp && setReplaceOtpModalOpen(false)}
                title="Verify New Admin Email"
                description={`Enter the 6-digit OTP sent to ${replaceForm.adminEmail} to complete email verification.`}
            >
                <form onSubmit={handleVerifyReplaceOtp} className="space-y-4">
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                        <div className="flex items-start gap-2.5">
                            <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                            <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                A 6-digit OTP has been sent to <span className="font-semibold text-[var(--text-primary)]">{replaceForm.adminEmail}</span>.
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
                            value={replaceOtp}
                            onChange={(e) => {
                                const numericVal = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setReplaceOtp(numericVal);
                                if (replaceOtpError) setReplaceOtpError("");
                            }}
                            placeholder="123456"
                            autoFocus
                            disabled={isVerifyingReplaceOtp}
                            className="h-12 w-full text-center font-mono text-2xl tracking-[0.4em] font-bold rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        />
                        {replaceOtpError && (
                            <p className="mt-2 text-xs font-medium text-rose-500 text-center">
                                {replaceOtpError}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="button"
                            onClick={handleSendReplaceOtp}
                            disabled={isSendingReplaceOtp || isVerifyingReplaceOtp}
                            className="text-xs font-semibold text-[var(--color-primary)] hover:underline disabled:opacity-50 disabled:no-underline"
                        >
                            {isSendingReplaceOtp ? "Resending OTP..." : "Resend OTP"}
                        </button>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setReplaceOtpModalOpen(false)}
                                disabled={isVerifyingReplaceOtp}
                                className="!h-10 text-xs px-4"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={replaceOtp.length !== 6 || isVerifyingReplaceOtp}
                                isLoading={isVerifyingReplaceOtp}
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
