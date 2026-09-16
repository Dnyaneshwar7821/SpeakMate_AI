import React from "react";
import { GraduationCap, School } from "lucide-react";

export function SchoolAcademicPerformance({ assessments }) {
  if (!assessments || !assessments.schoolStudent) return null;

  const totalTests = assessments.totalTests ?? 0;
  const completedTests = assessments.completedTests ?? 0;
  const avgPercentage = assessments.averageTestPercentage;
  const recentResults = Array.isArray(assessments.recentResults) ? assessments.recentResults : [];
  const assignments = assessments.assignmentsSummary;

  return (
    <div
      id="section-school"
      className="scroll-mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <GraduationCap size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              School Academic Performance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Classroom examinations, teacher assignments, and graded test evaluations
            </p>
          </div>
        </div>

        {assessments.schoolName && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 px-3 py-1 rounded-full self-start sm:self-auto">
            <School size={12} />
            {assessments.schoolName}
          </span>
        )}
      </div>

      {/* Tests & Assignments High-Level Metrics */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classroom Tests</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {completedTests} <span className="text-xs font-normal text-slate-400">/ {totalTests}</span>
          </p>
        </div>

        <div className="rounded-xl border border-purple-100 dark:border-purple-900/30 bg-purple-50/20 dark:bg-purple-950/20 p-3.5">
          <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Test Average</p>
          <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {avgPercentage != null ? `${Math.round(avgPercentage)}%` : "—"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Work</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {assignments?.totalAssigned ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {assignments?.completed ?? 0} completed • {assignments?.inProgress ?? 0} in progress
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/20 p-3.5">
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Assignment Avg</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {assignments?.averageScore != null ? `${Math.round(assignments.averageScore)}%` : "—"}
          </p>
        </div>
      </div>

      {/* Classroom Test Results Table */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          Classroom Examination Results
        </h4>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Examination / Test Title</th>
                <th className="px-3 py-3">Score</th>
                <th className="px-3 py-3">Percentage</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentResults.length > 0 ? (
                recentResults.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {r.testTitle || `Evaluation #${r.id || idx + 1}`}
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                      {r.marksObtained ?? 0} / {r.totalMarks ?? 0}
                    </td>
                    <td className="px-3 py-3 font-bold text-purple-600 dark:text-purple-400">
                      {r.percentage != null ? `${Math.round(r.percentage)}%` : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          (r.status || "").toUpperCase() === "PASS"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        {r.status || "EVALUATED"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-400">
                      {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                    No classroom tests recorded for this student yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SchoolAcademicPerformance;
