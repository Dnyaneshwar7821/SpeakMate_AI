import { useState, useEffect } from "react";
import { Plus, Minus, X, Undo } from "lucide-react";
import Button from "@components/common/Button";
import Input from "@components/common/Input";

export default function AcademicStructureBuilder({ value = [], onChange, disabled = false }) {
    const [quickStandards, setQuickStandards] = useState("");
    const [quickDivisions, setQuickDivisions] = useState("A, B, C");
    const [customizedStandards, setCustomizedStandards] = useState(new Set());
    const [recentlyDeleted, setRecentlyDeleted] = useState(null);

    // When value changes from outside (e.g. initialization or reset), sync highest standard input
    useEffect(() => {
        if (value.length === 0 && quickStandards !== "") {
            setQuickStandards("");
            setCustomizedStandards(new Set());
        }
    }, [value.length]);

    const parseDivisions = (divStr) => {
        return [...new Set(divStr.split(",").map(d => d.trim()).filter(d => d.length > 0))];
    };

    const handleHighestStandardChange = (e) => {
        const newVal = e.target.value;
        setQuickStandards(newVal);
        
        const count = parseInt(newVal, 10);
        if (isNaN(count) || count < 0 || count > 20) return;
        
        let nextValue = [...value];
        const currentLength = nextValue.length;
        
        // Clear undo state on structural changes
        setRecentlyDeleted(null);
        
        if (count > currentLength) {
            // Add rows
            const defaultDivs = parseDivisions(quickDivisions);
            // We need to figure out what standard numbers to add.
            // If they removed one in the middle, the highest standard might be larger than length.
            // So we find the current max standard number, and increment from there.
            let maxNumeric = nextValue.reduce((max, s) => {
                const num = parseInt(s.standard, 10);
                return !isNaN(num) && num > max ? num : max;
            }, 0);
            
            for (let i = 0; i < (count - currentLength); i++) {
                maxNumeric++;
                nextValue.push({ standard: String(maxNumeric), divisions: defaultDivs });
            }
            onChange(nextValue);
        } else if (count < currentLength) {
            // Remove rows from bottom
            nextValue = nextValue.slice(0, count);
            onChange(nextValue);
        }
    };

    const handleDefaultDivisionsChange = (e) => {
        // Strip everything except letters, uppercase them, and auto-format with commas
        const rawStr = e.target.value.toUpperCase();
        const lettersOnly = rawStr.replace(/[^A-Z]/g, '');
        
        // Remove duplicates to ensure clean typing (e.g. typing AAB becomes A, B)
        const uniqueLetters = [...new Set(lettersOnly.split(''))];
        const formattedStr = uniqueLetters.join(', ');
        
        setQuickDivisions(formattedStr);
        
        const newDefaultDivs = parseDivisions(formattedStr);
        
        // Update any uncustomized standards
        let hasChanges = false;
        const nextValue = value.map(item => {
            if (!customizedStandards.has(item.standard)) {
                hasChanges = true;
                return { ...item, divisions: newDefaultDivs };
            }
            return item;
        });
        
        if (hasChanges) {
            onChange(nextValue);
        }
    };

    const markCustomized = (standard) => {
        setCustomizedStandards(prev => {
            const next = new Set(prev);
            next.add(standard);
            return next;
        });
    };

    const handleIncrementDivision = (index) => {
        const next = [...value];
        const currentDivs = next[index].divisions || [];
        
        // Find the next available uppercase letter from A-Z
        let nextLetter = "A";
        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i);
            if (!currentDivs.includes(char)) {
                nextLetter = char;
                break;
            }
        }
        
        next[index] = { ...next[index], divisions: [...currentDivs, nextLetter] };
        markCustomized(next[index].standard);
        onChange(next);
    };

    const handleDecrementDivision = (index) => {
        const next = [...value];
        const currentDivs = next[index].divisions || [];
        if (currentDivs.length === 0) return;
        
        next[index] = { ...next[index], divisions: currentDivs.slice(0, -1) };
        markCustomized(next[index].standard);
        onChange(next);
    };

    const handleRemoveDivision = (stdIndex, divName) => {
        const next = [...value];
        next[stdIndex] = {
            ...next[stdIndex],
            divisions: next[stdIndex].divisions.filter(d => d !== divName)
        };
        markCustomized(next[stdIndex].standard);
        onChange(next);
    };

    const handleRemoveStandard = (stdIndex) => {
        const next = [...value];
        const removedItem = next.splice(stdIndex, 1)[0];
        onChange(next);
        
        // Save for undo
        setRecentlyDeleted({ item: removedItem, originalIndex: stdIndex });
        
        // Also sync the quickStandards input to match the new length
        setQuickStandards(String(next.length));
    };

    const handleUndoDelete = () => {
        if (!recentlyDeleted) return;
        
        const next = [...value];
        // Insert back at original index, or at end if index is somehow out of bounds
        const targetIndex = Math.min(recentlyDeleted.originalIndex, next.length);
        next.splice(targetIndex, 0, recentlyDeleted.item);
        onChange(next);
        
        // Restore customized flag if it was customized
        if (customizedStandards.has(recentlyDeleted.item.standard)) {
            markCustomized(recentlyDeleted.item.standard);
        }
        
        // Sync quick standards count
        setQuickStandards(String(next.length));
        
        // Clear undo state
        setRecentlyDeleted(null);
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Live Controls */}
            <div className="flex flex-col gap-3 sm:flex-row rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-4">
                <div className="flex-1">
                    <Input
                        label="Highest Standard (Auto-generates rows)"
                        type="number"
                        min="1"
                        max="20"
                        placeholder="e.g. 10"
                        value={quickStandards}
                        onChange={handleHighestStandardChange}
                        disabled={disabled}
                    />
                </div>
                <div className="flex-1">
                    <Input
                        label="Default Divisions (Auto-formats)"
                        placeholder="e.g. ABC"
                        value={quickDivisions}
                        onChange={handleDefaultDivisionsChange}
                        disabled={disabled}
                    />
                </div>
            </div>

            {/* Generated Structure List (2-column layout to fill blank space) */}
            {value.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {value.map((item, index) => (
                        <div 
                            key={item.standard} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5 shadow-xs hover:border-[var(--border-strong)] transition-all"
                        >
                            {/* Standard Header & Remove */}
                            <div className="flex sm:flex-col items-center sm:items-start justify-between min-w-[95px] pb-2 sm:pb-0 sm:pr-3 border-b sm:border-b-0 sm:border-r border-[var(--border-subtle)]">
                                <span className="font-semibold text-sm text-[var(--text-primary)] whitespace-nowrap">
                                    {item.standard}{isNaN(item.standard) ? "" : " Standard"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveStandard(index)}
                                    disabled={disabled}
                                    className="text-left text-xs font-medium text-rose-500 hover:text-rose-600 mt-0.5 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                            
                            {/* Divisions Badges & Increment/Decrement Stepper */}
                            <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {item.divisions.length === 0 ? (
                                        <span className="text-xs text-[var(--text-secondary)] italic">No divisions</span>
                                    ) : (
                                        item.divisions.map(div => (
                                            <div 
                                                key={div} 
                                                className="flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50/90 pl-2.5 pr-1 py-0.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400"
                                            >
                                                <span>{div}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDivision(index, div)}
                                                    disabled={disabled}
                                                    className="rounded-full p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
                                                    title={`Remove ${div}`}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Stepper (+ / -) to increase or decrease division */}
                                <div className="inline-flex items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] p-0.5 shadow-xs shrink-0 ml-auto">
                                    <button
                                        type="button"
                                        onClick={() => handleDecrementDivision(index)}
                                        disabled={disabled || item.divisions.length === 0}
                                        title="Decrease division (-)"
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-rose-600 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="w-px h-3.5 bg-[var(--border-default)] mx-0.5" />
                                    <button
                                        type="button"
                                        onClick={() => handleIncrementDivision(index)}
                                        disabled={disabled || item.divisions.length >= 26}
                                        title="Increase division (+)"
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-indigo-600 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {recentlyDeleted && (
                        <div className="col-span-1 md:col-span-2 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                            <span className="text-sm font-medium text-amber-800 dark:text-amber-400">
                                <strong>Standard {recentlyDeleted.item.standard}</strong> was removed.
                            </span>
                            <button
                                type="button"
                                onClick={handleUndoDelete}
                                className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
                            >
                                <Undo className="h-4 w-4" />
                                Undo
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)]">
                    <p className="text-sm font-medium text-[var(--text-primary)]">No structure configured</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Type a number in "Highest Standard" above to begin.</p>
                </div>
            )}
        </div>
    );
}
