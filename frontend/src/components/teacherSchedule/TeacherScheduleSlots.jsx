import React from 'react';

const TeacherScheduleSlots = ({ availableSlots }) => {
  return (
    <section className="slots-section">
      <h3 className="section-title">Horários disponíveis</h3>
      {availableSlots.length === 0 ? (
        <p className="slots-empty-state">Sem horários enviados. Clica em "Enviar Novo Horário" para submeter disponibilidade.</p>
      ) : (
        <div className="slots-grid">
          {availableSlots.map((slot) => (
            <div key={slot.id} className="slot-card">
              <div className="slot-day">
                <span className="calendar-icon">📅</span> {slot.day}
              </div>
              <div className="slot-time">
                <span className="clock-icon">🕒</span> {slot.time}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TeacherScheduleSlots;