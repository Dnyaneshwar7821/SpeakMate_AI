import React from 'react';
import SearchBar from '../common/SearchBar';

const StudentSearch = ({ value, onChange }) => {
  return <SearchBar value={value} onChange={onChange} placeholder="Search students..." />;
};

export default StudentSearch;
