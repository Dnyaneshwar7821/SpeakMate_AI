import React from 'react';

const SkeletonRow = () => (
  <tr className="skeleton-row">
    <td>
      <div className="skeleton-box" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
    </td>
    <td>
      <div className="skeleton-box" style={{ width: '130px', height: '14px', borderRadius: '4px' }} />
    </td>
    <td>
      <div className="skeleton-box" style={{ width: '160px', height: '14px', borderRadius: '4px' }} />
    </td>
    <td>
      <div className="skeleton-box" style={{ width: '60px', height: '14px', borderRadius: '4px' }} />
    </td>
    <td>
      <div className="skeleton-box" style={{ width: '40px', height: '20px', borderRadius: '12px' }} />
    </td>
    <td>
      <div className="skeleton-box" style={{ width: '70px', height: '20px', borderRadius: '6px' }} />
    </td>
    <td>
      <div className="skeleton-box" style={{ width: '70px', height: '20px', borderRadius: '6px' }} />
    </td>
    <td>
      <div className="skeleton-box" style={{ width: '60px', height: '20px', borderRadius: '12px' }} />
    </td>
    <td style={{ textAlign: 'right' }}>
      <div className="skeleton-box" style={{ width: '50px', height: '26px', borderRadius: '6px', marginLeft: 'auto' }} />
    </td>
  </tr>
);

const Loading = ({ count = 5 }) => {
  return (
    <div className="table-responsive">
      <style>{`
        .skeleton-box {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite ease-in-out;
        }
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <table className="user-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Student Name</th>
            <th>Email</th>
            <th>Standard</th>
            <th>English Level</th>
            <th>XP</th>
            <th>Streak</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: count }, (_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Loading;
