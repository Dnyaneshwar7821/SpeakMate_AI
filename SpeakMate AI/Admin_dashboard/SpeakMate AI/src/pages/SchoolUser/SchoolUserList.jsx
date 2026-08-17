import React, { useState } from 'react';
import PageHeader from './common/PageHeader';
import StudentStats from './components/StudentStats';
import StudentSearch from './components/StudentSearch';
import StudentFilters from './components/StudentFilters';
import StudentTable from './components/StudentTable';
import StudentCard from './components/StudentCard';
import StudentPagination from './components/StudentPagination';
import EmptyState from './common/EmptyState';
import Loading from './common/Loading';
import StudentOverview from './StudentOverview';
import { useSchoolUsers } from './hooks/useSchoolUsers';
import './styles/schoolUser.css';

const SchoolUserList = () => {
  const [isLoading] = useState(false);
  const {
    search,
    status,
    standard,
    currentPage,
    itemsPerPage,
    totalPages,
    totalCount,
    stats,
    students,
    selectedStudent,
    selectedStudentId,
    setSelectedStudentId,
    setSearch,
    setStatus,
    setStandard,
    setCurrentPage,
    resetFilters,
  } = useSchoolUsers();

  // Clicking View navigates to StudentOverview page
  if (selectedStudentId) {
    return (
      <StudentOverview
        student={selectedStudent}
        onBack={() => setSelectedStudentId(null)}
      />
    );
  }

  return (
    <div className="user-module-container">
      <PageHeader
        title="School Users"
        subtitle="Manage and monitor all school student accounts."
      />

      <StudentStats stats={stats} />

      <div className="filter-bar-card">
        <StudentSearch value={search} onChange={setSearch} />
        <StudentFilters
          status={status}
          standard={standard}
          onStatusChange={setStatus}
          onStandardChange={setStandard}
          onReset={resetFilters}
        />
      </div>

      {isLoading ? (
        <div className="table-card-container">
          <Loading count={5} />
        </div>
      ) : totalCount === 0 ? (
        <EmptyState
          title="No students found"
          description="Try changing your search or filters."
          onReset={resetFilters}
        />
      ) : (
        <>
          <div className="table-card-container">
            <StudentTable students={students} onViewStudent={setSelectedStudentId} />
            <StudentCard students={students} onViewStudent={setSelectedStudentId} />
          </div>

          <StudentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
            unitLabel="students"
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default SchoolUserList;
