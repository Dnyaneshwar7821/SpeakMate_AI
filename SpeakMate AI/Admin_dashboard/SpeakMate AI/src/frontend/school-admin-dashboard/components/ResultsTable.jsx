export function ResultsTable({ results, onRowClick }) {
    if (!results.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">No results found</p>
                <p className="text-sm text-[var(--text-secondary)]">
                    Try adjusting your search.
                </p>
            </div>
        );
    }

    return (
        <div className="thin-scrollbar -mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        <th className="px-4 py-3 sm:px-5">Student</th>
                        <th className="px-4 py-3 sm:px-5">Standard</th>
                        <th className="px-4 py-3 sm:px-5">Test</th>
                        <th className="px-4 py-3 sm:px-5 text-right">Marks</th>
                        <th className="px-4 py-3 sm:px-5 text-right">Percentage</th>
                        <th className="px-4 py-3 sm:px-5">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((r) => (
                        <tr
                            key={r.id}
                            onClick={() => onRowClick && onRowClick(r)}
                            className="cursor-pointer border-b border-[var(--border-subtle)] transition last:border-0 hover:bg-[var(--bg-hover)]"
                        >
                            <td className="px-4 py-3 sm:px-5">
                                <p className="font-semibold text-[var(--text-primary)]">{r.studentName}</p>
                            </td>
                            <td className="px-4 py-3 text-[var(--text-secondary)] sm:px-5">{r.standard}th</td>
                            <td className="px-4 py-3 text-[var(--text-secondary)] sm:px-5">{r.testTitle}</td>
                            <td className="px-4 py-3 text-right font-semibold text-[var(--text-primary)] sm:px-5">
                                {r.marksObtained} / {r.totalMarks}
                            </td>
                            <td className="px-4 py-3 text-right text-[var(--text-secondary)] sm:px-5">
                                {r.percentage}%
                            </td>
                            <td className="px-4 py-3 sm:px-5">
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${r.status === "Passed" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                                >
                                    {r.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ResultsTable;
