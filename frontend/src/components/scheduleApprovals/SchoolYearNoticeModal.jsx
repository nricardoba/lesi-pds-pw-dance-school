import React from 'react';

const SchoolYearNoticeModal = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="school-year-notice-overlay" onClick={onClose}>
      <div className="school-year-notice-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="school-year-notice-title">{title}</h3>
        <p className="school-year-notice-text">{message}</p>
        <div className="school-year-notice-actions">
          <button type="button" className="school-year-notice-btn" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolYearNoticeModal;