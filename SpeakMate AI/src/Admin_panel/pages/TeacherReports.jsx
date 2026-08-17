import { motion } from "framer-motion";

import { containerVariants, itemVariants } from "@animations/variants";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import EmptyState from "@/Admin_panel/components/teacher/common/EmptyState";
import { teacherReportsMockData } from "@/Admin_panel/data/teacherReportsMockData";

const toneStyles = {
    indigo: { soft: "bg-indigo-50 text-indigo-700", border: "border-indigo-100" },
    violet: { soft: "bg-violet-50 text-violet-700", border: "border-violet-100" },
    emerald: { soft: "bg-emerald-50 text-emerald-700", border: "border-emerald-100" },
    amber: { soft: "bg-amber-50 text-amber-700", border: "border-amber-100" },
    rose: { soft: "bg-rose-50 text-rose-700", border: "border-rose-100" },
};

const statusStyles = {
    Ready: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    Reviewed: "bg-indigo-50 text-indigo-700 ring-indigo-600/10",
    Archived: "bg-slate-100 text-slate-600 ring-slate-500/10",
    Scheduled: "bg-violet-50 text-violet-700 ring-violet-600/10",
};

function SectionHeading({ id, eyebrow, title, description }) {
    return (
        <div>
            {eyebrow && <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">{eyebrow}</p>}
            <h2 id={id} className={`${eyebrow ? "mt-2" : ""} text-xl font-black tracking-tight text-slate-950`}>{title}</h2>
            {description && <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>}
        </div>
    );
}

function StatusBadge({ status }) {
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusStyles[status]}`}>{status}</span>;
}

function DocumentIcon({ className = "h-5 w-5" }) {
    return (
        <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8m-6-6 6 6m-6-6v6h6M8 13h8m-8 4h8" />
        </svg>
    );
}

function ReportsHeader({ meta }) {
    return (
        <motion.header variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">Structured summaries</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Reports</h1>
                <p className="mt-2 text-sm font-medium text-slate-500">Review organized class and learner records prepared for future sharing workflows.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Assigned Standard</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{meta.assignedStandard}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Academic Session</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{meta.academicSession}</p>
                </div>
            </div>
        </motion.header>
    );
}

function ReportCategories({ categories }) {
    return (
        <motion.section variants={itemVariants} className="mt-9" aria-labelledby="report-categories-title">
            <SectionHeading id="report-categories-title" eyebrow="Report library" title="Report Categories" description="Choose a structured summary template. Generation controls are placeholders for a future reporting service." />
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {categories.map((category) => {
                    const styles = toneStyles[category.tone];
                    return (
                        <Card key={category.id} className="flex h-full flex-col p-5">
                            <span className={`grid h-11 w-11 place-items-center rounded-xl ${styles.soft}`}><DocumentIcon /></span>
                            <h3 className="mt-5 text-base font-black text-slate-950">{category.title}</h3>
                            <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{category.description}</p>
                            <div className={`mt-5 border-t pt-4 ${styles.border}`}>
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Last Generated</p>
                                <p className="mt-1 text-sm font-bold text-slate-700">{category.lastGenerated}</p>
                                <Button disabled variant="secondary" className="mt-4 h-9 w-full px-3 text-xs">{category.actionLabel}</Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </motion.section>
    );
}

function RecentReportsTable({ reports }) {
    return (
        <Card className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                            {["Report Name", "Generated Date", "Report Type", "Status", "Action"].map((heading) => (
                                <th key={heading} scope="col" className="whitespace-nowrap px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">{heading}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reports.map((report) => (
                            <tr key={report.id} className="transition-colors duration-200 hover:bg-indigo-50/30">
                                <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700"><DocumentIcon className="h-4 w-4" /></span><span className="text-sm font-bold text-slate-950">{report.name}</span></div></td>
                                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-500">{report.generatedDate}</td>
                                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700">{report.type}</td>
                                <td className="px-5 py-4"><StatusBadge status={report.status} /></td>
                                <td className="px-5 py-4"><Button disabled variant="ghost" className="h-9 px-3 text-indigo-600">View Report</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

function RecentReportCards({ reports }) {
    return (
        <div className="grid gap-4 md:hidden">
            {reports.map((report) => (
                <Card key={report.id} className="p-4">
                    <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><DocumentIcon /></span>
                        <div className="min-w-0 flex-1"><h3 className="text-sm font-black leading-5 text-slate-950">{report.name}</h3><p className="mt-1 text-xs font-medium text-slate-500">Generated {report.generatedDate}</p></div>
                        <StatusBadge status={report.status} />
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-xs font-bold text-slate-600">{report.type}</span>
                        <Button disabled variant="ghost" className="h-8 px-3 text-xs text-indigo-600">View Report</Button>
                    </div>
                </Card>
            ))}
        </div>
    );
}

function RecentReports({ reports }) {
    return (
        <motion.section variants={itemVariants} className="mt-9" aria-labelledby="recent-reports-title">
            <SectionHeading id="recent-reports-title" eyebrow="Report history" title="Recent Reports" description="Previously prepared report records and their current document status." />
            <div className="mt-4"><RecentReportsTable reports={reports} /><RecentReportCards reports={reports} /></div>
        </motion.section>
    );
}

function PerformanceSummary({ metrics }) {
    return (
        <motion.section variants={itemVariants} className="mt-9" aria-labelledby="report-summary-title">
            <SectionHeading id="report-summary-title" eyebrow="Latest report snapshot" title="Class Performance Summary" description="Key values recorded in the current reporting period, presented as document highlights." />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                    const styles = toneStyles[metric.tone];
                    return (
                        <Card key={metric.id} className={`h-full border-l-4 p-5 ${styles.border}`}>
                            <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
                            <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{metric.value}</p>
                            <p className="mt-2 text-xs leading-5 text-slate-500">{metric.context}</p>
                        </Card>
                    );
                })}
            </div>
        </motion.section>
    );
}

function UpcomingReports({ reports }) {
    return (
        <motion.section variants={itemVariants} className="mt-9" aria-labelledby="upcoming-reports-title">
            <SectionHeading id="upcoming-reports-title" eyebrow="Schedule preview" title="Upcoming Reports" description="Placeholder dates for the next recurring class summaries." />
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {reports.map((report) => (
                    <Card key={report.id} className="p-5 sm:p-6">
                        <div className="flex items-start gap-4">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
                                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v4m12-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /></svg>
                            </span>
                            <div className="min-w-0 flex-1"><h3 className="text-base font-black text-slate-950">{report.title}</h3><p className="mt-1 text-sm text-slate-500">Coverage: {report.coverage}</p><p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">Scheduled for <span className="text-slate-700">{report.scheduledDate}</span></p></div>
                            <StatusBadge status={report.status} />
                        </div>
                    </Card>
                ))}
            </div>
        </motion.section>
    );
}

function ReportsEmptyState() {
    return (
        <EmptyState
            className="mt-8"
            title="No reports available."
            description="Generated class and student summaries will appear here when reporting activity is available."
            icon={<DocumentIcon className="h-6 w-6" />}
        />
    );
}

export function TeacherReports() {
    const data = teacherReportsMockData;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <ReportsHeader meta={data.meta} />
            {!data.hasReports ? (
                <motion.div variants={itemVariants}><ReportsEmptyState /></motion.div>
            ) : (
                <>
                    <ReportCategories categories={data.categories} />
                    <RecentReports reports={data.recentReports} />
                    <PerformanceSummary metrics={data.performanceSummary} />
                    <UpcomingReports reports={data.upcomingReports} />
                </>
            )}
        </motion.div>
    );
}

export default TeacherReports;
