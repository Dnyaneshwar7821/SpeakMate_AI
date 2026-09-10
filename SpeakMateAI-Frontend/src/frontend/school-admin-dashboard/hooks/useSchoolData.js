import { useState, useMemo, useEffect, useCallback } from "react";
import { schoolAdminDataApi } from "@services/admin/schoolAdminDataApi";
import { normalizeIndianMobile } from "@utils/phoneValidator";

const generateHistory = (baseScore) => {
  if (!baseScore) return [];
  return [
    { name: 'W1', score: Math.max(0, baseScore - 15) },
    { name: 'W2', score: Math.max(0, baseScore - 5) },
    { name: 'W3', score: Math.min(100, baseScore + 2) },
    { name: 'W4', score: baseScore }
  ];
};

const generateSkills = (base) => {
  if (!base) return [];
  return [
    { subject: 'Grammar', score: Math.max(0, Math.min(100, base + Math.floor(Math.random() * 15 - 5))) },
    { subject: 'Vocabulary', score: Math.max(0, Math.min(100, base + Math.floor(Math.random() * 15 - 5))) },
    { subject: 'Speaking', score: Math.max(0, Math.min(100, base + Math.floor(Math.random() * 20 - 10))) },
    { subject: 'Listening', score: Math.max(0, Math.min(100, base + Math.floor(Math.random() * 10 - 5))) },
    { subject: 'Reading', score: Math.max(0, Math.min(100, base + Math.floor(Math.random() * 15 - 5))) },
  ];
};

const generateActivity = (hasData) => {
  if (!hasData) return [];
  return [
    { day: 'Mon', hours: (Math.random() * 2 + 0.5).toFixed(1) },
    { day: 'Tue', hours: (Math.random() * 2 + 0.5).toFixed(1) },
    { day: 'Wed', hours: (Math.random() * 2 + 0.5).toFixed(1) },
    { day: 'Thu', hours: (Math.random() * 2 + 0.5).toFixed(1) },
    { day: 'Fri', hours: (Math.random() * 2 + 0.5).toFixed(1) },
  ];
};

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [standard, setStandard] = useState("All Standards");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadStudents = useCallback(async (currentStandard, currentSearch) => {
    setIsLoading(true);
    try {
      const params = {};
      if (currentStandard && currentStandard !== "All Standards") {
        params.standard = currentStandard;
      }
      if (currentSearch && currentSearch.trim()) {
        params.name = currentSearch.trim();
      }
      const data = await schoolAdminDataApi.getAllStudents(params);
      const mapped = data.map((s) => {
        const avgScore = s.averageScore !== undefined ? s.averageScore : 0;
        return {
          id: s.id || s.studentId,
          dbId: s.id,
          studentId: s.studentId,
          name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Unknown Student",
          email: s.email,
          standard: s.standard || 10,
          rollNo: s.rollNumber || (s.studentId ? `RN-${s.studentId}` : `RN-${s.id}`),
          division: s.division || "A",
          parentName: s.parentName || "Parent",
          parentPhone: s.parentPhone || "",
          phone: s.phone || "",
          active: s.active !== undefined ? Boolean(s.active) : (s.status ? String(s.status).toLowerCase() === "active" : true),
          status: (s.active !== undefined ? Boolean(s.active) : (s.status ? String(s.status).toLowerCase() === "active" : true)) ? "active" : "inactive",
          joinedAt: s.createdAt ? s.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
          teacherId: s.teacherId || null,
          assignedTeacher: s.teacherName || "Unassigned",
          progress: {
            level: s.level || 1,
            xp: s.xp || 0,
            nextLevelXp: (s.level || 1) * 1000,
            batch: s.xp > 5000 ? "Platinum Achiever" : (s.xp > 2000 ? "Gold Scholar" : "Bronze Learner"),
            completedLessons: s.completedLessons || 0,
            totalLessons: s.totalLessons || 30,
            percentage: s.totalLessons ? Math.round((s.completedLessons / s.totalLessons) * 100) : 0,
            quizzes: s.completedQuizzes || 0,
            averageScore: avgScore,
            lastActive: s.lastActive ? s.lastActive.slice(0, 10) : new Date().toISOString().slice(0, 10),
            history: generateHistory(avgScore),
            skills: generateSkills(avgScore),
            weeklyActivity: generateActivity(avgScore > 0)
          }
        };
      });
      setStudents(mapped);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshStudents = useCallback(() => {
    loadStudents(standard, searchTerm);
  }, [loadStudents, standard, searchTerm]);

  // Debounce search/filter requests to reduce API load
  useEffect(() => {
    const handler = setTimeout(() => {
      loadStudents(standard, searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [standard, searchTerm, loadStudents]);

  // Auto-refresh when real-time school data update notification occurs
  useEffect(() => {
    const handleUpdate = () => {
      refreshStudents();
    };
    window.addEventListener("school_data_updated", handleUpdate);
    return () => window.removeEventListener("school_data_updated", handleUpdate);
  }, [refreshStudents]);

  const addStudent = async (data) => {
    const [firstName = "", ...lastNameParts] = (data.name || "").split(" ");
    const lastName = lastNameParts.join(" ") || "Student";
    const isActive = data.active !== undefined
      ? Boolean(data.active)
      : (data.status ? String(data.status).toLowerCase() === "active" : true);
    const payload = {
      firstName,
      lastName,
      email: data.email,
      rollNumber: data.rollNo || `RN-${Date.now()}`,
      standard: String(data.standard || 10),
      division: data.division || "A",
      teacherId: data.teacherId ? Number(data.teacherId) : null,
      parentName: data.parentName || "Parent",
      parentPhone: data.parentPhone ? normalizeIndianMobile(data.parentPhone) : "",
      phone: data.phone ? normalizeIndianMobile(data.phone) : "",
      password: data.password,
      active: isActive,
      status: isActive ? "ACTIVE" : "INACTIVE"
    };
    console.log("[useSchoolData Debug] Creating student with payload:", payload);
    try {
      const res = await schoolAdminDataApi.createStudent(payload);
      await refreshStudents();
      return res;
    } catch (err) {
      console.error("Failed to add student:", err);
      throw new Error(err?.response?.data?.message || "Failed to add student.");
    }
  };

  const updateStudent = async (id, data) => {
    const [firstName = "", ...lastNameParts] = (data.name || "").split(" ");
    const lastName = lastNameParts.join(" ") || "Student";
    const isActive = data.active !== undefined
      ? Boolean(data.active)
      : (data.status ? String(data.status).toLowerCase() === "active" : true);
    const payload = {
      firstName,
      lastName,
      email: data.email,
      rollNumber: data.rollNo,
      standard: String(data.standard || 10),
      division: data.division || "A",
      teacherId: data.teacherId ? Number(data.teacherId) : null,
      parentName: data.parentName || "Parent",
      parentPhone: data.parentPhone ? normalizeIndianMobile(data.parentPhone) : "",
      phone: data.phone ? normalizeIndianMobile(data.phone) : "",
      active: isActive,
      status: isActive ? "ACTIVE" : "INACTIVE"
    };
    console.log("[useSchoolData Debug] Updating student ID " + id + " with payload:", payload);
    try {
      await schoolAdminDataApi.updateStudent(id, payload);
      await refreshStudents();
    } catch (err) {
      console.error("Failed to update student:", err);
      alert(err?.response?.data?.message || "Failed to update student.");
    }
  };

  const deleteStudent = async (id) => {
    try {
      const res = await schoolAdminDataApi.deleteStudent(id);
      console.log("Delete API response:", res);
      await refreshStudents();
    } catch (err) {
      console.error("Failed to delete student:", err);
      alert(err?.response?.data?.message || "Failed to delete student.");
    }
  };

  return { students, totalStudents: students.length, searchTerm, setSearchTerm, standard, setStandard, addStudent, updateStudent, deleteStudent, isLoading };
}

export function useResults() {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentsList, setStudentsList] = useState([]);

  const loadResults = useCallback(async (query = "") => {
    setIsLoading(true);
    setError("");
    try {
      const trimmedQuery = query.trim();
      const data = trimmedQuery
        ? await schoolAdminDataApi.searchResults(trimmedQuery)
        : await schoolAdminDataApi.getAllResults();
      const mapped = data.map((r) => ({
        id: r.id,
        studentName: r.studentName || "Student",
        standard: Number(r.standard) || 10,
        testTitle: r.testTitle || "Untitled Test",
        marksObtained: r.marksObtained ?? 0,
        totalMarks: r.totalMarks ?? 0,
        percentage: r.percentage ?? (r.totalMarks > 0 ? Math.round((r.marksObtained / r.totalMarks) * 100) : 0),
        status: r.status || "Fail",
        submittedAt: r.submittedAt ? r.submittedAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
      }));
      setResults(mapped);

      // Cache students separately so an auxiliary cache failure does not hide valid Results data.
      try {
        const stData = await schoolAdminDataApi.getAllStudents();
        setStudentsList(stData);
      } catch (studentError) {
        console.error("Failed to cache students for results:", studentError);
      }
    } catch (err) {
      console.error("Failed to load results:", err);
      setResults([]);
      setError(err?.response?.data?.message || "Unable to load results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadResults(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [loadResults, searchTerm]);

  const addResult = async (data) => {
    const student = studentsList.find(
      (s) => `${s.firstName || ""} ${s.lastName || ""}`.trim().toLowerCase() === (data.studentName || "").trim().toLowerCase()
    );
    const payload = {
      studentId: student ? student.studentId : (studentsList[0]?.studentId || 1),
      testTitle: data.testTitle || "English Basics",
      marksObtained: Number(data.marksObtained) || 0,
      totalMarks: Number(data.totalMarks) || 100,
      active: true
    };
    try {
      const response = await schoolAdminDataApi.createResult(payload);
      await loadResults();
    } catch (err) {
      console.error("Failed to add result:", err);
    }
  };

  const updateResult = async (id, data) => {
    const payload = {
      testTitle: data.testTitle,
      marksObtained: Number(data.marksObtained),
      totalMarks: Number(data.totalMarks),
      active: true
    };
    try {
      await schoolAdminDataApi.updateResult(id, payload);
      await loadResults();
    } catch (err) {
      console.error("Failed to update result:", err);
    }
  };

  const deleteResult = async (id) => {
    try {
      await schoolAdminDataApi.deleteResult(id);
      await loadResults();
    } catch (err) {
      console.error("Failed to delete result:", err);
    }
  };

  return {
    results,
    totalResults: results.length,
    searchTerm,
    setSearchTerm,
    addResult,
    updateResult,
    deleteResult,
    isLoading,
    error
  };
}

export function useTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadTeachersData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await schoolAdminDataApi.getAllTeachers();
      const mapped = data.map((t) => ({
        id: t.id,
        firstName: t.firstName || "",
        lastName: t.lastName || "",
        name: `${t.firstName || ""} ${t.lastName || ""}`.trim() || "Unknown Teacher",
        email: t.email || "",
        phone: t.phone || "",
        department: t.department || "",
        division: t.division || "",
        experience: t.experience || "",
        qualification: t.qualification || "",
        standards:
          Array.isArray(t.standards) && t.standards.length
            ? t.standards
            : t.standard
              ? [t.standard]
              : [],
        standard:
          Array.isArray(t.standards) && t.standards.length
            ? t.standards.join(", ")
            : t.standard || "",
        standardDivisions: t.standardDivisions || [],
        schoolId: t.schoolId,
        schoolName: t.schoolName,
        active: Boolean(t.active),
        status: t.active ? "active" : "inactive"
      }));
      setTeachers(mapped);

      // Load students to allow teacher-student filtering
      const stData = await schoolAdminDataApi.getAllStudents();
      const mappedStudents = (Array.isArray(stData) ? stData : []).map((s) => ({
        id: s.id || s.studentId,
        studentId: s.studentId,
        name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Unknown Student",
        email: s.email,
        standard: s.standard != null ? String(s.standard) : "",
        rollNo: s.rollNumber || (s.studentId ? `RN-${s.studentId}` : `RN-${s.id}`),
        division: s.division != null ? String(s.division) : "",
        parentName: s.parentName || "Parent",
        parentPhone: s.parentPhone || "",
        phone: s.phone || "",
        active: s.active !== undefined ? Boolean(s.active) : (s.status ? String(s.status).toLowerCase() === "active" : true),
        status: (s.active !== undefined ? Boolean(s.active) : (s.status ? String(s.status).toLowerCase() === "active" : true)) ? "active" : "inactive",
        joinedAt: s.createdAt ? s.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
        teacherId: s.teacherId || null,
        assignedTeacher: s.teacherName || "Unassigned",
        progress: {
          level: s.level || 1,
          xp: s.xp || 0
        }
      }));
      setStudents(mappedStudents);
    } catch (err) {
      console.error("Failed to load teachers:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachersData();
  }, [loadTeachersData]);

  // Auto-refresh teachers when real-time school data update notification occurs
  useEffect(() => {
    const handleUpdate = () => {
      loadTeachersData();
    };
    window.addEventListener("school_data_updated", handleUpdate);
    return () => window.removeEventListener("school_data_updated", handleUpdate);
  }, [loadTeachersData]);

  const addTeacher = async (data) => {
    const payload = {
      firstName: (data.firstName || "").trim(),
      lastName: (data.lastName || "").trim(),
      email: (data.email || "").trim(),
      password: data.password,
      phone: data.phone ? normalizeIndianMobile(data.phone) : "",
      active: data.active,
      department: (data.department || "").trim(),
      experience: (data.experience || "").trim(),
      qualification: (data.qualification || "").trim(),
      standardDivisions: data.standardDivisions || []
    };
    try {
      await schoolAdminDataApi.createTeacher(payload);
      await loadTeachersData();
    } catch (err) {
      console.error("Failed to add teacher:", err);
      const validationMap = err?.response?.data?.errors;
      const detailedMsg = (validationMap && typeof validationMap === 'object')
        ? Object.values(validationMap).join(", ")
        : (err?.response?.data?.message || err?.message || "Unable to add the teacher.");
      const errorObj = new Error(detailedMsg);
      errorObj.response = err?.response;
      throw errorObj;
    }
  };

  const updateTeacher = async (id, data) => {
    const payload = {
      firstName: (data.firstName || "").trim(),
      lastName: (data.lastName || "").trim(),
      email: (data.email || "").trim(),
      phone: data.phone ? normalizeIndianMobile(data.phone) : "",
      active: data.active,
      department: (data.department || "").trim(),
      experience: (data.experience || "").trim(),
      qualification: (data.qualification || "").trim(),
      standardDivisions: data.standardDivisions || []
    };

    if (data.password) payload.password = data.password;
    try {
      await schoolAdminDataApi.updateTeacher(id, payload);
      await loadTeachersData();
    } catch (err) {
      console.error("Failed to update teacher:", err);
      const validationMap = err?.response?.data?.errors;
      const detailedMsg = (validationMap && typeof validationMap === 'object')
        ? Object.values(validationMap).join(", ")
        : (err?.response?.data?.message || err?.message || "Unable to update the teacher.");
      const errorObj = new Error(detailedMsg);
      errorObj.response = err?.response;
      throw errorObj;
    }
  };

  const deleteTeacher = async (id) => {
    try {
      await schoolAdminDataApi.deleteTeacher(id);
      await loadTeachersData();
    } catch (err) {
      console.error("Failed to deactivate teacher:", err);
    }
  };

  const getStudentsForTeacher = (teacherParam) => {
    if (!teacherParam) return [];
    const teacherId = typeof teacherParam === "object" ? teacherParam.id : null;
    const teacherName = typeof teacherParam === "object" ? teacherParam.name : teacherParam;
    const teacherStandardDivisions = typeof teacherParam === "object" ? (teacherParam.standardDivisions || []) : [];

    const norm = (v) => String(v || "").trim().replace(/(st|nd|rd|th)?\s*(standard|std|grade|class)?$/i, "").replace(/^(grade|class)\s*/i, "").trim();

    return students.filter((s) => {
      if (teacherId && s.teacherId && Number(s.teacherId) === Number(teacherId)) {
        return true;
      }
      if (teacherName && s.assignedTeacher && s.assignedTeacher.trim().toLowerCase() === teacherName.trim().toLowerCase()) {
        return true;
      }
      if (teacherStandardDivisions.length > 0) {
        return teacherStandardDivisions.some(sd => {
          const tStd = norm(sd.standard);
          const sStd = norm(s.standard);
          const tDiv = String(sd.division || "").trim().toUpperCase();
          const sDiv = String(s.division || "").trim().toUpperCase();
          if (!tStd || !sStd || tStd !== sStd) return false;
          if (tDiv && sDiv) return tDiv === sDiv;
          return true;
        });
      }
      return false;
    });
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.division || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachers, searchTerm]);

  return {
    teachers: filteredTeachers,
    totalTeachers: teachers.length,
    searchTerm,
    setSearchTerm,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    getStudentsForTeacher,
    isLoading
  };
}
