import '../pagesCss/HomePage.css';
import '../components/statsCards/StatsCards.css';
import '../components/schedule/Schedule.css';
import { useAuth } from '../context/AuthContext';

const TeacherStatsCards = () => {
  const { user } = useAuth();
  
  const stats = [
    { icon: "🎓", value: 45, label: "Meus Alunos", bgColor: "#eef7fb" },
    { icon: "📅", value: 3, label: "Aulas Hoje", bgColor: "#e6fcf5" },
    { icon: "✨", value: 1, label: "Coachings Pend.", bgColor: "#fff9db" },
    { icon: "⏳", value: 0, label: "Faltas por Justificar", bgColor: "#fdf2f2" },
  ];
  
  return (
    <section className="stats-section">
      <div className="stats-header">
        <div>
          <h1 className="stats-header__title">Olá, {user?.name || 'Professor'}!</h1>
          <p className="stats-header__date">{new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card__icon" style={{ backgroundColor: stat.bgColor }}>
              {stat.icon}
            </div>
            <div className="stat-card__info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const TeacherSchedule = () => (
  <section className="schedule-container">
    <div className="schedule-header">
      <h3 className="schedule-title">Minhas Aulas de Hoje</h3>
      <a href="/horario-professor" className="schedule-link">Ver horário &gt;</a>
    </div>
    <div className="schedule-list">
      <div className="class-card">
        <div className="class-time-box">
          <span>18:00</span>
        </div>
        <div className="class-info">
          <h4 className="class-name">Hip Hop Avançado</h4>
          <p className="class-details">Sala Hip Hop</p>
        </div>
        <div className="class-meta">
          <span className="class-tag">Hip Hop</span>
          <span className="class-students">3/18 alunos</span>
        </div>
      </div>
    </div>
  </section>
);

const TeacherAlerts = () => (
  <aside className="alerts-panel">
    <h3>Meus Alertas</h3>
    <div className="alert alert--pending_coaching">
      <h4>Coaching Pendente</h4>
      <p>Mariana Silva aguarda marcação</p>
    </div>
    <div className="alert alert--overdue">
      <h4>Sumário em Atraso</h4>
      <p>Hip Hop Avançado (Ontem)</p>
    </div>
  </aside>
);

const TeacherHomePage = () => {
  return (
    <div className="dashboard-grid">
      <div className="primary-column">
        <TeacherStatsCards />
        <div className="secondary-column">
          <TeacherSchedule />
        </div>
      </div>
    </div>
  );
};

export default TeacherHomePage;