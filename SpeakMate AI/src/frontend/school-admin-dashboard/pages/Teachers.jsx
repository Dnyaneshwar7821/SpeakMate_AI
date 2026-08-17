import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Briefcase, Search, Download } from "lucide-react";

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
        getStudentsForTeacher 
    } = useTeachers();
    
    const [selectedTeacher, setSelectedTeacher] = useState(null); // For viewing assigned students
    const [formModal, setFormModal] = useState({ isOpen: false, mode: "add", teacher: null });

    const openAddModal = () => setFormModal({ isOpen: true, mode: "add", teacher: null });

    const handleFormSubmit = (data) => {
        if (formModal.mode === "edit") {
            updateTeacher(formModal.teacher.id, data);
        } else {
            addTeacher(data);
        }
        setFormModal({ isOpen: false, mode: "add", teacher: null });
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <Briefcase className="h-5 w-5" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                            Teachers
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)]">
                            {totalTeachers} {totalTeachers === 1 ? 'teacher' : 'teachers'} registered
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" className="!h-11 shrink-0">
                        <Download className="mr-1.5 h-4 w-4" />
                        Export
                    </Button>
                    <Button onClick={openAddModal} className="!h-11 shrink-0">
                        <Plus className="mr-1.5 h-4 w-4" />
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
                    <div className="w-full sm:w-auto sm:max-w-[16rem]">
                        <Input
                            placeholder="Search teachers…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                }
            >
                <TeachersTable 
                    teachers={teachers} 
                    getStudentCount={(name) => getStudentsForTeacher(name).length}
                    onRowClick={setSelectedTeacher}
                    onEdit={(t) => setFormModal({ isOpen: true, mode: "edit", teacher: t })}
                    onDelete={(t) => { if (confirm(`Delete ${t.name}?`)) deleteTeacher(t.id); }} 
                />
            </SectionCard>

            <TeacherFormModal
                isOpen={formModal.isOpen}
                mode={formModal.mode}
                initialData={formModal.teacher}
                onClose={() => setFormModal({ isOpen: false, mode: "add", teacher: null })}
                onSubmit={handleFormSubmit}
            />

            <TeacherStudentsModal 
                isOpen={Boolean(selectedTeacher)} 
                teacher={selectedTeacher} 
                students={selectedTeacher ? getStudentsForTeacher(selectedTeacher.name) : []}
                onClose={() => setSelectedTeacher(null)} 
            />
        </div>
    );
}

export default Teachers;
