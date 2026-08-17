import React from 'react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  itemsPerPage = 10,
  unitLabel = 'students',
  onPageChange,
}) => {
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing {startItem}–{endItem} of {totalCount} {unitLabel}
      </div>
      <div className="pagination-controls">
        <button
          type="button"
          className="btn-page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            className={`btn-page ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          className="btn-page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
