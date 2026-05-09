import './DaysTabs.css';

const DaysTabs = ({
  days,
  dayEntries,
  viewMode,
  selectedDay,
  onSelectDay,
  currentWeek = [],
  currentWeekForSchedule = [],
  todayDateIso = ''
}) => {
  const toLocalIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const usingLegacyProps = Array.isArray(days) && days.length > 0;
  const daysToShow = Array.isArray(dayEntries) && dayEntries.length > 0
    ? dayEntries
    : usingLegacyProps
      ? days.map((day) => ({ day, short: day.slice(0, 3).toUpperCase(), date: '' }))
      : (viewMode === 'daily' ? currentWeek : currentWeekForSchedule);
  const activeValue = usingLegacyProps ? selectedDay : selectedDay;

  return (
    <div className="days-tabs">
      {viewMode === 'weekly' && (
        <button
          type="button"
          className={`day-tab day-tab--all ${activeValue === 'Todos os dias' ? 'active' : ''}`}
          onClick={() => onSelectDay('Todos os dias')}
        >
          <span className="day-tab__short">TODOS</span>
          <span className="day-tab__date">Dias</span>
        </button>
      )}

      {daysToShow.map((dayObj) => {
        const dayIsoDate = dayObj.isoDate || (dayObj.fullDate ? toLocalIsoDate(new Date(dayObj.fullDate)) : '');

        return (
          <button
            key={dayObj.day}
            type="button"
            className={`day-tab ${activeValue === dayObj.day ? 'active' : ''} ${todayDateIso && dayIsoDate === todayDateIso ? 'day-tab--today' : ''}`.trim()}
            onClick={() => onSelectDay(dayObj.day)}
          >
            <span className="day-tab__short">{dayObj.short}</span>
            <span className="day-tab__date">{dayObj.date || ''}</span>
          </button>
        );
      })}
    </div>
  );
};

export default DaysTabs;