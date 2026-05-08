import React from 'react';

const DeleteConfirmModal = ({
  isOpen,
  title = "Remover",
  message,
  itemName,
  onCancel,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="delete-confirm-overlay" onClick={onCancel}>
      <div className="delete-confirm-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="delete-confirm-title">{title}</h3>
        <p className="delete-confirm-text">
          {message} <strong>{itemName}</strong>?
        </p>
        <div className="delete-confirm-actions">
          <button type="button" className="delete-cancel-btn" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="delete-confirm-btn" onClick={onConfirm}>
            Remover
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;