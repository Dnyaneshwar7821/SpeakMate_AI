import { motion } from "framer-motion";

import { containerVariants, itemVariants } from "@animations/variants";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import EmptyState from "@/Admin_panel/components/teacher/common/EmptyState";
import { teacherProfileMockData } from "@/Admin_panel/data/teacherProfileMockData";

const toneStyles = {
    indigo: "border-indigo-100 bg-indigo-50 text-indigo-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
};

const detailIcons = {
    email: <><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /><path d="m22 7-10 6L2 7" /></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c1 .4 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
};

const preferenceIcons = {
    theme: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    language: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
    notification: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
};

function getInitials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("");
}

function LineIcon({ children, className = "h-5 w-5" }) {
    return (
        <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </svg>
    );
}

function SectionHeading({ id, eyebrow, title, description }) {
    return (
        <div>
            {eyebrow && <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">{eyebrow}</p>}
            <h2 id={id} className={`${eyebrow ? "mt-2" : ""} text-xl font-black tracking-tight text-slate-950`}>{title}</h2>
            {description && <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>}
        </div>
    );
}

function StatusBadge({ children }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {children}
        </span>
    );
}

function ProfileHeader({ identity }) {
    return (
        <motion.header variants={itemVariants}>
            <Card className="overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Teacher profile</p>
                </div>
                <div className="p-5 sm:p-6 lg:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 text-xl font-black text-white shadow-lg shadow-indigo-600/20 sm:h-24 sm:w-24 sm:text-2xl">
                                {getInitials(identity.name)}
                            </span>
                            <div className="min-w-0">
                                <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{identity.name}</h1>
                                <p className="mt-1 break-all text-sm font-medium text-slate-500">{identity.email}</p>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <StatusBadge>Active teacher</StatusBadge>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">ID: {identity.teacherId}</span>
                                </div>
                            </div>
                        </div>
                        <dl className="grid gap-3 sm:grid-cols-3 lg:min-w-[540px]">
                            {[
                                ["Assigned Standard", identity.assignedStandard],
                                ["Designation", identity.designation],
                                ["School", identity.schoolName],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt>
                                    <dd className="mt-1 text-sm font-bold leading-5 text-slate-800">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </Card>
        </motion.header>
    );
}

function TeachingOverview({ metrics }) {
    return (
        <motion.section variants={itemVariants} className="mt-8" aria-labelledby="teaching-overview-title">
            <SectionHeading id="teaching-overview-title" eyebrow="Class snapshot" title="Teaching Overview" description="A concise summary of the teacher's current classroom assignment and reporting activity." />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                    <Card key={metric.id} className="h-full p-5">
                        <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${toneStyles[metric.tone]}`}>{metric.label}</span>
                        <p className="mt-4 text-2xl font-black tracking-tight text-slate-950">{metric.value}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{metric.context}</p>
                    </Card>
                ))}
            </div>
        </motion.section>
    );
}

function ProfessionalInformation({ information }) {
    return (
        <Card className="p-5 sm:p-6">
            <SectionHeading id="professional-information-title" title="Professional Information" description="Employment and academic details recorded for this teacher." />
            <dl className="mt-5 divide-y divide-slate-100">
                {information.map((item) => (
                    <div key={item.id} className="grid gap-1 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5">
                        <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.label}</dt>
                        <dd className="text-sm font-bold leading-6 text-slate-800">{item.status ? <StatusBadge>{item.value}</StatusBadge> : item.value}</dd>
                    </div>
                ))}
            </dl>
        </Card>
    );
}

function ContactInformation({ information }) {
    return (
        <Card className="p-5 sm:p-6">
            <SectionHeading id="contact-information-title" title="Contact Information" description="Read-only contact details for school communication." />
            <dl className="mt-5 space-y-3">
                {information.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100">
                            <LineIcon className="h-4 w-4">{detailIcons[item.icon]}</LineIcon>
                        </span>
                        <div className="min-w-0">
                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.label}</dt>
                            <dd className="mt-1 break-words text-sm font-bold leading-5 text-slate-800">{item.value}</dd>
                        </div>
                    </div>
                ))}
            </dl>
        </Card>
    );
}

function AccountInformation({ information }) {
    return (
        <Card className="p-5 sm:p-6">
            <SectionHeading id="account-information-title" title="Account Information" description="Workspace identity and access metadata." />
            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {information.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                        <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.label}</dt>
                        <dd className="mt-2 text-sm font-black text-slate-900">{item.status ? <StatusBadge>{item.value}</StatusBadge> : item.value}</dd>
                    </div>
                ))}
            </dl>
        </Card>
    );
}

function Preferences({ preferences }) {
    return (
        <Card className="p-5 sm:p-6">
            <SectionHeading id="preferences-title" title="Preferences" description="Current visual-only workspace preferences." />
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {preferences.map((preference) => (
                    <div key={preference.id} className="flex gap-3 rounded-xl border border-slate-200 p-4">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                            <LineIcon>{preferenceIcons[preference.icon]}</LineIcon>
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{preference.label}</p>
                            <p className="mt-1 text-sm font-black text-slate-900">{preference.value}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{preference.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function QuickActions({ actions }) {
    return (
        <Card className="p-5 sm:p-6">
            <SectionHeading id="quick-actions-title" title="Quick Actions" description="Profile-management controls reserved for a future account service." />
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {actions.map((action) => (
                    <Button key={action.id} disabled variant={action.variant} className="w-full">{action.label}</Button>
                ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">These actions are unavailable in the read-only teacher workspace.</p>
        </Card>
    );
}

function ProfileEmptyState() {
    return (
        <EmptyState
            titleAs="h1"
            titleClassName="text-lg font-black"
            descriptionClassName="mt-2"
            title="Teacher profile unavailable"
            description="Professional and account information will appear here when a profile record is available."
            icon={<LineIcon className="h-6 w-6"><path d="M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /></LineIcon>}
        />
    );
}

export function TeacherProfile() {
    const data = teacherProfileMockData;

    if (!data.hasProfile) {
        return (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={itemVariants}><ProfileEmptyState /></motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <ProfileHeader identity={data.identity} />
            <TeachingOverview metrics={data.teachingOverview} />
            <motion.div variants={itemVariants} className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:items-start">
                <div className="grid gap-6">
                    <ProfessionalInformation information={data.professionalInformation} />
                    <ContactInformation information={data.contactInformation} />
                </div>
                <div className="grid gap-6">
                    <AccountInformation information={data.accountInformation} />
                    <Preferences preferences={data.preferences} />
                    <QuickActions actions={data.quickActions} />
                </div>
            </motion.div>
        </motion.div>
    );
}

export default TeacherProfile;
