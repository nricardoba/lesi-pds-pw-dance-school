import { useState, useEffect } from 'react';
import '../pagesCss/HomePage.css';
import '../components/statsCards/StatsCards.css';
import '../components/schedule/Schedule.css';

import { useAuth } from '../context/useAuth';
import { apiClient } from '../services/apiClient';

const StudentStatsCards = ({ classes }) => {
  const { user } = useAuth();
  
  const modalidades = new Set(classes.map(c => c.studioModality?.modality?.modalityName)).size;
  
  const stats = [
    { icon: "🎵", value: modalidades, label: "Modalidades", bgColor: "#eef7fb" },
    { icon: "📅", value: classes.length, label: "Total de Aulas", bgColor: "#e6fcf5" },
    { icon: "✨", value: 0, label: "Sessões Coaching", bgColor: "#fff9db" },
    { icon: "👕", value: 0, label: "Figurinos Alugados", bgColor: "#f3f0ff" },
  ];
  
  return (
    <section className="stats-section">
      <div className="stats-header">
        <div>
          <h1 className="stats-header__title">Olá, {user?.user_name || 'Aluno'}!</h1>
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

const StudentSchedule = ({ classes }) => {
  // Pegar na "Próxima aula" simulada como a primeira da lista
  const nextClass = classes.length > 0 ? classes[0] : null;

  return (
    <section className="schedule-container">
      <div className="schedule-header">
        <h3 className="schedule-title">Minha Próxima Aula</h3>
        <a href="/horario" className="schedule-link">Ver meu horário &gt;</a>
      </div>
      <div className="schedule-list">
        {nextClass ? (
          <div className="class-card">
            <div className="class-time-box">
              <span>{nextClass.classDateStart ? new Date(nextClass.classDateStart).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
            </div>
            <div className="class-info">
              <h4 className="class-name">{nextClass.studioModality?.modality?.modalityName || 'Nova Aula'}</h4>
              <p className="class-details">Sala {nextClass.studioModality?.studio?.studioName || 'S/ Sala'}</p>
            </div>
            <div className="class-meta">
              <span className="class-tag">{nextClass.studioModality?.modality?.modalityName || 'Dança'}</span>
            </div>
          </div>
        ) : (
          <p>Sem aulas agendadas.</p>
        )}
      </div>
    </section>
  );
};

const StudentAlerts = () => (
  <aside className="alerts-panel">
    <h3>Avisos</h3>
    <div className="alert alert--pending_invoice">
      <h4>Nenhum aviso</h4>
      <p>Tudo em dia!</p>
    </div>
  </aside>
);

const StudentHomePage = () => {
  const { user, token } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient('/classes', { token });
        const myClasses = data.filter(c => 
          c.userClass?.some(uc => uc.userId === user?.user_id && uc.userClassRole?.userClassRoleName === 'Aluno')
        );
        setClasses(myClasses || []);
      } catch (error) {
        console.error("Erro ao carregar dados do aluno", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.user_id) fetchStats();
  }, [user, token]);

  if (loading) return <p>A carregar...</p>;

  return (
    <div className="dashboard-grid">
      <div className="primary-column">
        <StudentStatsCards classes={classes} />
        <div className="secondary-column">
          <StudentSchedule classes={classes} />
        </div>
      </div>
    </div>
  );
};

export default StudentHomePage;