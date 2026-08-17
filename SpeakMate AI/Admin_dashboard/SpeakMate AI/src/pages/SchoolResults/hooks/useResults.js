import { useState, useMemo, useCallback } from 'react';
import { resultsMockData } from '../data/resultsMockData';
import { filterResults, calculateResultStats } from '../utils/resultHelpers';

export const useResults = () => {
  const [school, setSchool] = useState('All Schools');
  const [standard, setStandard] = useState('All Standards');
  const [subject, setSubject] = useState('All Subjects');
  const [exam, setExam] = useState('All Exams');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = useMemo(() => {
    return filterResults(resultsMockData, { school, standard, subject, exam, search });
  }, [school, standard, subject, exam, search]);

  const stats = useMemo(() => {
    return calculateResultStats(filteredStudents);
  }, [filteredStudents]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  }, [filteredStudents.length, itemsPerPage]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const resetFilters = useCallback(() => {
    setSchool('All Schools');
    setStandard('All Standards');
    setSubject('All Subjects');
    setExam('All Exams');
    setSearch('');
    setCurrentPage(1);
  }, []);

  const handleSchoolChange = useCallback((val) => {
    setSchool(val);
    setCurrentPage(1);
  }, []);

  const handleStandardChange = useCallback((val) => {
    setStandard(val);
    setCurrentPage(1);
  }, []);

  const handleSubjectChange = useCallback((val) => {
    setSubject(val);
    setCurrentPage(1);
  }, []);

  const handleExamChange = useCallback((val) => {
    setExam(val);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((val) => {
    setSearch(val);
    setCurrentPage(1);
  }, []);

  return {
    school,
    standard,
    subject,
    exam,
    search,
    currentPage,
    itemsPerPage,
    totalPages,
    totalCount: filteredStudents.length,
    stats,
    allFilteredStudents: filteredStudents,
    paginatedStudents,
    selectedStudent,
    setSelectedStudent,
    onSchoolChange: handleSchoolChange,
    onStandardChange: handleStandardChange,
    onSubjectChange: handleSubjectChange,
    onExamChange: handleExamChange,
    onSearchChange: handleSearchChange,
    onPageChange: setCurrentPage,
    resetFilters,
  };
};

export default useResults;
