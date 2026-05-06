import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './WeekNavigator.css';

const WeekNavigator = ({
  referenceDate,
  setReferenceDate,
  monthLabel,
  weekRangeLabel,
  getWeekDayClass
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const goToPreviousWeek = () => {
    const prevWeek = new Date(referenceDate);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setReferenceDate(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(referenceDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setReferenceDate(nextWeek);
  };

  return (
    <>
      <div className="calendar-picker-strip">
        <div className="calendar-picker-strip__inner">
          <button
            type="button"
            onClick={goToPreviousWeek}
            aria-label="Semana anterior"
            className="calendar-nav-btn"
          >
            ←
          </button>

          <div className="week-picker-wrapper">
            <button
              type="button"
              className="week-picker-button"
              onClick={() => setIsCalendarOpen(true)}
            >
              <span className="week-picker-icon">📅</span>
              <div className="week-picker-text">
                <span className="week-picker-month">{monthLabel}</span>
                <span className="week-picker-range">{weekRangeLabel}</span>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={goToNextWeek}
            aria-label="Próxima semana"
            className="calendar-nav-btn"
          >
            →
          </button>
        </div>
      </div>

      {isCalendarOpen && (
        <div
          className="calendar-overlay"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div
            className="calendar-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <DatePicker
              selected={referenceDate}
              onChange={(date) => {
                if (date) {
                  setReferenceDate(date);
                  setIsCalendarOpen(false);
                }
              }}
              inline
              locale="pt"
              calendarClassName="custom-week-calendar"
              dayClassName={getWeekDayClass}
              formatWeekDay={(nameOfDay) => nameOfDay.substring(0, 3)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default WeekNavigator;