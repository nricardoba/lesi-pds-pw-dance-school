import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './weekNavigator.css';


const WeekNavigator = ({
    referenceDate,
    setReferenceDate,
    monthLabel,
    weekRangeLabel,
    getWeekDayClass
}) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const goToPreviousWeek = () => {
        const prevDay = new Date(referenceDate);
        prevDay.setDate(prevDay.getDate() - 1);
        setReferenceDate(prevDay);
    };

    const goToNextWeek = () => {
        const nextDay = new Date(referenceDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setReferenceDate(nextDay);
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsCalendarOpen(false);
            }
        };

        if (isCalendarOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCalendarOpen]);

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
                <div className="calendar-overlay" onClick={() => setIsCalendarOpen(false)}>
                    <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
                        <DatePicker
                            inline
                            selected={referenceDate}
                            openToDate={referenceDate}
                            onChange={(date) => {
                                if (date) {
                                    setReferenceDate(date);
                                    setIsCalendarOpen(false);
                                }
                            }}
                            calendarClassName="custom-week-calendar"
                            dayClassName={(date) => {
                                const baseClass = getWeekDayClass(date);

                                const isReferenceDay =
                                    date.getFullYear() === referenceDate.getFullYear() &&
                                    date.getMonth() === referenceDate.getMonth() &&
                                    date.getDate() === referenceDate.getDate();

                                return `${baseClass}${isReferenceDay ? ' reference-day' : ''}`.trim();
                            }}
                            formatWeekDay={(nameOfDay) => nameOfDay.substring(0, 3)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default WeekNavigator;