import { useState, useMemo, useCallback } from 'react';
import { schoolUsersMockData } from '../data/schoolUsersMockData';
import { filterSchoolUsers, calculateSchoolUserStats } from '../utils/schoolUserHelpers';
import { DEFAULT_ITEMS_PER_PAGE } from '../constants/userConstants';

export const useSchoolUsers = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [standard, setStandard] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const stats = useMemo(() => {
    return calculateSchoolUserStats(schoolUsersMockData);
  }, []);

  const filteredUsers = useMemo(() => {
    return filterSchoolUsers(schoolUsersMockData, { search, status, standard });
  }, [search, status, standard]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  }, [filteredUsers.length, itemsPerPage]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return schoolUsersMockData.find((student) => student.id === selectedStudentId) || null;
  }, [selectedStudentId]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setStatus('All');
    setStandard('All');
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((val) => {
    setSearch(val);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((val) => {
    setStatus(val);
    setCurrentPage(1);
  }, []);

  const handleStandardChange = useCallback((val) => {
    setStandard(val);
    setCurrentPage(1);
  }, []);

  return {
    search,
    status,
    standard,
    currentPage,
    itemsPerPage,
    totalPages,
    totalCount: filteredUsers.length,
    stats,
    students: paginatedUsers,
    selectedStudent,
    selectedStudentId,
    setSelectedStudentId,
    setSearch: handleSearchChange,
    setStatus: handleStatusChange,
    setStandard: handleStandardChange,
    setCurrentPage,
    setItemsPerPage,
    resetFilters,
  };
};

export default useSchoolUsers;
