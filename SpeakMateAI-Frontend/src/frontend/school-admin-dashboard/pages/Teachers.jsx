import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Briefcase, Search, Download, Filter, ChevronDown } from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";

import SectionCard from "@school-admin/components/SectionCard";
import TeachersTable from "@school-admin/components/TeachersTable";
import TeacherFormModal from "@school-admin/components/TeacherFormModal";
import TeacherStudentsModal from "@school-admin/components/TeacherStudentsModal";
import { useTeachers } from "@school-admin/hooks/useSchoolData";

export function Teachers() {
    const {
        teachers,
        totalTeachers,
        searchTerm,
        setSearchTerm,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        getStudentsForTeacher,
        isLoading
    } = useTeachers();

    const [selectedTeacher, setSelectedTeacher] = useState(null); // For viewing assigned students
    const [formModal, setFormModal] = useState({ isOpen: false, mode: "add", teacher: null });
    
    // Filters state
    const [filters, setFilters] = useState({
        department: "All",
        standard: "All",
        division: "All",
        status: "All"
    });

    const activeFilterCount = Object.values(filters).filter(v => v !== "All").length;

    // Derived dynamic options
    const departmentOptions = (() => {
        const set = new Set();
        (teachers || []).forEach(t => { if (t.department) set.add(t.department); });
        return ["All", ...Array.from(set).sort()];
    })();

    const standardOptions = (() => {
        const set = new Set();
        (teachers || []).forEach(t => {
            if (Array.isArray(t.standardDivisions)) {
                t.standardDivisions.forEach(sd => { if (sd.standard) set.add(sd.standard); });
            } else if (t.standard) {
                set.add(t.standard);
            }
        });
        return ["All", ...Array.from(set).sort((a, b) => String(a).localeCompare(String(b), undefined, {numeric: true}))];
    })();
    
    const divisionOptions = (() => {
        const set = new Set();
        (teachers || []).forEach(t => {
            if (Array.isArray(t.standardDivisions)) {
                t.standardDivisions.forEach(sd => { if (sd.division) set.add(sd.division); });
            } else if (t.division) {
                set.add(t.division);
            }
        });
        return ["All", ...Array.from(set).sort()];
    })();

    // Apply Filters
    const filteredTeachers = (teachers || []).filter(t => {
        const matchesDept = filters.department === "All" || t.department === filters.department;
        const matchesStatus = filters.status === "All" || (filters.status === "Active" ? t.active : !t.active);
        
        let matchesStandard = filters.standard === "All";
        let matchesDivision = filters.division === "All";
        
        if (!matchesStandard || !matchesDivision) {
            let teacherAssignments = [];
            if (Array.isArray(t.standardDivisions)) {
                teacherAssignments = t.standardDivisions;
            } else if (t.standard || t.division) {
                teacherAssignments = [{ standard: t.standard, division: t.division }];
            }
            
            if (!matchesStandard && matchesDivision) {
                matchesStandard = teacherAssignments.some(sd => sd.standard === filters.standard);
            } else if (matchesStandard && !matchesDivision) {
                matchesDivision = teacherAssignments.some(sd => sd.division === filters.division);
            } else {
                // If BOTH are selected, they must match the EXACT same pair (e.g. 8 and A)
                const exactMatch = teacherAssignments.some(sd => sd.standard === filters.standard && sd.division === filters.division);
                matchesStandard = exactMatch;
                matchesDivision = exactMatch;
            }
        }
        
        return matchesDept && matchesStatus && matchesStandard && matchesDivision;
    });

    // Toast state
    const [toasts, setToasts] = useState([]);
    const triggerToast = (message, type = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    const openAddModal = () => setFormModal({ isOpen: true, mode: "add", teacher: null });

    const handleToggleStatus = async (teacher) => {
        try {
            const isActive = teacher.status === "active" || teacher.active;
            await updateTeacher(teacher.id, { ...teacher, active: !isActive });
            triggerToast(`Teacher ${isActive ? "deactivated" : "activated"} successfully`, "success");
        } catch (error) {
            triggerToast(error.message || "Failed to update teacher status", "error");
        }
    };

    const handleFormSubmit = async (data) => {
        try {
            if (formModal.mode === "edit") {
                await updateTeacher(formModal.teacher.id, data);
                triggerToast("Teacher updated successfully", "success");
            } else {
                await addTeacher(data);
                triggerToast("Teacher added successfully", "success");
            }
            setFormModal({ isOpen: false, mode: "add", teacher: null });
        } catch (error) {
            triggerToast(error.message || "Unable to update teacher. Please try again.", "error");
            throw error; // Re-throw so modal can catch and handle its own state if needed
        }
    };

    const handleExport = () => {
        if (!teachers || !teachers.length) {
            alert("No teacher data available to export.");
            return;
        }
        const sortedTeachers = [...teachers].sort((a, b) => {
            const numA = a?.id !== null && a?.id !== undefined && a?.id !== "" && !isNaN(Number(a.id)) ? Number(a.id) : Infinity;
            const numB = b?.id !== null && b?.id !== undefined && b?.id !== "" && !isNaN(Number(b.id)) ? Number(b.id) : Infinity;
            return numA - numB;
        });
        const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "Standard", "Department", "Division", "Experience", "Qualification", "Status"];
        const csvLines = [headers.join(",")];
        for (const t of sortedTeachers) {
            const line = [
                t.id || "",
                `"${(t.firstName || "").replace(/"/g, '""')}"`,
                `"${(t.lastName || "").replace(/"/g, '""')}"`,
                `"${(t.email || "").replace(/"/g, '""')}"`,
                `"${(t.phone || "").replace(/"/g, '""')}"`,
                `"${(t.standard || "").replace(/"/g, '""')}"`,
                `"${(t.department || "").replace(/"/g, '""')}"`,
                `"${(t.division || "").replace(/"/g, '""')}"`,
                `"${(t.experience || "").replace(/"/g, '""')}"`,
                `"${(t.qualification || "").replace(/"/g, '""')}"`,
                `"${t.active ? "Active" : "Inactive"}"`
            ];
            csvLines.push(line.join(","));
        }
        const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "teachers_export.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        <Briefcase className="h-5 w-5" />
                    </span>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                            Teachers
                        </h1>
                        <p className="text-[13px] text-[var(--text-secondary)]">
                            {filteredTeachers.length} {filteredTeachers.length === 1 ? 'teacher' : 'teachers'} registered
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={handleExport} className="!h-10 shrink-0 font-medium hidden sm:flex">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button onClick={openAddModal} className="!h-10 shrink-0 font-medium">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Teacher
                    </Button>
                </div>
            </motion.div>

            <SectionCard
                title="All Teachers"
                subtitle="Manage teachers and view their assigned students"
                delay={0.05}
                bodyClassName="p-0"
                action={
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                            <Input
                                placeholder="Search teachers…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="!h-10 !pl-9 text-sm"
                            />
                        </div>
                    </div>
                }
            >
                <TeachersTable
                    teachers={filteredTeachers}
                    isLoading={isLoading}
                    getStudentCount={(teacher) => getStudentsForTeacher(teacher).length}
                    onRowClick={setSelectedTeacher}
                    onEdit={(teacher) => setFormModal({ isOpen: true, mode: "edit", teacher })}
                    onDelete={(t) => { if (confirm(`Are you sure you want to delete ${t.name}?`)) deleteTeacher(t.id); }}
                    onToggleStatus={handleToggleStatus}
                    filters={filters}
                    setFilters={setFilters}
                    departmentOptions={departmentOptions}
                    standardOptions={standardOptions}
                    divisionOptions={divisionOptions}
                />
            </SectionCard>

            <TeacherFormModal
                isOpen={formModal.isOpen}
                mode={formModal.mode}
                initialData={formModal.teacher}
                teachers={teachers}
                onClose={() => setFormModal({ isOpen: false, mode: "add", teacher: null })}
                onSubmit={handleFormSubmit}
            />

            <TeacherStudentsModal
                isOpen={Boolean(selectedTeacher)}
                teacher={selectedTeacher}
                students={selectedTeacher ? getStudentsForTeacher(selectedTeacher) : []}
                onClose={() => setSelectedTeacher(null)}
            />

            {/* Toasts */}
            <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ring-1 ${
                            t.type === "success" 
                                ? "bg-emerald-50 text-emerald-600 shadow-emerald-500/10 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30" 
                                : "bg-rose-50 text-rose-600 shadow-rose-500/10 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30"
                        }`}
                    >
                        <div className={`h-2 w-2 rounded-full ${t.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {t.message}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Teachers;
