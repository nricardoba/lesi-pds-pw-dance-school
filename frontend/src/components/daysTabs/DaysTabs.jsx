import './DaysTabs.css';

const DaysTabs = ({ days, activeDay, onSelectDay }) => {
  return (
    <div className="days-tabs">
      {days.map(day => (
        <button
          key={day}
          className={`day-tab ${activeDay === day ? 'active' : ''}`}
          onClick={() => onSelectDay(day)}
        >
          {day}
        </button>
      ))}
    </div>
  );
};

export default DaysTabs;