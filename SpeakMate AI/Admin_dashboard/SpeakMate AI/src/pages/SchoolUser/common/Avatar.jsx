import React from 'react';

const Avatar = ({ src, name = '', size = 40, className = '' }) => {
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    objectFit: 'cover',
  };

  const fallbackStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: `${Math.round(size * 0.4)}px`,
    flexShrink: 0,
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className={`avatar-img ${className}`}
        onError={(e) => {
          e.target.style.display = 'none';
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'flex';
          }
        }}
      />
    );
  }

  return (
    <div style={fallbackStyle} className={`avatar-fallback ${className}`}>
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
