import Modal from "@components/common/Modal";
import Button from "@components/common/Button";
import { getInitials } from "@utils/formatters";

/**
 * Utility to get ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinal(n) {
    if (!n) return "";
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function TeacherStudentsModal({ isOpen, teacher, students, onClose }) {
    if (!teacher) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl" title={`Students Assigned to ${teacher.name}`}>
            <div className="mt-4 flex flex-col gap-6">
                
                {/* Header Summary */}
                <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-lg font-bold text-white shadow-md">
                                {getInitials(teacher.name)}
                            </span>
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">{teacher.name}</h3>
                                <p className="mt-0.5 text-sm font-semibold text-[var(--color-primary)]">
                                    {teacher.subject}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Total Students</p>
                        <p className="text-3xl font-black text-[var(--text-primary)]">{students.length}</p>
                    </div>
                </div>

                {/* Students List */}
                <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Student List</h4>
                    
                    {students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] py-12 text-center">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">No students assigned</p>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">This teacher currently has no students.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
                            {students.map((student, index) => (
                                <div key={student.id} className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4 last:border-0 hover:bg-[var(--bg-hover)] transition">
                                    <div className="flex items-center gap-3">
                                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] border border-[var(--border-default)]">
                                            {getInitials(student.name)}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-[var(--text-primary)]">{student.name}</p>
                                            <p className="truncate text-xs text-[var(--text-secondary)]">
                                                <span className="font-semibold">{getOrdinal(student.standard)} Standard</span> &bull; Roll No: {student.rollNo}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-[var(--color-primary)]">{student.progress?.xp?.toLocaleString() || 0}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">XP</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mt-8 flex justify-end">
                <Button onClick={onClose} variant="secondary">Close</Button>
            </div>
        </Modal>
    );
}

export default TeacherStudentsModal;
