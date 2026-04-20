import React from 'react';

const TeacherScheduleHistory = ({ history }) => {
  return (
    <section className="history-section">
      <h3 className="section-title history-title">
        <span className="history-icon">⏱️</span> Histórico de envios ({history.length})
      </h3>
      <div className="history-list">
        {history.map((item) => (
          <div key={item.id} className="history-card">
            <div className="history-top">
              <span className="history-date">Enviado em {item.date}</span>
              <span className={`status-badge ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
            </div>
            <p className="history-details">{item.details}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeacherScheduleHistory;