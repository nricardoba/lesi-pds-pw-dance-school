import './Schedule.css';

const Schedule = () => {
  const classesToday = [
    {
      id: 1,
      time: '18:00',
      title: 'Hip Hop Avançado',
      instructor: 'Ricardo Santos',
      room: 'Sala Hip Hop',
      category: 'Hip Hop',
      students: '3/18'
    },
  ];

  return (
    <section className="schedule-container">
      <div className="schedule-header">
        <h3 className="schedule-title">Aulas de Hoje</h3>
        <a href="/horario" className="schedule-link">Ver horario &gt;</a>
      </div>

      <div className="schedule-list">
        {classesToday.map((item) => (
          <div key={item.id} className="class-card">
            <div className="class-time-box">
              <span>{item.time}</span>
            </div>
            
            <div className="class-info">
              <h4 className="class-name">{item.title}</h4>
              <p className="class-details">
                {item.instructor} na {item.room}
              </p>
            </div>

            <div className="class-meta">
              <span className="class-tag">{item.category}</span>
              <span className="class-students">{item.students} alunos</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Schedule;
