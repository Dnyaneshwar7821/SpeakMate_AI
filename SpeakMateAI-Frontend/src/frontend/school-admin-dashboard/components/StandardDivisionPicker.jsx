import { useMemo, useEffect } from "react";
import Button from "@components/common/Button";
import { Plus, Trash2, X, AlertTriangle } from "lucide-react";
import { STANDARD_OPTIONS } from "@constants/standardOptions";

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
 * [{ standard: "8th Standard", divisions: ["A", "B"] }]
 */
export const loadInitialAssignmentGroups = (data, config = []) => {
    let initialGroups = [];
    const pool = [
        ...(Array.isArray(config) ? config : []),
        ...STANDARD_OPTIONS.map((s) => ({ standard: s }))
    ];
    const resolveCanonical = (rawStd) => {
        if (!rawStd) return "";
        const matched = pool.find(
            (c) => c.standard === rawStd || normalizeStd(c.standard) === normalizeStd(rawStd)
        );
        return matched ? matched.standard : rawStd;
    };

    if (data && Array.isArray(data.standardDivisions) && data.standardDivisions.length > 0) {
        const map = new Map();
        data.standardDivisions.forEach((sd) => {
            const std = resolveCanonical(sd.standard || "");
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
        const std = resolveCanonical(data.standard || "");
        initialGroups.push({
            standard: std,
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
 * Excludes the teacher currently being edited (self-exclusion by ID, email, or name).
 * Map key: `${normalizeStd(standard)}-${division.toUpperCase()}`
 */
export const buildOccupiedAssignmentsMap = (
    teachers = [],
    editingTeacherId = null,
    currentSchoolId = null,
    editingTeacherEmail = null,
    editingTeacherName = null,
    currentSchoolName = null,
    schoolsList = [],
    isSuperAdmin = false
) => {
    const map = new Map();
    if (!teachers || teachers.length === 0) {
        return map;
    }

    // Determine target school ID and Name
    let targetSchoolId = currentSchoolId != null ? String(currentSchoolId).trim() : null;
    let targetSchoolName = currentSchoolName ? String(currentSchoolName).trim().toLowerCase() : null;

    // Cross-resolve target school ID and Name if schoolsList is provided
    if (Array.isArray(schoolsList) && schoolsList.length > 0) {
        if (targetSchoolId && !targetSchoolName) {
            const found = schoolsList.find(s => String(s.id).trim() === targetSchoolId);
            if (found && found.name) {
                targetSchoolName = found.name.trim().toLowerCase();
            }
        }
        if (targetSchoolName && !targetSchoolId) {
            const found = schoolsList.find(s => (s.name || "").trim().toLowerCase() === targetSchoolName);
            if (found && found.id != null) {
                targetSchoolId = String(found.id).trim();
            }
        }
    }

    // If targetSchoolId is actually a name string (non-numeric)
    if (targetSchoolId && isNaN(Number(targetSchoolId)) && !targetSchoolName) {
        targetSchoolName = targetSchoolId.toLowerCase();
    }

    // In Super Admin context: if no school has been selected yet, no divisions are occupied
    if (isSuperAdmin && !targetSchoolId && !targetSchoolName) {
        return map;
    }

    teachers.forEach((t) => {
        // Skip inactive/deactivated teachers - they do not occupy active classrooms
        if (t.active === false || t.status === "inactive") {
            return;
        }

        // Self-exclusion: skip the teacher currently being edited (by ID, email, or full name)
        const isSameId =
            editingTeacherId != null &&
            (String(t.id) === String(editingTeacherId) ||
             String(t.teacherId) === String(editingTeacherId) ||
             String(t.userId) === String(editingTeacherId) ||
             String(t.dbId) === String(editingTeacherId));

        const isSameEmail =
            editingTeacherEmail &&
            t.email &&
            String(t.email).trim().toLowerCase() === String(editingTeacherEmail).trim().toLowerCase();

        const teacherFullName = (t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim()).toLowerCase();
        const isSameName =
            editingTeacherName &&
            teacherFullName &&
            teacherFullName === String(editingTeacherName).trim().toLowerCase();

        if (isSameId || isSameEmail || isSameName) {
            return;
        }

        // School isolation: If target school is specified or in Super Admin mode,
        // strictly only include teachers belonging to this exact school.
        if (targetSchoolId != null || targetSchoolName != null) {
            let matchesSchool = false;

            // 1. Check numeric/string schoolId
            if (targetSchoolId != null && t.schoolId != null) {
                if (String(t.schoolId).trim() === targetSchoolId) {
                    matchesSchool = true;
                }
            }

            // 2. Check schoolName
            if (!matchesSchool && targetSchoolName && t.schoolName) {
                if (t.schoolName.trim().toLowerCase() === targetSchoolName) {
                    matchesSchool = true;
                }
            }

            // 3. Check via schoolsList lookup
            if (!matchesSchool && Array.isArray(schoolsList) && schoolsList.length > 0) {
                if (targetSchoolId != null && t.schoolName) {
                    const foundSchool = schoolsList.find(s => String(s.id).trim() === targetSchoolId);
                    if (foundSchool && foundSchool.name && foundSchool.name.trim().toLowerCase() === t.schoolName.trim().toLowerCase()) {
                        matchesSchool = true;
                    }
                }
                if (!matchesSchool && targetSchoolName && t.schoolId != null) {
                    const foundSchool = schoolsList.find(s => (s.name || "").trim().toLowerCase() === targetSchoolName);
                    if (foundSchool && String(foundSchool.id).trim() === String(t.schoolId).trim()) {
                        matchesSchool = true;
                    }
                }
            }

            // If the teacher does not belong to the target school, ignore their assignments!
            if (!matchesSchool) {
                return;
            }
        }

        const teacherName = t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim() || t.email || "Another Teacher";

        const pairs = [];
        if (Array.isArray(t.standardDivisions) && t.standardDivisions.length > 0) {
            t.standardDivisions.forEach((sd) => {
                if (sd?.standard && sd?.division) {
                    pairs.push({ standard: sd.standard, division: sd.division });
                }
            });
        } else if (Array.isArray(t.standards) && t.standards.length > 0) {
            t.standards.forEach((s) => {
                if (typeof s === "string" && s.includes("-")) {
                    const [std, div] = s.split("-");
                    if (std && div) pairs.push({ standard: std, division: div });
                } else if (t.division) {
                    const divs = String(t.division).split(/[,/ ]+/).filter(Boolean);
                    divs.forEach((d) => pairs.push({ standard: s, division: d }));
                }
            });
        } else if (t.standard && t.division) {
            const stds = String(t.standard).split(/[,/ ]+/).filter(Boolean);
            const divs = String(t.division).split(/[,/ ]+/).filter(Boolean);
            stds.forEach((s) => {
                divs.forEach((d) => pairs.push({ standard: s, division: d }));
            });
        } else if (Array.isArray(t.classRooms) && t.classRooms.length > 0) {
            t.classRooms.forEach((cr) => {
                if (cr?.standard && cr?.division) {
                    pairs.push({ standard: cr.standard, division: cr.division });
                }
            });
        }

        pairs.forEach(({ standard, division }) => {
            const normStd = normalizeStd(standard);
            const normDiv = String(division).trim().toUpperCase();
            if (!normStd || !normDiv) return;
            const key = `${normStd}-${normDiv}`;
            if (!map.has(key)) {
                map.set(key, {
                    teacherId: t.id || t.teacherId,
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
    editingTeacherEmail = null,
    editingTeacherName = null,
    schoolId = null,
    schoolName = null,
    schools = [],
    isSuperAdmin = false,
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

    // Keep assignment group standards synchronized with canonical names in effectiveConfig
    useEffect(() => {
        let hasChanges = false;
        const nextGroups = assignmentGroups.map((g) => {
            if (!g.standard) return g;
            const matched = effectiveConfig.find(
                (c) => c.standard !== g.standard && normalizeStd(c.standard) === normalizeStd(g.standard)
            );
            if (matched) {
                hasChanges = true;
                return { ...g, standard: matched.standard };
            }
            return g;
        });
        if (hasChanges) {
            onChange?.(nextGroups, computeAllSelectedAssignments(nextGroups));
        }
    }, [effectiveConfig, assignmentGroups, onChange]);

    // In-memory conflict lookup for teacher assignments within the school
    const occupiedAssignmentsMap = useMemo(() => {
        return buildOccupiedAssignmentsMap(
            teachers,
            editingTeacherId,
            schoolId,
            editingTeacherEmail,
            editingTeacherName,
            schoolName,
            schools,
            isSuperAdmin
        );
    }, [teachers, editingTeacherId, schoolId, schoolName, schools, isSuperAdmin, editingTeacherEmail, editingTeacherName]);

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
        const normKey = `${normalizeStd(group.standard)}-${String(division).trim().toUpperCase()}`;
        const isOccupied = occupiedAssignmentsMap.has(normKey);

        // If division is occupied by another teacher and not currently selected, forbid selection
        if (isOccupied && !hasDiv) {
            return;
        }

        const newDivs = hasDiv
            ? group.divisions.filter((d) => d !== division)
            : [...group.divisions, division].sort();
        nextGroups[groupIndex] = { ...group, divisions: newDivs };
        onChange?.(nextGroups, computeAllSelectedAssignments(nextGroups));
    };

    const handleSelectAllDivisions = (groupIndex, availableDivisions, groupStandard) => {
        // Only ever select unassigned divisions so occupied divisions are never checked
        const unassignedDivisions = availableDivisions.filter((div) => {
            const normKey = `${normalizeStd(groupStandard)}-${String(div).trim().toUpperCase()}`;
            return !occupiedAssignmentsMap.has(normKey);
        });
        const nextGroups = [...assignmentGroups];
        nextGroups[groupIndex] = { ...nextGroups[groupIndex], divisions: [...unassignedDivisions] };
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

                    const selectValue = selectedConfig ? selectedConfig.standard : (group.standard || "");

                    const occupiedDivisions = availableDivisions
                        .map((div) => {
                            const normKey = `${normalizeStd(group.standard)}-${String(div).trim().toUpperCase()}`;
                            const conflict = occupiedAssignmentsMap.get(normKey);
                            return conflict ? { div, teacherName: conflict.teacherName } : null;
                        })
                        .filter(Boolean);
                    const availableDivisionsCount = availableDivisions.length - occupiedDivisions.length;

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
                                        value={selectValue}
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
                                            disabled={disabled || availableDivisionsCount === 0}
                                            onClick={() => handleSelectAllDivisions(groupIndex, availableDivisions, group.standard)}
                                            className="text-xs font-semibold text-[var(--color-primary)] hover:opacity-80 transition-opacity px-1 py-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={occupiedDivisions.length > 0 ? "Select only available (unassigned) divisions" : "Select all divisions"}
                                        >
                                            {occupiedDivisions.length > 0
                                                ? `Select Available (${availableDivisionsCount})`
                                                : "Select All"}
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
                                <div className="space-y-2.5">
                                    {/* Standard Assignment Overview Banner */}
                                    {availableDivisions.length > 0 && (
                                        occupiedDivisions.length > 0 ? (
                                            <div className="rounded-xl border border-amber-300/80 bg-amber-50/80 dark:border-amber-700/60 dark:bg-amber-950/30 p-2.5 text-xs space-y-1.5 transition-all">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                                                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                                        Assigned Divisions in {group.standard} (Non-clickable / Cannot be selected):
                                                    </span>
                                                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                                        {availableDivisionsCount} available
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                    {occupiedDivisions.map((od) => (
                                                        <span
                                                            key={od.div}
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100/90 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                                                        >
                                                            <strong>Div {od.div}:</strong> {od.teacherName} (Assigned)
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/60 dark:bg-emerald-950/20 px-3 py-1.5 text-xs flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                                <span>All divisions in {group.standard} are currently available.</span>
                                            </div>
                                        )
                                    )}

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
                                                const isNonClickable = disabled || (isOccupied && !isChecked);

                                                let containerStyle = "";
                                                if (isOccupied && isChecked) {
                                                    containerStyle = "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:border-rose-500/80 dark:text-rose-300 shadow-xs ring-1 ring-rose-500/30 cursor-pointer";
                                                } else if (isOccupied) {
                                                    containerStyle = "border-slate-200 bg-slate-100/90 text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-500 cursor-not-allowed pointer-events-none opacity-60";
                                                } else if (isChecked) {
                                                    containerStyle = "border-[var(--color-primary)]/50 bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-xs cursor-pointer";
                                                } else {
                                                    containerStyle = "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer";
                                                }

                                                return (
                                                    <label
                                                        key={div}
                                                        onClick={(e) => {
                                                            if (isNonClickable) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        className={`inline-flex flex-col items-start gap-1 px-3 py-2 rounded-xl border text-sm font-medium select-none transition-all ${containerStyle} ${isNonClickable ? "cursor-not-allowed opacity-60 pointer-events-none" : ""}`}
                                                        title={isOccupied && !isChecked ? `Already assigned to ${conflictInfo.teacherName} (Cannot be selected)` : undefined}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                disabled={isNonClickable}
                                                                onChange={() => handleToggleDivision(groupIndex, div)}
                                                                className={`h-4 w-4 rounded ${
                                                                    isOccupied && isChecked
                                                                        ? "border-rose-400 text-rose-600 focus:ring-rose-500 dark:border-rose-500 accent-rose-600 cursor-pointer"
                                                                        : isOccupied
                                                                        ? "border-slate-300 text-slate-400 cursor-not-allowed opacity-50"
                                                                        : "border-[var(--border-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)] cursor-pointer"
                                                                }`}
                                                            />
                                                            <span className={`font-bold text-sm ${isOccupied && !isChecked ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>{div}</span>
                                                            {isOccupied && (
                                                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold" title="Already assigned - locked">
                                                                    🔒
                                                                </span>
                                                            )}
                                                        </div>
                                                        {isOccupied ? (
                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] leading-tight font-medium ${
                                                                isChecked
                                                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold"
                                                                    : "bg-amber-100/90 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                                                            }`}>
                                                                {isChecked ? `Assigned to ${conflictInfo.teacherName}` : `Assigned: ${conflictInfo.teacherName} (Unavailable)`}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] leading-tight font-medium text-emerald-600 dark:text-emerald-400">
                                                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                Available
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
