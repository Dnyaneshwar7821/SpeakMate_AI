import React from 'react';

const ResultPagination = ({
  currentPage = 1,
  totalPages = 10,
  totalCount = 100,
  itemsPerPage = 10,
  onPageChange,
}) => {
  const startItem = totalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageButtons = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          type="button"
          onClick={() => onPageChange && onPageChange(i)}
          className={`btn-page-num ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="result-pagination-container">
      <div className="pagination-info">
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalCount}</strong> students
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          className="btn-page-nav"
        >
          ‹ Previous
        </button>

        <div className="pagination-numbers">{renderPageButtons()}</div>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="btn-page-nav"
        >
          Next ›
        </button>
      </div>
    </div>
  );
};

export default ResultPagination;
