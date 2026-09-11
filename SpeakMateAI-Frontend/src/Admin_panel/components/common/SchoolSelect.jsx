import { useState, useRef, useEffect, useMemo } from "react";
import { School, ChevronDown, Search, Check, X } from "lucide-react";

/**
 * Modern searchable & scroll-constrained School Select Dropdown.
 * Prevents native select overflow and screen clipping when school counts increase.
 */
export function SchoolSelect({
    value = "",
    onChange,
    onSelect,
    schools = [],
    placeholder = "Select a school",
    disabled = false,
    className = "",
    allowAll = false,
    allLabel = "All Schools",
    id,
    name = "schoolName",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    const [dropUp, setDropUp] = useState(false);

    // Calculate whether dropdown should flip upwards if constrained at bottom
    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            if (spaceBelow < 280 && spaceAbove > spaceBelow) {
                setDropUp(true);
            } else {
                setDropUp(false);
            }
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Auto-focus search box on open
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Normalize schools list
    const schoolList = useMemo(() => {
        const list = (schools || []).map((s) => (typeof s === "string" ? { id: s, name: s } : s));
        if (allowAll) {
            return [{ id: "ALL", name: allLabel }, ...list];
        }
        return list;
    }, [schools, allowAll, allLabel]);

    // Filter schools based on search
    const filteredSchools = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return schoolList;
        return schoolList.filter((s) => (s.name || "").toLowerCase().includes(term));
    }, [schoolList, searchTerm]);

    const selectedSchool = useMemo(() => {
        return schoolList.find((s) => s.name === value || s.id === value);
    }, [schoolList, value]);

    const handleSelect = (school) => {
        const selectedValue = school.name;
        onChange?.({
            target: {
                name,
                value: selectedValue,
            },
        });
        onSelect?.(school);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleToggle = () => {
        if (disabled) return;
        setIsOpen((prev) => !prev);
    };

    return (
        <div ref={dropdownRef} className={`relative w-full ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                id={id}
                onClick={handleToggle}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`flex h-11 w-full items-center justify-between gap-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-left text-sm text-[var(--text-primary)] transition-all outline-none ${
                    isOpen
                        ? "border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20 shadow-sm"
                        : "hover:border-[var(--color-primary)]/50"
                } ${disabled ? "cursor-not-allowed opacity-60 bg-[var(--bg-subtle)]" : "cursor-pointer"}`}
            >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <School className="h-3.5 w-3.5" />
                    </span>
                    <span className={`truncate font-medium ${value ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                        {selectedSchool ? selectedSchool.name : (value || placeholder)}
                    </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-[var(--text-muted)]">
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-[var(--color-primary)]" : ""}`} />
                </div>
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div
                    className={`absolute left-0 right-0 z-[100] overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150 ${
                        dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
                    }`}
                    style={{ backdropFilter: "blur(12px)" }}
                >
                    {/* Search Input Box */}
                    <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/70">
                        <div className="relative flex items-center">
                            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && filteredSchools.length > 0) {
                                        e.preventDefault();
                                        handleSelect(filteredSchools[0]);
                                    }
                                }}
                                placeholder="Search schools..."
                                className="h-8 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] pl-8 pr-7 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                        <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-[var(--text-muted)]">
                            <span>Available Schools</span>
                            <span className="font-semibold text-[var(--text-secondary)]">{filteredSchools.length} {filteredSchools.length === 1 ? 'school' : 'schools'}</span>
                        </div>
                    </div>

                    {/* Scrollable School List (Capped height to prevent overflowing screen) */}
                    <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5 thin-scrollbar" role="listbox">
                        {filteredSchools.length === 0 ? (
                            <div className="py-6 px-3 text-center text-xs text-[var(--text-muted)]">
                                <School className="mx-auto mb-1.5 h-5 w-5 opacity-40" />
                                <p>No schools found matching &ldquo;{searchTerm}&rdquo;</p>
                            </div>
                        ) : (
                            filteredSchools.map((school) => {
                                const isSelected = value === school.name || (school.id && value === school.id);
                                return (
                                    <button
                                        key={school.id || school.name}
                                        type="button"
                                        onClick={() => handleSelect(school)}
                                        className={`group flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-all ${
                                            isSelected
                                                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold"
                                                : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                                        }`}
                                        role="option"
                                        aria-selected={isSelected}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <span
                                                className={`grid h-5 w-5 shrink-0 place-items-center rounded-md text-[10px] font-bold ${
                                                    isSelected
                                                        ? "bg-[var(--color-primary)] text-white"
                                                        : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)]"
                                                }`}
                                            >
                                                {school.name.slice(0, 1).toUpperCase()}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate">{school.name}</p>
                                                {school.code && (
                                                    <p className="text-[10px] text-[var(--text-muted)] truncate">{school.code}</p>
                                                )}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SchoolSelect;
