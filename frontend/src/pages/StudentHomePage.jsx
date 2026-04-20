import '../pagesCss/HomePage.css';
import '../components/statsCards/StatsCards.css';
import '../components/schedule/Schedule.css';

import { useAuth } from '../context/AuthContext';

const StudentStatsCards = () => {
  const { user } = useAuth();
  
  const stats = [
    { icon: "🎵", value: 2, label: "Modalidades", bgColor: "#eef7fb" },
    { icon: "📅", value: 1, label: "Próxima Aula", bgColor: "#e6fcf5" },
    { icon: "✨", value: 1, label: "Sessões Coaching", bgColor: "#fff9db" },
    { icon: "👕", value: 0, label: "Figurinos Alugados", bgColor: "#f3f0ff" },
  ];
  
  return (
    <section className="stats-section">
      <div className="stats-header">
        <div>
          <h1 className="stats-header__title">Olá, {user?.name || 'Aluno'}!</h1>
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

const StudentSchedule = () => (
  <section className="schedule-container">
    <div className="schedule-header">
      <h3 className="schedule-title">Minha Próxima Aula</h3>
      <a href="/horario" className="schedule-link">Ver meu horário &gt;</a>
    </div>
    <div className="schedule-list">
      <div className="class-card">
        <div className="class-time-box">
          <span>19:30</span>
        </div>
        <div className="class-info">
          <h4 className="class-name">Ballet Intermédio</h4>
          <p className="class-details">Ana Costa • Sala Clássica</p>
        </div>
        <div className="class-meta">
          <span className="class-tag">Ballet</span>
        </div>
      </div>
    </div>
  </section>
);

const StudentAlerts = () => (
  <aside className="alerts-panel">
    <h3>Avisos</h3>
    <div className="alert alert--pending_invoice">
      <h4>Mensalidade Pendente</h4>
      <p>Fevereiro de 2026</p>
    </div>
    <div className="alert alert--pending_coaching">
      <h4>Coaching Confirmado</h4>
      <p>Amanhã às 17:00</p>
    </div>
  </aside>
);

const StudentHomePage = () => {
  return (
    <div className="dashboard-grid">
      <div className="primary-column">
        <StudentStatsCards />
        <div className="secondary-column">
          <StudentSchedule />
        </div>
      </div>
    </div>
  );
};

export default StudentHomePage;