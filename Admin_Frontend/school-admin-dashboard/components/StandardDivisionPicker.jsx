import { useMemo, useEffect } from "react";
import Button from "@components/common/Button";
import { Plus, Trash2, X, AlertTriangle } from "lucide-react";
import { STANDARD_OPTIONS } from "../../src/constants/standardOptions";

/**
 * Normalizes standard name strings (e.g. "8th Standard", "8th", "8")
 * to facilitate loose matching across configurations.
 */
export const normalizeStd = (val) => {
    if (!val) return "";
    return String(val)
        .trim()
        .replace(/(st|nd|rd|th)?\s*(standard|std|grade|class)?$/i, "")
        .replace(/^(grade|class)\s*/i, "")
        .trim();
};

/**
 * Flattens and deduplicates assignment groups into the API payload format:
 * [{ standard: "8th", division: "A" }, ...]
 */
export const computeAllSelectedAssignments = (assignmentGroups) => {
    const seen = new Set();
    const result = [];
    (assignmentGroups || []).forEach((g) => {
        if (g.standard && Array.isArray(g.divisions)) {
            g.divisions.forEach((d) => {
                const key = `${g.standard}-${d}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    result.push({ standard: g.standard, division: d });
                }
            });
        }
    });
    return result;
};

/**
 * Parses initial teacher data into assignment groups for the checkbox UI:
 * [{ standard: "8th", divisions: ["A", "B"] }]
 */
export const loadInitialAssignmentGroups = (data) => {
    let initialGroups = [];
    if (data && Array.isArray(data.standardDivisions) && data.standardDivisions.length > 0) {
        const map = new Map();
        data.standardDivisions.forEach((sd) => {
            const std = sd.standard || "";
            const div = sd.division || "";
            if (std) {
                if (!map.has(std)) map.set(std, []);
                if (div && !map.get(std).includes(div)) {
                    map.get(std).push(div);
                }
            }
        });
        map.forEach((divs, std) => {
            initialGroups.push({ standard: std, divisions: divs.sort() });
        });
    } else if (data && (data.standard || data.division)) {
        initialGroups.push({
            standard: data.standard || "",
            divisions: data.division ? [data.division] : []
        });
    }
    if (initialGroups.length === 0) {
        initialGroups = [{ standard: "", divisions: [] }];
    }
    return initialGroups;
};

/**
 * Builds an in-memory map of occupied standard + division assignments for the school.
 * Excludes the teacher currently being edited (self-exclusion).
 * Map key: `${normalizeStd(standard)}-${division.toUpperCase()}`
 */
export const buildOccupiedAssignmentsMap = (teachers = [], editingTeacherId = null, currentSchoolId = null) => {
    const map = new Map();
    (teachers || []).forEach((t) => {
        // Self-exclusion: skip the teacher currently being edited
        if (editingTeacherId != null && (String(t.id) === String(editingTeacherId) || String(t.dbId) === String(editingTeacherId))) {
            return;
        }

        // School isolation: if currentSchoolId is specified, ensure teacher belongs to this school
        if (currentSchoolId != null && t.schoolId != null && String(t.schoolId) !== String(currentSchoolId)) {
            return;
        }

        const teacherName = t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim() || t.email || "Another Teacher";

        const pairs = [];
        if (Array.isArray(t.standardDivisions) && t.standardDivisions.length > 0) {
            t.standardDivisions.forEach((sd) => {
                if (sd?.standard && sd?.division) {
                    pairs.push({ standard: sd.standard, division: sd.division });
                }
            });
        } else if (t.standard && t.division) {
            pairs.push({ standard: t.standard, division: t.division });
        }

        pairs.forEach(({ standard, division }) => {
            const normStd = normalizeStd(standard);
            const normDiv = String(division).trim().toUpperCase();
            const key = `${normStd}-${normDiv}`;
            if (!map.has(key)) {
                map.set(key, {
                    teacherId: t.id,
                    teacherName,
                    standard,
                    division: normDiv
                });
            }
        });
    });
    return map;
};

/**
 * Computes active assignment conflicts between currently selected assignments and occupied map.
 */
export const computeAssignmentConflicts = (allSelectedAssignments = [], occupiedAssignmentsMap = new Map()) => {
    const conflicts = [];
    (allSelectedAssignments || []).forEach((assignment) => {
        const key = `${normalizeStd(assignment.standard)}-${String(assignment.division).trim().toUpperCase()}`;
        const occupied = occupiedAssignmentsMap.get(key);
        if (occupied) {
            conflicts.push({
                standard: assignment.standard,
                division: assignment.division,
                teacherName: occupied.teacherName,
                teacherId: occupied.teacherId,
                message: `${assignment.standard}-${assignment.division} is already assigned to ${occupied.teacherName}`
            });
        }
    });
    return conflicts;
};

/**
 * Validates standard division selection according to rules:
 * 1. At least one standard-division pair must be selected.
 * 2. If a standard is chosen, at least one division must be checked.
 * 3. No conflicting assignments already assigned to another teacher.
 */
export const validateStandardDivisions = (assignmentGroups, conflicts = []) => {
    const allAssignments = computeAllSelectedAssignments(assignmentGroups);
    if (allAssignments.length === 0) {
        return "At least one Standard and Division assignment must be selected";
    }
    const incompleteGroup = (assignmentGroups || []).find(
        (g) => g.standard && (!g.divisions || g.divisions.length === 0)
    );
    if (incompleteGroup) {
        return `Please select at least one division for ${incompleteGroup.standard} Standard`;
    }
    if (conflicts && conflicts.length > 0) {
        return `Assignment conflict: ${conflicts.map((c) => `${c.standard}-${c.division} is already assigned to ${c.teacherName}`).join(". ")}. Remove conflicting assignments to continue.`;
    }
    return null;
};

/**
 * Reusable Standard & Division Assignment Picker component for School Admin
 */
export function StandardDivisionPicker({
    assignmentGroups = [{ standard: "", divisions: [] }],
    onChange,
    activeConfig = [],
    error,
    disabled = false,
    teachers = [],
    editingTeacherId = null,
    schoolId = null,
    onConflictsChange
}) {
    const fallbackStandards = useMemo(() => {
        return STANDARD_OPTIONS.map((std) => ({
            standard: std,
            divisions: ["A", "B", "C", "D", "E"]
        }));
    }, []);

    const effectiveConfig = (activeConfig && activeConfig.length > 0) ? activeConfig : fallbackStandards;

    const allSelectedAssignments = useMemo(() => {
        return computeAllSelectedAssignments(assignmentGroups);
    }, [assignmentGroups]);

    // In-memory conflict lookup for teacher assignments within the school
    const occupiedAssignmentsMap = useMemo(() => {
        return buildOccupiedAssignmentsMap(teachers, editingTeacherId, schoolId);
    }, [teachers, editingTeacherId, schoolId]);

    // Active assignment conflicts for current selections
    const assignmentConflicts = useMemo(() => {
        return computeAssignmentConflicts(allSelectedAssignments, occupiedAssignmentsMap);
    }, [allSelectedAssignments, occupiedAssignmentsMap]);

    useEffect(() => {
        onConflictsChange?.(assignmentConflicts);
    }, [assignmentConflicts, onConflictsChange]);

    const handleStandardChange = (groupIndex, newStandard) => {
        const nextGroups = [...assignmentGroups];
        nextGroups[groupIndex] = { standard: newStandard, divisions: [] };
        onChange?.(nextGroups, computeAllSelectedAssignments(nextGroups));
    };

    const handleToggleDivision = (groupIndex, division) => {
        const nextGroups = [...assignmentGroups];
        const group = nextGroups[groupIndex];
        const hasDiv = group.divisions.includes(division);
        const newDivs = hasDiv
            ? group.divisions.filter((d) => d !== division)
            : [...group.divisions, division].sort();
        nextGroups[groupIndex] = { ...group, divisions: newDivs };
        onChange?.(nextGroups, computeAllSelectedAssignments(nextGroups));
    };

    const handleSelectAllDivisions = (groupIndex, availableDivisions) => {
        const nextGroups = [...assignmentGroups];
        nextGroups[groupIndex] = { ...nextGroups[groupIndex], divisions: [...availableDivisions] };
        onChange?.(nextGroups, computeAllSelectedAssignments(nextGroups));
    };

    const handleClearAllDivisions = (groupIndex) => {
        const nextGroups = [...assignmentGroups];
        nextGroups[groupIndex] = { ...nextGroups[groupIndex], divisions: [] };
        onChange?.(nextGroups, computeAllSelectedAssignments(nextGroups));
    };

    const handleAddStandardGroup = () => {
        const nextGroups = [...assignmentGroups, { standard: "", divisions: [] }];
        onChange?.(nextGroups, computeAllSelectedAssignments(nextGroups));
    };

    const handleRemoveStandardGroup = (groupIndex) => {
        let nextGroups = assignmentGroups.filter((_, i) => i !== groupIndex);
        if (nextGroups.length === 0) {
            nextGroups = [{ standard: "", divisions: [] }];
        }
        onChange?.(nextGroups, computeAllSelectedAssignments(nextGroups));
    };

    const handleRemoveAssignment = (standard, division) => {
        const nextGroups = assignmentGroups.map((g) => {
            if (g.standard === standard || normalizeStd(g.standard) === normalizeStd(standard)) {
                return { ...g, divisions: g.divisions.filter((d) => d !== division) };
            }
            return g;
        });
        onChange?.(nextGroups, computeAllSelectedAssignments(nextGroups));
    };

    return (
        <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Assigned Standards & Divisions
                </label>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddStandardGroup}
                    className="!h-8 !px-3 !text-xs"
                    disabled={disabled}
                >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Another Standard
                </Button>
            </div>

            <div className="space-y-3">
                {assignmentGroups.map((group, groupIndex) => {
                    const selectedConfig = effectiveConfig.find(
                        (c) => c.standard === group.standard || normalizeStd(c.standard) === normalizeStd(group.standard)
                    );
                    const configuredDivisions = selectedConfig ? selectedConfig.divisions : [];
                    // Merge any legacy or pre-assigned divisions so they are never lost
                    const availableDivisions = Array.from(new Set([...configuredDivisions, ...group.divisions])).sort();

                    const isLegacyStandard =
                        group.standard &&
                        !effectiveConfig.some(
                            (c) => c.standard === group.standard || normalizeStd(c.standard) === normalizeStd(group.standard)
                        );

                    return (
                        <div
                            key={groupIndex}
                            className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-3.5 space-y-3 transition-all"
                        >
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                                        Standard
                                    </label>
                                    <select
                                        value={group.standard}
                                        onChange={(e) => handleStandardChange(groupIndex, e.target.value)}
                                        disabled={disabled}
                                        className="h-11 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <option value="">Select standard</option>
                                        {isLegacyStandard && (
                                            <option value={group.standard}>{group.standard}</option>
                                        )}
                                        {effectiveConfig.map((config) => (
                                            <option key={config.standard} value={config.standard}>
                                                {config.standard}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {group.standard && availableDivisions.length > 0 && (
                                    <div className="flex items-center gap-1.5 pb-2.5">
                                        <button
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => handleSelectAllDivisions(groupIndex, availableDivisions)}
                                            className="text-xs font-semibold text-[var(--color-primary)] hover:opacity-80 transition-opacity px-1 py-0.5 disabled:opacity-50"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-[var(--text-muted)] text-xs">|</span>
                                        <button
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => handleClearAllDivisions(groupIndex)}
                                            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-1 py-0.5 disabled:opacity-50"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                )}

                                {assignmentGroups.length > 1 && (
                                    <div className="pb-1">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStandardGroup(groupIndex)}
                                            disabled={disabled}
                                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
                                            title="Remove standard"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {group.standard ? (
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="block text-xs font-semibold text-[var(--text-secondary)]">
                                            Divisions:
                                        </span>
                                        <span className="text-[11px] text-[var(--text-muted)]">
                                            {group.divisions.length} of {availableDivisions.length} selected
                                        </span>
                                    </div>
                                    {availableDivisions.length === 0 ? (
                                        <p className="text-xs text-[var(--text-muted)] italic">No divisions configured for this standard.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2 pt-0.5">
                                            {availableDivisions.map((div) => {
                                                const isChecked = group.divisions.includes(div);
                                                const normKey = `${normalizeStd(group.standard)}-${String(div).trim().toUpperCase()}`;
                                                const conflictInfo = occupiedAssignmentsMap.get(normKey);
                                                const isOccupied = Boolean(conflictInfo);

                                                let containerStyle = "";
                                                if (isOccupied && isChecked) {
                                                    containerStyle = "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:border-rose-500/80 dark:text-rose-300 shadow-xs ring-1 ring-rose-500/30";
                                                } else if (isOccupied) {
                                                    containerStyle = "border-amber-300/90 bg-amber-50/50 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-200 hover:bg-amber-100/50";
                                                } else if (isChecked) {
                                                    containerStyle = "border-[var(--color-primary)]/50 bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-xs";
                                                } else {
                                                    containerStyle = "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]";
                                                }

                                                return (
                                                    <label
                                                        key={div}
                                                        className={`inline-flex flex-col items-start gap-0.5 px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer select-none transition-all ${containerStyle} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                disabled={disabled}
                                                                onChange={() => handleToggleDivision(groupIndex, div)}
                                                                className={`h-4 w-4 rounded ${
                                                                    isOccupied && isChecked
                                                                        ? "border-rose-400 text-rose-600 focus:ring-rose-500 dark:border-rose-500 accent-rose-600"
                                                                        : "border-[var(--border-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)]"
                                                                }`}
                                                            />
                                                            <span className="font-semibold">{div}</span>
                                                            {isOccupied && (
                                                                <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${isChecked ? "text-rose-500" : "text-amber-500"}`} />
                                                            )}
                                                        </div>
                                                        {isOccupied && (
                                                            <span className={`text-[10px] leading-tight ${isChecked ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-amber-700 dark:text-amber-400"}`}>
                                                                Assigned to {conflictInfo.teacherName}
                                                            </span>
                                                        )}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>

            {/* Selected Assignments Summary Chips */}
            {allSelectedAssignments.length > 0 && (
                <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                            Selected Assignments ({allSelectedAssignments.length})
                        </span>
                        {assignmentConflicts.length > 0 && (
                            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                {assignmentConflicts.length} conflict{assignmentConflicts.length > 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {allSelectedAssignments.map((assignment, idx) => {
                            const key = `${normalizeStd(assignment.standard)}-${String(assignment.division).trim().toUpperCase()}`;
                            const conflict = occupiedAssignmentsMap.get(key);
                            return (
                                <span
                                    key={`${assignment.standard}-${assignment.division}-${idx}`}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border shadow-xs transition-all ${
                                        conflict
                                            ? "bg-rose-100/90 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 border-rose-300 dark:border-rose-800"
                                            : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20"
                                    }`}
                                >
                                    {conflict && <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />}
                                    <span>{assignment.standard}-{assignment.division}</span>
                                    {conflict && (
                                        <span className="text-[10px] text-rose-700 dark:text-rose-300 font-normal">
                                            (Assigned to {conflict.teacherName})
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleRemoveAssignment(assignment.standard, assignment.division)}
                                        className={`p-0.5 rounded transition-opacity ${
                                            conflict
                                                ? "text-rose-600 hover:opacity-75"
                                                : "text-[var(--color-primary)] hover:opacity-75"
                                        }`}
                                        title={`Remove ${assignment.standard}-${assignment.division}`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Conflict Message Banner */}
            {assignmentConflicts.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>
                            {assignmentConflicts.length === 1
                                ? `Assignment conflict: ${assignmentConflicts[0].standard}-${assignmentConflicts[0].division} is already assigned to ${assignmentConflicts[0].teacherName}. Remove the conflicting assignment to continue.`
                                : `Assignment conflicts detected (${assignmentConflicts.length}):`}
                        </span>
                    </div>
                    {assignmentConflicts.length > 1 && (
                        <ul className="list-disc list-inside pl-5 space-y-0.5 font-normal">
                            {assignmentConflicts.map((c, i) => (
                                <li key={i}>
                                    <strong className="font-semibold">{c.standard}-{c.division}</strong> is already assigned to <strong className="font-semibold">{c.teacherName}</strong>.
                                </li>
                            ))}
                        </ul>
                    )}
                    <p className="text-[11px] text-rose-600 dark:text-rose-300">
                        Click ✕ on the conflicting assignment chip above or uncheck it to resolve the conflict.
                    </p>
                </div>
            )}

            {error && (
                <p role="alert" className="mt-1 text-sm font-medium text-rose-500">
                    {error}
                </p>
            )}
        </div>
    );
}

export default StandardDivisionPicker;
