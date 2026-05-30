import React from 'react';

const ScheduleApprovalsTable = ({ filteredRequests, onSelectRequest, reviewVacancies, canReview }) => {
  return (
    <section className="table-container">
      <div className="table-header">
        <span>PROFESSOR</span>
        <span>ENVIADO EM</span>
        <span>ANO LETIVO</span>
        <span>STATUS</span>
        <span>AÇÕES</span>
      </div>

      <div className="table-body">
        {filteredRequests.map((request) => (
          <div key={request.id} className="table-row">
            <div className="teacher-col">
              <strong>{request.teacherName}</strong>
              <span className="request-id">Pedido #{request.vacancyIds.join(', ')}</span>
            </div>
            <span className="date-col">{request.submittedAt}</span>
            <span className="year-col">{request.schoolYearName}</span>
            <span className={`status-badge ${request.status.toLowerCase()}`}>{request.status}</span>
            <div className="actions-col">
              <button
                type="button"
                className="action-btn action-btn--view"
                onClick={() => onSelectRequest(request.id)}
              >
                Ver Detalhes
              </button>
              {canReview && request.status === 'Pendente' && (
                <div className="decision-actions">
                  <button
                    type="button"
                    className="action-btn action-btn--approve"
                    onClick={() => reviewVacancies(request.vacancyIds, 'Aprovado')}
                  >
                    Aprovar tudo
                  </button>
                  <button
                    type="button"
                    className="action-btn action-btn--reject"
                    onClick={() => reviewVacancies(request.vacancyIds, 'Rejeitado')}
                  >
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="empty-results">Sem pedidos para os filtros selecionados.</div>
        )}
      </div>
    </section>
  );
};

export default ScheduleApprovalsTable;