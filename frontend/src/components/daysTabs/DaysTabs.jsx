import './DaysTabs.css';

const DaysTabs = ({
  viewMode,
  selectedDay,
  onSelectDay,
  currentWeek = [],
  currentWeekForSchedule = []
}) => {
  const daysToShow = viewMode === 'daily' ? currentWeek : currentWeekForSchedule;

  return (
    <div className="days-tabs">
      {viewMode === 'weekly' && (
        <button
          type="button"
          className={`day-tab day-tab--all ${selectedDay === 'Todos os dias' ? 'active' : ''}`}
          onClick={() => onSelectDay('Todos os dias')}
        >
          <span className="day-tab__short">TODOS</span>
          <span className="day-tab__date">Dias</span>
        </button>
      )}

      {daysToShow.map((dayObj) => (
        <button
          key={dayObj.day}
          type="button"
          className={`day-tab ${selectedDay === dayObj.day ? 'active' : ''}`}
          onClick={() => onSelectDay(dayObj.day)}
        >
          <span className="day-tab__short">{dayObj.short}</span>
          <span className="day-tab__date">{dayObj.date}</span>
        </button>
      ))}
    </div>
  );
};

export default DaysTabs;