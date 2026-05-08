import './FilteredDayClasses.css';

const FilteredDayClasses = ({ day, classes, onEditClass, onDeleteClass, role }) => {
  return (
    <div className="filtered-day-classes">
      <h2 className="filtered-day-classes__title">Aulas de {day}</h2>
      <div className="classes-list">
        {classes.map((classItem) => {
          // Calcula a hora de término para exibir no card
          const endHour = classItem.start + classItem.duration;
          const formatTime = (hour) => {
            const h = Math.floor(hour);
            const m = Math.round((hour - h) * 60);
            return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
          };

          return (
            <div key={classItem.id} className="detailed-class-card">
              <div className="detailed-class-time">
                <span>{formatTime(classItem.start)}</span>
                <span className="end-time">{formatTime(endHour)}</span>
              </div>

              <div className="detailed-class-info">
                <h4 className="detailed-class-name">{classItem.categoryName || classItem.name}</h4>
                <p className="detailed-class-details">
                  {[classItem.instructorName || classItem.instructor, classItem.roomName || classItem.room].filter(Boolean).join(' • ')}
                </p>
              </div>

              <div className="detailed-class-meta">
                {classItem.level ? (
                  <span className={`detailed-class-level level-${classItem.level.toLowerCase()}`}>
                    {classItem.level}
                  </span>
                ) : null}
                <span className="detailed-class-category">{classItem.categoryName || classItem.category}</span>
                <span className="detailed-class-students">👥 {classItem.occupancy} alunos</span>
              </div>

              {role === 'admin' && (
                <div className="detailed-class-actions">
                  <button
                    className="icon-btn edit-btn"
                    onClick={() => onEditClass(classItem)}
                  >
                    ✎
                  </button>
                  <button className="icon-btn delete-btn" onClick={() => onDeleteClass(classItem)}>❌</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilteredDayClasses;