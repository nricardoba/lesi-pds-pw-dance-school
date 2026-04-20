import React from 'react';

const ScheduleApprovalsStats = ({ pendingCount, approvedCount, rejectedCount }) => {
  return (
    <section className="stats-row">
      <div className="stat-card stat-card--pending">
        <span className="stat-label">Pendentes</span>
        <strong className="stat-value">{pendingCount}</strong>
      </div>
      <div className="stat-card stat-card--approved">
        <span className="stat-label">Aprovados</span>
        <strong className="stat-value">{approvedCount}</strong>
      </div>
      <div className="stat-card stat-card--rejected">
        <span className="stat-label">Rejeitados</span>
        <strong className="stat-value">{rejectedCount}</strong>
      </div>
    </section>
  );
};

export default ScheduleApprovalsStats;