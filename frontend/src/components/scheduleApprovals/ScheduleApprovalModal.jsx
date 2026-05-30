import React from 'react';

const ScheduleApprovalModal = ({ selectedRequest, onClose, reviewVacancies, canReview }) => {
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

        <div className="slots-list">
          {selectedRequest.vacancies.map((vacancy) => (
            <div key={vacancy.id} className="slot-item slot-item--reviewable">
              <div>
                <span>{vacancy.day}</span>
                <strong>{vacancy.time}</strong>
              </div>
              {canReview && selectedRequest.status === 'Pendente' && (
                <div className="slot-actions">
                  <button
                    type="button"
                    className="slot-action-btn slot-action-btn--approve"
                    onClick={() => reviewVacancies([vacancy.id], 'Aprovado')}
                  >
                    Aprovar
                  </button>
                  <button
                    type="button"
                    className="slot-action-btn slot-action-btn--reject"
                    onClick={() => reviewVacancies([vacancy.id], 'Rejeitado')}
                  >
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="request-meta-row">
          <span>Status atual: <strong>{selectedRequest.status}</strong></span>
          {selectedRequest.decisionDate && <span>Decisão em: {selectedRequest.decisionDate}</span>}
        </div>

      </div>
    </div>
  );
};

export default ScheduleApprovalModal;