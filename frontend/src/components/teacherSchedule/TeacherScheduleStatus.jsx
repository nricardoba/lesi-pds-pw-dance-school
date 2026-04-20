import React from 'react';

const statusContentOptions = {
  aprovado: {
    icon: '✔️',
    title: 'Horário aprovado',
    text: 'O teu horário foi aprovado pela direção. Agora podes receber marcações de aulas nos horários disponibilizados.'
  },
  pendente: {
    icon: '⏳',
    title: 'Horário em análise',
    text: 'A direção ainda está a analisar os horários enviados. Iremos atualizar o estado assim que houver decisão.'
  },
  rejeitado: {
    icon: '⚠️',
    title: 'Horário rejeitado',
    text: 'Foram identificados conflitos de disponibilidade. Consulta o histórico e ajusta os blocos para novo envio.'
  }
};

const TeacherScheduleStatus = ({ currentStatus }) => {
  const statusKey = currentStatus.status.toLowerCase();
  const currentStatusContent = statusContentOptions[statusKey] || statusContentOptions.pendente;

  return (
    <section className={`status-section ${statusKey}`}>
      <div className="status-header">
        <h2 className="section-title">Estado atual</h2>
        <span className={`status-badge ${statusKey}`}>
          {currentStatus.status}
        </span>
      </div>

      <div className="status-metrics">
        <div className="metric">
          <span className="metric-label">Data de Envio</span>
          <span className="metric-value">{currentStatus.submissionDate}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Data de Revisão</span>
          <span className="metric-value">{currentStatus.reviewDate}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Total de Horários</span>
          <span className="metric-value">{currentStatus.totalSlots} slots</span>
        </div>
      </div>

      <div className="status-message-box">
        <div className="icon-wrapper">
          <span>{currentStatusContent.icon}</span>
        </div>
        <div>
          <h4 className="message-title">{currentStatusContent.title}</h4>
          <p className="message-text">{currentStatusContent.text}</p>
        </div>
      </div>
    </section>
  );
};

export default TeacherScheduleStatus;