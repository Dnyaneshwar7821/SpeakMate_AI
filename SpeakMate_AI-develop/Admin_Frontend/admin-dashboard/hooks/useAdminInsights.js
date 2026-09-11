import { useState, useEffect, useMemo, useCallback } from "react";
import { adminInsightsApi } from "../../src/services/adminInsightsApi";

/**
 * Utility to format standard numeric strings (e.g. "1", "2") to display labels ("1st Standard", "2nd Standard").
 */
export function formatStandardLabel(standard) {
  if (!standard && standard !== 0) return "";
  const num = parseInt(standard, 10);
  if (isNaN(num)) return `${standard} Standard`;

  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  const ordinal = num + (s[(v - 20) % 10] || s[v] || s[0]);
  return `${ordinal} Standard`;
}

/**
 * Custom hook managing the complete Super Admin AI Insights data lifecycle:
 *  - Master dataset fetching (Schools + Paginated School Users)
 *  - 4-Tier cascading filter state
 *  - Single in-memory filtered student dataset
 *  - Derived engagement KPIs
 *  - Pre-aggregated data structures prepared for Phase 3 charts
 */
export function useAdminInsights() {
  // Master data state
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({
    totalElements: 0,
    totalPages: 0,
    pagesFetched: 0,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cascading filter state
  const [selectedSchool, setSelectedSchool] = useState("All Schools");
  const [selectedStandard, setSelectedStandard] = useState("all");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all"); // "all" | "active" | "inactive"

  // Fetch complete master dataset on mount
  const loadInsightsData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Execute school fetch and complete paginated student fetch in parallel
      const [schoolsData, studentsResult] = await Promise.all([
        adminInsightsApi.getSchools(),
        adminInsightsApi.getAllSchoolUsers(),
      ]);

      setSchools(Array.isArray(schoolsData) ? schoolsData : []);
      setStudents(Array.isArray(studentsResult.students) ? studentsResult.students : []);
      setPaginationMeta({
        totalElements: studentsResult.totalElements,
        totalPages: studentsResult.totalPages,
        pagesFetched: studentsResult.pagesFetched,
      });
    } catch (err) {
      console.error("[useAdminInsights] Error loading data:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load Super Admin AI Insights data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsightsData();
  }, [loadInsightsData]);

  // Cascading Filter Actions
  const handleSchoolChange = useCallback((schoolName) => {
    setSelectedSchool(schoolName);
    setSelectedStandard("all");
    setSelectedDivision("all");
  }, []);

  const handleStandardChange = useCallback((standard) => {
    setSelectedStandard(standard);
    setSelectedDivision("all");
  }, []);

  const handleDivisionChange = useCallback((division) => {
    setSelectedDivision(division);
  }, []);

  const handleStatusChange = useCallback((status) => {
    setSelectedStatus(status);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedSchool("All Schools");
    setSelectedStandard("all");
    setSelectedDivision("all");
    setSelectedStatus("all");
  }, []);

  // Compute available standards based on selected school
  const availableStandards = useMemo(() => {
    if (selectedSchool !== "All Schools") {
      const matchedSchool = schools.find((s) => s.name === selectedSchool);
      if (matchedSchool?.academicStructure && matchedSchool.academicStructure.length > 0) {
        return matchedSchool.academicStructure
          .map((item) => String(item.standard))
          .filter(Boolean)
          .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
      }
    }

    // Default: Extract all distinct standards across all schools' academicStructure and students
    const standardsSet = new Set();
    schools.forEach((school) => {
      school.academicStructure?.forEach((item) => {
        if (item.standard) standardsSet.add(String(item.standard));
      });
    });
    students.forEach((student) => {
      if (student.standard) standardsSet.add(String(student.standard));
    });

    return Array.from(standardsSet).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [selectedSchool, schools, students]);

  // Compute available divisions based on selected school and standard
  const availableDivisions = useMemo(() => {
    if (selectedSchool !== "All Schools") {
      const matchedSchool = schools.find((s) => s.name === selectedSchool);
      if (matchedSchool?.academicStructure && matchedSchool.academicStructure.length > 0) {
        if (selectedStandard !== "all") {
          const matchedStandard = matchedSchool.academicStructure.find(
            (item) => String(item.standard) === String(selectedStandard)
          );
          return matchedStandard?.divisions ? [...matchedStandard.divisions].sort() : [];
        }

        // All standards in this school: collect all divisions
        const divSet = new Set();
        matchedSchool.academicStructure.forEach((item) => {
          item.divisions?.forEach((d) => divSet.add(d));
        });
        return Array.from(divSet).sort();
      }
    }

    // Across all schools: collect all distinct divisions
    const divSet = new Set();
    schools.forEach((school) => {
      school.academicStructure?.forEach((item) => {
        item.divisions?.forEach((d) => divSet.add(d));
      });
    });
    students.forEach((student) => {
      if (student.division) divSet.add(student.division);
    });

    return Array.from(divSet).sort();
  }, [selectedSchool, selectedStandard, schools, students]);

  // Master Filter: Apply cascading filters to students dataset
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // 1. School Filter
      if (selectedSchool !== "All Schools") {
        if (!student.schoolName || student.schoolName.trim().toLowerCase() !== selectedSchool.trim().toLowerCase()) {
          return false;
        }
      }

      // 2. Standard Filter (numeric match)
      if (selectedStandard !== "all") {
        if (String(student.standard) !== String(selectedStandard)) {
          return false;
        }
      }

      // 3. Division Filter
      if (selectedDivision !== "all") {
        if (student.division !== selectedDivision) {
          return false;
        }
      }

      // 4. Status Filter
      if (selectedStatus === "active") {
        if (!student.active) return false;
      } else if (selectedStatus === "inactive") {
        if (student.active) return false;
      }

      return true;
    });
  }, [students, selectedSchool, selectedStandard, selectedDivision, selectedStatus]);

  // Derived Engagement KPIs
  const kpis = useMemo(() => {
    const total = filteredStudents.length;
    const active = filteredStudents.filter((s) => s.active === true).length;
    const inactive = filteredStudents.filter((s) => s.active === false).length;
    const rate = total > 0 ? Number(((active / total) * 100).toFixed(1)) : 0;
    const monitoredSchoolsCount = new Set(
      filteredStudents.map((s) => s.schoolName).filter(Boolean)
    ).size;

    return {
      totalStudents: total,
      activeStudents: active,
      inactiveStudents: inactive,
      engagementRate: rate,
      monitoredSchools: monitoredSchoolsCount,
      // Keep strictly null as individual student list endpoints do not provide per-user counts
      totalSpeakingSessions: null,
      totalLessonsCompleted: null,
    };
  }, [filteredStudents]);

  // Pre-aggregated structures prepared for Phase 3 interactive charts
  const aggregations = useMemo(() => {
    // 1. School Aggregation
    const schoolMap = new Map();
    filteredStudents.forEach((student) => {
      const name = student.schoolName || "Unknown School";
      if (!schoolMap.has(name)) {
        schoolMap.set(name, { schoolName: name, totalStudents: 0, activeStudents: 0, inactiveStudents: 0 });
      }
      const entry = schoolMap.get(name);
      entry.totalStudents += 1;
      if (student.active) entry.activeStudents += 1;
      else entry.inactiveStudents += 1;
    });

    const schoolAggregation = Array.from(schoolMap.values())
      .map((entry) => ({
        ...entry,
        engagementRate: entry.totalStudents > 0 ? Number(((entry.activeStudents / entry.totalStudents) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.totalStudents - a.totalStudents);

    // 2. Standard Aggregation
    const standardMap = new Map();
    filteredStudents.forEach((student) => {
      const std = student.standard ? String(student.standard) : "Unassigned";
      if (!standardMap.has(std)) {
        standardMap.set(std, { standard: std, totalStudents: 0, activeStudents: 0, inactiveStudents: 0 });
      }
      const entry = standardMap.get(std);
      entry.totalStudents += 1;
      if (student.active) entry.activeStudents += 1;
      else entry.inactiveStudents += 1;
    });

    const standardAggregation = Array.from(standardMap.values())
      .map((entry) => ({
        ...entry,
        engagementRate: entry.totalStudents > 0 ? Number(((entry.activeStudents / entry.totalStudents) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => (parseInt(a.standard, 10) || 99) - (parseInt(b.standard, 10) || 99));

    // 3. Division Aggregation
    const divisionMap = new Map();
    filteredStudents.forEach((student) => {
      const div = student.division || "Unassigned";
      if (!divisionMap.has(div)) {
        divisionMap.set(div, { division: div, totalStudents: 0, activeStudents: 0, inactiveStudents: 0 });
      }
      const entry = divisionMap.get(div);
      entry.totalStudents += 1;
      if (student.active) entry.activeStudents += 1;
      else entry.inactiveStudents += 1;
    });

    const divisionAggregation = Array.from(divisionMap.values())
      .map((entry) => ({
        ...entry,
        engagementRate: entry.totalStudents > 0 ? Number(((entry.activeStudents / entry.totalStudents) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => a.division.localeCompare(b.division));

    // 4. Status Aggregation
    const statusAggregation = {
      active: kpis.activeStudents,
      inactive: kpis.inactiveStudents,
    };

    return {
      schoolAggregation,
      standardAggregation,
      divisionAggregation,
      statusAggregation,
    };
  }, [filteredStudents, kpis]);

  return {
    // Raw Data
    schools,
    students,
    paginationMeta,

    // Filtered Output
    filteredStudents,
    kpis,
    aggregations,

    // Filter Options
    availableStandards,
    availableDivisions,

    // Filter State
    selectedSchool,
    selectedStandard,
    selectedDivision,
    selectedStatus,

    // Filter Setters
    setSelectedSchool: handleSchoolChange,
    setSelectedStandard: handleStandardChange,
    setSelectedDivision: handleDivisionChange,
    setSelectedStatus: handleStatusChange,
    resetFilters,

    // Status
    loading,
    error,
    refetch: loadInsightsData,
  };
}

export default useAdminInsights;
