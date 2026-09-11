import { useState, useEffect, useCallback } from "react";
import { studentApi } from "@services/admin/studentApi";
import { adminDashboardApi } from "@services/admin/adminDashboardApi";
import { normalizeIndianMobile } from "@utils/phoneValidator";

const generateHistory = (baseScore) => {
  return [
    { name: "W1", score: Math.max(0, baseScore - 15) },
    { name: "W2", score: Math.max(0, baseScore - 5) },
    { name: "W3", score: Math.min(100, baseScore + 2) },
    { name: "W4", score: baseScore }
  ];
};

const mapBackendStudent = (s) => {
  if (!s) return null;
  const completedLessons = Number(s.totalLessonsCompleted) || 0;
  const grammarSessions = Number(s.totalGrammarSessions) || 0;
  const speakingSessions = Number(s.totalSpeakingSessions) || 0;

  // Compute average score from activity counts or default score
  const avgScore = s.averageScore != null
    ? Math.round(Number(s.averageScore))
    : (completedLessons > 0 || grammarSessions > 0 || speakingSessions > 0)
      ? Math.min(100, 60 + (completedLessons * 5) + (grammarSessions * 2))
      : 0;

  return {
    id: s.id,
    name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Unknown",
    firstName: s.firstName || "",
    lastName: s.lastName || "",
    email: s.email || "",
    phone: s.phone || "",
    schoolName: s.schoolName || "",
    standard: Number(s.standard) || 1,
    division: s.division || "",
    rollNo: s.rollNumber || "",
    rollNumber: s.rollNumber || "",
    parentName: s.parentName || "",
    parentPhone: s.parentPhone || "",
    assignedTeacher: s.assignedTeacher || s.teacherName || "",
    teacherId: s.teacherId || null,
    status: s.active ? "active" : "inactive",
    active: !!s.active,
    joinedAt: s.createdAt ? s.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    progress: {
      completedLessons: completedLessons,
      totalLessons: 50,
      percentage: completedLessons ? Math.min(100, Math.round((completedLessons / 50) * 100)) : 0,
      quizzes: grammarSessions,
      averageScore: avgScore,
      lastActive: s.createdAt ? s.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      history: generateHistory(avgScore > 0 ? avgScore : 75)
    },
    raw: s
  };
};

let studentManagementCache = {
  students: null,
  schools: null,
  totalPages: 0,
  totalElements: 0,
};

export function useStudentManagement() {
  const [students, setStudents] = useState(() => studentManagementCache.students || []);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(() => !studentManagementCache.students || studentManagementCache.students.length === 0);
  const [error, setError] = useState("");
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(() => studentManagementCache.totalPages || 0);
  const [totalElements, setTotalElements] = useState(() => studentManagementCache.totalElements || 0);

  // Filters
  const [filters, setFilters] = useState({
    schoolName: "All Schools",
    standard: "all",
    division: "all",
    status: "all"
  });

  const [schools, setSchools] = useState(() => studentManagementCache.schools || []);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset page on new search
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load schools dropdown list
  const loadSchools = useCallback(async () => {
    if (studentManagementCache.schools && studentManagementCache.schools.length > 0) {
      setSchools(studentManagementCache.schools);
      return;
    }
    setSchoolsLoading(true);
    try {
      const data = await studentApi.getSchools();
      const list = data || [];
      studentManagementCache.schools = list;
      setSchools(list);
    } catch (err) {
      console.error("Failed to load schools:", err);
    } finally {
      setSchoolsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  // Load students with search/filter/pagination
  const loadStudents = useCallback(async () => {
    const isDefaultQuery = !debouncedSearch.trim() && page === 0 &&
      filters.schoolName === "All Schools" && filters.standard === "all" &&
      filters.division === "all" && filters.status === "all";

    // Only show full loader if there is no data in state or cache
    setStudents((curr) => {
      if (!curr || curr.length === 0) {
        setIsLoading(true);
      }
      return curr;
    });

    setError("");
    try {
      let res;
      if (debouncedSearch.trim()) {
        res = await studentApi.searchStudents(debouncedSearch.trim(), page, size);
      } else {
        const hasActiveFilter =
          filters.schoolName !== "All Schools" ||
          filters.standard !== "all" ||
          filters.division !== "all" ||
          filters.status !== "all";

        if (hasActiveFilter) {
          const filterParams = {};
          if (filters.schoolName !== "All Schools") filterParams.schoolName = filters.schoolName;
          if (filters.standard !== "all") filterParams.standard = filters.standard;
          if (filters.division !== "all") filterParams.division = filters.division;
          if (filters.status !== "all") filterParams.status = filters.status === "active";
          res = await studentApi.filterStudents(filterParams, page, size);
        } else {
          res = await studentApi.getStudents(page, size);
        }
      }

      const pageData = res?.data;
      const content = pageData?.content || [];
      const mapped = content.map(mapBackendStudent).filter(Boolean);
      setStudents(mapped);
      setTotalPages(pageData?.totalPages || 0);
      setTotalElements(pageData?.totalElements || 0);

      if (isDefaultQuery) {
        studentManagementCache.students = mapped;
        studentManagementCache.totalPages = pageData?.totalPages || 0;
        studentManagementCache.totalElements = pageData?.totalElements || 0;
      }
    } catch (err) {
      console.error("Failed to load students:", err);
      setStudents((curr) => {
        if (!curr || curr.length === 0) {
          setError("Failed to load students from server.");
        }
        return curr;
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, size, filters]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const viewStudent = useCallback(async (id) => {
    if (!id) {
      setSelectedStudent(null);
      return null;
    }

    // Instant optimistic display if student is already in the loaded table list
    setStudents((currStudents) => {
      const existing = currStudents?.find((s) => String(s.id) === String(id));
      if (existing) {
        setSelectedStudent(existing);
      }
      return currStudents;
    });

    setIsDetailLoading(true);
    setDetailError("");
    try {
      const response = await studentApi.getStudentById(id);
      const studentData = response?.data;
      const mapped = mapBackendStudent(studentData);
      if (mapped) {
        setSelectedStudent(mapped);
      }
      return mapped;
    } catch (err) {
      console.warn("Failed to fetch detailed student stats/profile:", err?.response?.data || err?.message);
      setDetailError("Student details could not be loaded or student record was removed.");
      return null;
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const addStudent = async (data) => {
    const [firstName = "", ...lastNameParts] = (data.name || "").split(" ");
    const lastName = lastNameParts.join(" ") || "Student";
    const payload = {
      firstName,
      lastName,
      email: data.email,
      password: data.password,
      phone: normalizeIndianMobile(data.phone),
      schoolId: data.schoolId ? Number(data.schoolId) : null,
      schoolName: data.schoolName,
      standard: String(data.standard),
      division: data.division || "A",
      rollNumber: String(data.rollNo || "1"),
      teacherId: data.teacherId ? Number(data.teacherId) : null,
      parentName: data.parentName || "Parent",
      parentPhone: normalizeIndianMobile(data.parentPhone),
      active: data.status === "active"
    };
    const res = await studentApi.createStudent(payload);
    studentManagementCache.students = null;
    try { await adminDashboardApi.getDashboardStats(); } catch(e) {}
    window.dispatchEvent(new CustomEvent("school_data_updated", { detail: { type: "student", action: "create" } }));
    await loadStudents();
    return res;
  };

  const updateStudent = async (id, data) => {
    const [firstName = "", ...lastNameParts] = (data.name || "").split(" ");
    const lastName = lastNameParts.join(" ") || "Student";
    const payload = {
      firstName,
      lastName,
      phone: normalizeIndianMobile(data.phone),
      schoolName: data.schoolName,
      standard: String(data.standard),
      division: data.division || "A",
      rollNumber: String(data.rollNo || "1"),
      teacherId: data.teacherId ? Number(data.teacherId) : null,
      parentName: data.parentName || "Parent",
      parentPhone: normalizeIndianMobile(data.parentPhone),
      active: data.status === "active"
    };
    await studentApi.updateStudent(id, payload);
    studentManagementCache.students = null;
    try { await adminDashboardApi.getDashboardStats(); } catch(e) {}
    window.dispatchEvent(new CustomEvent("school_data_updated", { detail: { type: "student", action: "update", id } }));
    await loadStudents();
  };

  const deleteStudent = async (id) => {
    studentManagementCache.students = null;
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setTotalElements((prev) => Math.max(0, prev - 1));
    await studentApi.deleteStudent(id);
    try { await adminDashboardApi.getDashboardStats(); } catch(e) {}
    window.dispatchEvent(new CustomEvent("school_data_updated", { detail: { type: "student", action: "delete", id } }));
    await loadStudents();
  };

  const activateStudent = async (id) => {
    studentManagementCache.students = null;
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: true, status: "active" } : s))
    );
    await studentApi.activateStudent(id);
    try { await adminDashboardApi.getDashboardStats(); } catch(e) {}
    window.dispatchEvent(new CustomEvent("school_data_updated", { detail: { type: "student", action: "activate", id } }));
    await loadStudents();
  };

  const deactivateStudent = async (id) => {
    studentManagementCache.students = null;
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: false, status: "inactive" } : s))
    );
    await studentApi.deactivateStudent(id);
    try { await adminDashboardApi.getDashboardStats(); } catch(e) {}
    window.dispatchEvent(new CustomEvent("school_data_updated", { detail: { type: "student", action: "deactivate", id } }));
    await loadStudents();
  };

  return {
    students,
    schools,
    schoolsLoading,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    isDetailLoading,
    detailError,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalElements,
    filters,
    setFilters,
    addStudent,
    updateStudent,
    deleteStudent,
    activateStudent,
    deactivateStudent,
    loadStudents,
    loadSchools,
    selectedStudent,
    setSelectedStudent,
    viewStudent
  };
}
