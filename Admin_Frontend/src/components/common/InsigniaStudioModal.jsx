import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Upload,
    Sparkles,
    RotateCcw,
    Check,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Shield,
    Camera,
} from "lucide-react";
import Button from "@components/common/Button";
import {
    CALLIGRAPHY_CRESTS,
    getInitials,
    saveProfileInsignia,
    resetProfileInsignia,
} from "@utils/insigniaHelper";

/**
 * InsigniaStudioModal.jsx
 *
 * Institutional Studio for customizing Profile Insignia across:
 * Super Admin, School Admin, and Teacher Admin.
 *
 * 3 Interactive Views:
 *  1. Source Selector ("Upload Institutional Photo", "Calligraphy Crest", "Reset to Standard")
 *  2. "Ask Before Upload" Image Confirmation & Circular Crop Preview
 *  3. Calligraphy Monogram Studio (6 Luxury Presets with live initials preview)
 */
export function InsigniaStudioModal({
    isOpen,
    onClose,
    role = "SUPER_ADMIN",
    name = "Admin",
    email = "",
    onInsigniaUpdated,
}) {
    // Current step/view: "SELECT_SOURCE" | "CONFIRM_UPLOAD" | "CALLIGRAPHY_STUDIO"
    const [view, setView] = useState("SELECT_SOURCE");

    // Pending uploaded image state for preview confirmation
    const [pendingImage, setPendingImage] = useState(null);
    const [imageError, setImageError] = useState("");

    // Selected calligraphy style
    const [selectedStyleId, setSelectedStyleId] = useState("royal_crest");

    const fileInputRef = useRef(null);
    const initials = getInitials(name);

    if (!isOpen) return null;

    const handleClose = () => {
        setView("SELECT_SOURCE");
        setPendingImage(null);
        setImageError("");
        onClose();
    };

    // Trigger file chooser
    const handlePickFileClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    };

    // Handle file selection and prepare preview confirmation
    const handleFileChange = (e) => {
        setImageError("");
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation: must be image
        if (!file.type.startsWith("image/")) {
            setImageError("Please select a valid image file (JPG, PNG, WebP).");
            return;
        }

        // Validation: max 4 MB
        if (file.size > 4 * 1024 * 1024) {
            setImageError("Image file size exceeds 4 MB. Please choose a smaller photo.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvt) => {
            const dataUrl = loadEvt.target.result;
            setPendingImage({
                data: dataUrl,
                fileName: file.name,
                fileSizeKb: Math.round(file.size / 1024),
            });
            setView("CONFIRM_UPLOAD");
        };
        reader.onerror = () => {
            setImageError("Failed to read image file. Please try again.");
        };
        reader.readAsDataURL(file);
    };

    // Confirm image upload
    const handleConfirmUpload = () => {
        if (!pendingImage?.data) return;
        const config = {
            type: "image",
            data: pendingImage.data,
            fileName: pendingImage.fileName,
        };
        saveProfileInsignia(role, email, config, name);
        if (onInsigniaUpdated) {
            onInsigniaUpdated("Institutional photo applied as Profile Insignia!");
        }
        handleClose();
    };

    // Apply calligraphy style
    const handleApplyCalligraphy = () => {
        const config = {
            type: "calligraphy",
            styleId: selectedStyleId,
        };
        saveProfileInsignia(role, email, config, name);
        if (onInsigniaUpdated) {
            onInsigniaUpdated("Stylized Calligraphy Crest applied as Profile Insignia!");
        }
        handleClose();
    };

    // Reset to standard initials
    const handleResetToInitials = () => {
        resetProfileInsignia(role, email, name);
        if (onInsigniaUpdated) {
            onInsigniaUpdated("Reset to standard institutional initials crest.");
        }
        handleClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Hidden native file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Modal Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-2xl"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                    <div className="flex items-center gap-3">
                        {view !== "SELECT_SOURCE" && (
                            <button
                                type="button"
                                onClick={() => setView("SELECT_SOURCE")}
                                className="grid h-8 w-8 place-items-center rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        )}
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            <Shield className="h-5 w-5" />
                        </span>
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                {view === "SELECT_SOURCE" && "Profile Insignia Studio"}
                                {view === "CONFIRM_UPLOAD" && "Confirm Institutional Photo"}
                                {view === "CALLIGRAPHY_STUDIO" && "Stylized Calligraphy Crests"}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)]">
                                {view === "SELECT_SOURCE" && "Customize your institutional emblem or portrait"}
                                {view === "CONFIRM_UPLOAD" && "Review crop preview before saving as insignia"}
                                {view === "CALLIGRAPHY_STUDIO" && "Choose an artistic monogram style for your initials"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="grid h-8 w-8 place-items-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {imageError && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{imageError}</span>
                    </div>
                )}

                {/* VIEW 1: SELECT SOURCE */}
                {view === "SELECT_SOURCE" && (
                    <div className="mt-6 space-y-3.5">
                        {/* Option 1: Upload Photo */}
                        <button
                            type="button"
                            onClick={handlePickFileClick}
                            className="group flex w-full items-center gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-left shadow-sm transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 hover:shadow-md"
                        >
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110">
                                <Upload className="h-6 w-6" />
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[var(--text-primary)]">
                                    Upload Institutional Photo
                                </p>
                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                    Browse photo from computer (JPG, PNG, WebP up to 4MB)
                                </p>
                            </div>
                        </button>

                        {/* Option 2: Calligraphy Crest */}
                        <button
                            type="button"
                            onClick={() => setView("CALLIGRAPHY_STUDIO")}
                            className="group flex w-full items-center gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-left shadow-sm transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 hover:shadow-md"
                        >
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110">
                                <Sparkles className="h-6 w-6" />
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-[var(--text-primary)]">
                                        Stylized Calligraphy Crest
                                    </p>
                                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        6 Styles
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                    Luxury monogram typography with custom fonts & regal gradients
                                </p>
                            </div>
                        </button>

                        {/* Option 3: Reset to Default Initials */}
                        <button
                            type="button"
                            onClick={handleResetToInitials}
                            className="group flex w-full items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-4 text-left shadow-sm transition-all hover:border-slate-400 hover:bg-[var(--bg-hover)]"
                        >
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-500/10 text-slate-600 dark:text-slate-400 transition-transform group-hover:scale-110">
                                <RotateCcw className="h-5 w-5" />
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--text-primary)]">
                                    Reset to Standard Initials
                                </p>
                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                    Revert to the default 2-letter monogram:{" "}
                                    <strong className="text-[var(--text-primary)]">{initials}</strong>
                                </p>
                            </div>
                        </button>
                    </div>
                )}

                {/* VIEW 2: CONFIRM UPLOAD (ASK BEFORE UPLOADING) */}
                {view === "CONFIRM_UPLOAD" && pendingImage && (
                    <div className="mt-6 space-y-6 text-center">
                        <div className="relative mx-auto w-fit">
                            <div className="h-32 w-32 rounded-full overflow-hidden ring-4 ring-[var(--color-primary)]/40 shadow-2xl mx-auto">
                                <img
                                    src={pendingImage.data}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <span className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full bg-[var(--color-primary)] text-white shadow-lg ring-2 ring-[var(--bg-surface)]">
                                <Camera size={14} />
                            </span>
                        </div>

                        {/* File Details Card */}
                        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-hover)]/50 p-3.5 text-xs text-[var(--text-secondary)]">
                            <p className="font-bold text-[var(--text-primary)] truncate">
                                {pendingImage.fileName}
                            </p>
                            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                                Approximate size: {pendingImage.fileSizeKb} KB • Circular crop applied
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={handlePickFileClick}
                                className="!h-10 text-xs"
                            >
                                Choose Another
                            </Button>
                            <Button
                                onClick={handleConfirmUpload}
                                className="!h-10 bg-[var(--color-primary)] text-xs"
                            >
                                <Check className="mr-1.5 h-4 w-4" />
                                Confirm & Apply Insignia
                            </Button>
                        </div>
                    </div>
                )}

                {/* VIEW 3: CALLIGRAPHY CRESTS STUDIO */}
                {view === "CALLIGRAPHY_STUDIO" && (
                    <div className="mt-5 space-y-5">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 max-h-[320px] overflow-y-auto pr-1">
                            {CALLIGRAPHY_CRESTS.map((style) => {
                                const isSelected = selectedStyleId === style.id;
                                return (
                                    <button
                                        key={style.id}
                                        type="button"
                                        onClick={() => setSelectedStyleId(style.id)}
                                        className={`group relative flex flex-col items-center rounded-2xl border p-3.5 text-center transition-all ${
                                            isSelected
                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 ring-2 ring-[var(--color-primary)]/30 shadow-md"
                                                : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-slate-400 hover:bg-[var(--bg-hover)]"
                                        }`}
                                    >
                                        {/* Insignia Preview */}
                                        <div
                                            className={`grid h-16 w-16 place-items-center rounded-full transition-transform group-hover:scale-105 ${style.containerClass}`}
                                        >
                                            <span className={`text-xl ${style.textClass}`}>
                                                {initials}
                                            </span>
                                        </div>

                                        <p className="mt-2.5 text-xs font-bold text-[var(--text-primary)]">
                                            {style.name}
                                        </p>
                                        <p className="text-[10px] text-[var(--text-muted)] truncate max-w-full">
                                            {style.subtitle}
                                        </p>

                                        {isSelected && (
                                            <span className="absolute top-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-[var(--color-primary)] text-white shadow">
                                                <Check size={11} strokeWidth={3} />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                            <span className="text-xs text-[var(--text-muted)]">
                                Selected: <strong className="text-[var(--text-primary)]">{CALLIGRAPHY_CRESTS.find(s => s.id === selectedStyleId)?.name}</strong>
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setView("SELECT_SOURCE")}
                                    className="!h-9 text-xs"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleApplyCalligraphy}
                                    className="!h-9 bg-[var(--color-primary)] text-xs"
                                >
                                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                    Apply Insignia
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default InsigniaStudioModal;
