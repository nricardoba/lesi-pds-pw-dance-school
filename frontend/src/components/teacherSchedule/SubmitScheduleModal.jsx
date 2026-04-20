import React, { useMemo, useState } from 'react';

const WEEK_DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const HOURS = Array.from({ length: 12 }, (_, index) => `${String(8 + index).padStart(2, '0')}:00`);

const toHourNumber = (hourText) => Number(hourText.split(':')[0]);

export const buildSlotRanges = (selectedKeys) => {
  const groupedByDay = WEEK_DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {});

  selectedKeys.forEach((key) => {
    const [day, hourText] = key.split('|');
    groupedByDay[day].push(toHourNumber(hourText));
  });

  const slotRanges = [];
  let idCounter = 1;

  WEEK_DAYS.forEach((day) => {
    const hours = [...groupedByDay[day]].sort((a, b) => a - b);
    if (hours.length === 0) {
      return;
    }

    let start = hours[0];
    let previous = hours[0];

    for (let i = 1; i <= hours.length; i += 1) {
      const current = hours[i];
      const isBreak = current !== previous + 1;

      if (isBreak) {
        const startText = `${String(start).padStart(2, '0')}:00`;
        const endText = `${String(previous + 1).padStart(2, '0')}:00`;
        slotRanges.push({ id: idCounter, day: `${day}-feira`, time: `${startText} - ${endText}` });
        idCounter += 1;
        start = current;
      }

      previous = current;
    }
  });

  return slotRanges;
};

const SubmitScheduleModal = ({ isOpen, onClose, onSubmit, teacherName }) => {
  const [selectedSlots, setSelectedSlots] = useState([]);

  const selectedSlotsCount = selectedSlots.length;
  const selectedSlotRangesPreview = useMemo(() => buildSlotRanges(selectedSlots), [selectedSlots]);

  const toggleSlot = (day, hour) => {
    const key = `${day}|${hour}`;
    setSelectedSlots((previous) =>
      previous.includes(key) ? previous.filter((slotKey) => slotKey !== key) : [...previous, key]
    );
  };

  const handleClose = () => {
    setSelectedSlots([]);
    onClose();
  };

  const handleSubmit = () => {
    if (selectedSlotsCount === 0) {
      return;
    }

    const newSlots = buildSlotRanges(selectedSlots);
    onSubmit(newSlots, selectedSlotsCount);
    setSelectedSlots([]);
  };

  if (!isOpen) return null;

  return (
    <div className="teacher-schedule-modal-overlay" onClick={handleClose}>
      <div className="teacher-schedule-modal" onClick={(event) => event.stopPropagation()}>
        <div className="teacher-schedule-modal__header">
          <h2 className="teacher-schedule-modal__title">Disponibilidade - {teacherName}</h2>
          <button type="button" className="teacher-schedule-modal__close" onClick={handleClose}>
            ×
          </button>
        </div>

        <p className="teacher-schedule-modal__legend">
          Legenda: As células verdes indicam horários disponíveis. As células cinzas indicam horários não disponíveis.
        </p>

        <div className="teacher-schedule-modal__grid-wrapper">
          <div className="teacher-schedule-modal__grid-header">
            <span>Hora</span>
            {WEEK_DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {HOURS.map((hour) => (
            <div key={hour} className="teacher-schedule-modal__grid-row">
              <span className="teacher-schedule-modal__hour">{hour}</span>
              {WEEK_DAYS.map((day) => {
                const slotKey = `${day}|${hour}`;
                const isSelected = selectedSlots.includes(slotKey);

                return (
                  <button
                    key={slotKey}
                    type="button"
                    className={`teacher-schedule-cell ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSlot(day, hour)}
                    aria-label={`${day} às ${hour}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="teacher-schedule-modal__footer">
          <span>{selectedSlotsCount} slots selecionados</span>
          <div className="teacher-schedule-modal__actions">
            <button type="button" className="modal-cancel-btn" onClick={handleClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="modal-submit-btn"
              onClick={handleSubmit}
              disabled={selectedSlotsCount === 0}
            >
              Enviar para Aprovação
            </button>
          </div>
        </div>

        {selectedSlotRangesPreview.length > 0 && (
          <div className="teacher-schedule-modal__preview">
            {selectedSlotRangesPreview.slice(0, 4).map((slot) => (
              <span key={`${slot.day}-${slot.time}`} className="teacher-schedule-modal__preview-item">
                {slot.day}: {slot.time}
              </span>
            ))}
            {selectedSlotRangesPreview.length > 4 && (
              <span className="teacher-schedule-modal__preview-item">
                +{selectedSlotRangesPreview.length - 4} blocos
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitScheduleModal;