import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { CheckCircle2, XCircle, TrendingUp, Clock, CalendarDays } from "lucide-react";
import Modal from "@components/common/Modal";
import Button from "@components/common/Button";
import { formatDate } from "@utils/formatters";

/**
 * Utility to get ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function ResultDetailsModal({ isOpen, result, onClose }) {
    if (!result) return null;

    // Generate mock breakdown data for pie chart based on marks
    const pieData = [
        { name: 'Correct', value: result.marksObtained, color: '#22c55e' }, // Emerald
        { name: 'Incorrect / Unanswered', value: result.totalMarks - result.marksObtained, color: '#f43f5e' } // Rose
    ];

    const isPassed = result.status === "Passed";

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" title="Test Result Breakdown">
            <div className="mt-4 flex flex-col gap-6">
                
                {/* Header Summary */}
                <div className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
                    isPassed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'
                }`}>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">{result.studentName}</h3>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                                isPassed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                                {isPassed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                {result.status}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            <span className="font-semibold">{getOrdinal(result.standard)} Standard</span> &bull; {result.testTitle}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-right">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Score</p>
                            <p className="text-2xl font-black text-[var(--text-primary)]">{result.percentage}%</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Pie Chart */}
                    <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
                        <span className="mb-2 text-sm font-bold text-[var(--text-primary)]">Score Breakdown</span>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', borderRadius: '8px' }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Stats List */}
                    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
                        <span className="mb-2 text-sm font-bold text-[var(--text-primary)]">Test Details</span>
                        
                        <div className="flex items-center justify-between rounded-lg bg-[var(--bg-elevated)] p-3">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-sm font-medium">Marks Obtained</span>
                            </div>
                            <span className="font-bold text-[var(--text-primary)]">{result.marksObtained} / {result.totalMarks}</span>
                        </div>
                        
                        <div className="flex items-center justify-between rounded-lg bg-[var(--bg-elevated)] p-3">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                <CalendarDays className="h-4 w-4" />
                                <span className="text-sm font-medium">Submitted On</span>
                            </div>
                            <span className="font-bold text-[var(--text-primary)]">{formatDate(result.submittedAt, { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-[var(--bg-elevated)] p-3">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium">Time Taken</span>
                            </div>
                            <span className="font-bold text-[var(--text-primary)]">45 mins</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 flex justify-end">
                <Button onClick={onClose} variant="secondary">Close</Button>
            </div>
        </Modal>
    );
}

export default ResultDetailsModal;
