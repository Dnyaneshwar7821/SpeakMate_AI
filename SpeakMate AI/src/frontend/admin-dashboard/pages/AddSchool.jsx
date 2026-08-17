import { useState } from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import SectionCard from "@admin/components/SectionCard";
import { useAdminSchools } from "@admin/hooks/useAdminSchools";

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

export function AddSchool() {
    const { addSchool } = useAdminSchools();
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [invitationSent, setInvitationSent] = useState(false);
    const [invitationMessage, setInvitationMessage] = useState("");

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
        if (!form.schoolName.trim()) next.schoolName = "School name is required";
        if (!form.schoolAddress.trim()) next.schoolAddress = "Address is required";
        if (!form.schoolEmail.trim()) next.schoolEmail = "School email is required";
        else if (!/\S+@\S+\.\S+/.test(form.schoolEmail)) next.schoolEmail = "Enter a valid email";
        if (!form.city.trim()) next.city = "City is required";
        if (!form.state.trim()) next.state = "State is required";
        if (!form.pincode.trim()) next.pincode = "Pincode is required";
        if (!form.adminName.trim()) next.adminName = "Admin name is required";
        if (!form.adminEmail.trim()) next.adminEmail = "Admin email is required";
        else if (!/\S+@\S+\.\S+/.test(form.adminEmail)) next.adminEmail = "Enter a valid email";
        if (!form.adminPhone.trim()) next.adminPhone = "Phone number is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSendInvitation = () => {
        setInvitationSent(true);
        setInvitationMessage("Invitation link sent successfully. The School Admin will receive an email to create their password and activate their account.");
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validate() || !invitationSent) return;
        
        // Add the school globally
        addSchool(form.schoolName.trim());
        
        alert("School created successfully！");
        setForm(EMPTY_FORM);
        setInvitationSent(false);
        setInvitationMessage("");
    };

    const handleReset = () => {
        setForm(EMPTY_FORM);
        setErrors({});
        setInvitationSent(false);
        setInvitationMessage("");
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
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Input
                                label="School Address"
                                placeholder="Enter School Address"
                                value={form.schoolAddress}
                                onChange={update("schoolAddress")}
                                error={errors.schoolAddress}
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
                            />
                        </div>
                        <div>
                            <Input
                                label="City"
                                placeholder="Enter City"
                                value={form.city}
                                onChange={update("city")}
                                error={errors.city}
                            />
                        </div>
                        <div>
                            <Input
                                label="State"
                                placeholder="Enter State"
                                value={form.state}
                                onChange={update("state")}
                                error={errors.state}
                            />
                        </div>
                        <div>
                            <Input
                                label="Pincode"
                                placeholder="Enter Pincode"
                                value={form.pincode}
                                onChange={update("pincode")}
                                error={errors.pincode}
                            />
                        </div>
                    </div>
                </form>
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
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <div className="flex flex-col gap-2">
                                <Input
                                    label="School Admin Email"
                                    type="email"
                                    placeholder="Enter School Admin Email"
                                    value={form.adminEmail}
                                    onChange={update("adminEmail")}
                                    error={errors.adminEmail}
                                    autoComplete="off"
                                />
                                {invitationMessage && (
                                    <p className="text-xs text-emerald-600">{invitationMessage}</p>
                                )}
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleSendInvitation}
                                    disabled={!form.adminEmail.trim() || invitationSent}
                                    className="!h-10 w-full sm:w-auto"
                                >
                                    {invitationSent ? "Invitation Sent" : "Send Invitation Link"}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Input
                                label="School Admin Phone"
                                placeholder="Enter School Admin Phone"
                                value={form.adminPhone}
                                onChange={update("adminPhone")}
                                error={errors.adminPhone}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
                        <Button type="button" variant="secondary" onClick={handleReset} className="w-full sm:w-auto">
                            Reset
                        </Button>
                        <Button type="submit" className="w-full sm:w-auto" disabled={!invitationSent}>
                            Create School
                        </Button>
                    </div>
                </form>
            </SectionCard>
        </div>
    );
}

export default AddSchool;
