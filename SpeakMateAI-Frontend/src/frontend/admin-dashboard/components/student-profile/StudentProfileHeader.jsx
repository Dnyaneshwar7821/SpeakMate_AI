import React from "react";
import {
  User,
  Mail,
  School,
  GraduationCap,
  Calendar,
  Target,
  Hash,
  Award,
  ShieldCheck
} from "lucide-react";

export function StudentProfileHeader({ student }) {
  if (!student) return null;

  const isSchoolStudent = Boolean(
    student.schoolId ||
    student.schoolName ||
    student.standard ||
    student.rollNumber
  );

  const initials = (student.fullName || student.firstName || student.email || "S")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const formattedJoinDate = student.registeredAt
    ? new Date(student.registeredAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently Joined";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Avatar & Primary Info */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-xl font-black text-white shadow-md ring-4 ring-white/10">
            {initials}
            <span
              className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 ${
                student.active ? "bg-emerald-400" : "bg-slate-400"
              }`}
              title={student.active ? "Active Account" : "Inactive Account"}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {student.fullName || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student Profile"}
              </h2>

              {/* Learner Type Badge */}
              {isSchoolStudent ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-300 border border-blue-500/30">
                  <School size={12} />
                  School Student
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                  <User size={12} />
                  Direct Learner
                </span>
              )}

              {/* Status Badge */}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  student.active
                    ? "bg-emerald-400/15 text-emerald-300 border border-emerald-400/30"
                    : "bg-slate-500/20 text-slate-400 border border-slate-600/30"
                }`}
              >
                {student.accountStatus || (student.active ? "ACTIVE" : "INACTIVE")}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                {student.email}
              </span>
              {student.studentId && (
                <span className="inline-flex items-center gap-1.5 font-mono text-indigo-300">
                  <Hash size={13} />
                  ID: {student.studentId}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <Calendar size={13} />
                Joined {formattedJoinDate}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Goals & Level Badges */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          {student.englishLevel && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">English Level</p>
              <p className="text-sm font-black text-indigo-300 flex items-center gap-1 mt-0.5">
                <Award size={14} />
                {student.englishLevel}
              </p>
            </div>
          )}

          {student.learningGoal && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 backdrop-blur-sm max-w-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Learning Goal</p>
              <p className="text-sm font-bold text-slate-200 truncate flex items-center gap-1 mt-0.5" title={student.learningGoal}>
                <Target size={14} className="text-emerald-400 shrink-0" />
                {student.learningGoal}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* School Context Bar (Only shown for School Students) */}
      {isSchoolStudent && (
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {student.schoolName && (
            <div className="flex items-center gap-2 text-slate-300">
              <School size={14} className="text-indigo-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">School</span>
                <span className="font-bold text-white truncate" title={student.schoolName}>{student.schoolName}</span>
              </div>
            </div>
          )}

          {(student.standard || student.division) && (
            <div className="flex items-center gap-2 text-slate-300">
              <GraduationCap size={14} className="text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Class / Division</span>
                <span className="font-bold text-white">
                  {student.standard ? `Grade ${student.standard}` : ""}
                  {student.division ? ` - ${student.division}` : ""}
                </span>
              </div>
            </div>
          )}

          {student.rollNumber && (
            <div className="flex items-center gap-2 text-slate-300">
              <Hash size={14} className="text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Roll Number</span>
                <span className="font-bold text-white">{student.rollNumber}</span>
              </div>
            </div>
          )}

          {(student.teacherName || student.assignedTeacher) && (
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Assigned Teacher</span>
                <span className="font-bold text-white truncate" title={student.teacherName || student.assignedTeacher}>
                  {student.teacherName || student.assignedTeacher}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentProfileHeader;
