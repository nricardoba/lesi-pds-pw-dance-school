import React from 'react';

const ScheduleApprovalModal = ({ selectedRequest, onClose, markRequest, canReview }) => {
  if (!selectedRequest) return null;

  return (
    <div className="request-modal-overlay" onClick={onClose}>
      <div className="request-modal" onClick={(event) => event.stopPropagation()}>
        <div className="request-modal-header">
          <h2>Pedido de Horário - {selectedRequest.teacherName}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <p className="request-modal-note">{selectedRequest.note}</p>

        <div className="slots-list">
          {selectedRequest.slots.map((slot) => (
            <div key={`${selectedRequest.id}-${slot.day}-${slot.time}`} className="slot-item">
              <span>{slot.day}</span>
              <strong>{slot.time}</strong>
            </div>
          ))}
        </div>

        <div className="request-meta-row">
          <span>Status atual: <strong>{selectedRequest.status}</strong></span>
          {selectedRequest.decisionDate && <span>Decisão em: {selectedRequest.decisionDate}</span>}
        </div>

        <div className="request-modal-actions">
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Fechar
          </button>
          {canReview && selectedRequest.status === 'Pendente' && (
            <>
              <button
                type="button"
                className="modal-approve-btn"
                onClick={() => markRequest(selectedRequest.id, 'Aprovado')}
              >
                Aprovar Pedido
              </button>
              <button
                type="button"
                className="modal-reject-btn"
                onClick={() => markRequest(selectedRequest.id, 'Rejeitado')}
              >
                Rejeitar Pedido
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleApprovalModal;