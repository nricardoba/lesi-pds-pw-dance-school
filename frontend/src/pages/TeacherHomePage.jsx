import '../pagesCss/HomePage.css';
import { useState, useEffect } from 'react';
import '../components/statsCards/StatsCards.css';
import '../components/schedule/Schedule.css';
import { useAuth } from '../context/useAuth';
import { apiClient } from '../services/apiClient';

const TeacherStatsCards = ({ classes, myStudentsCount }) => {
  const { user } = useAuth();
  
  const stats = [
    { icon: "🎓", value: myStudentsCount, label: "Meus Alunos", bgColor: "#eef7fb" },
    { icon: "📅", value: classes.length, label: "Total de Aulas", bgColor: "#e6fcf5" },
    { icon: "✨", value: 0, label: "Coachings Pend.", bgColor: "#fff9db" },
    { icon: "⏳", value: 0, label: "Faltas por Just.", bgColor: "#fdf2f2" },
  ];
  
  return (
    <section className="stats-section">
      <div className="stats-header">
        <div>
          <h1 className="stats-header__title">Olá, {user?.user_name || 'Professor'}!</h1>
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

const TeacherSchedule = ({ classes }) => {
  const todayClasses = classes.slice(0, 3); // Apenas um resumo

  return (
    <section className="schedule-container">
      <div className="schedule-header">
        <h3 className="schedule-title">As Minhas Aulas</h3>
        <a href="/horario-professor" className="schedule-link">Ver horário &gt;</a>
      </div>
      <div className="schedule-list">
        {todayClasses.length > 0 ? todayClasses.map((c, i) => (
          <div className="class-card" key={i}>
            <div className="class-time-box">
              <span>{c.classDateStart ? new Date(c.classDateStart).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
            </div>
            <div className="class-info">
              <h4 className="class-name">{c.studioModality?.modality?.modalityName || 'Nova Aula'}</h4>
              <p className="class-details">Sala {c.studioModality?.studio?.studioName || 'S/ Sala'}</p>
            </div>
            <div className="class-meta">
              <span className="class-tag">{c.studioModality?.modality?.modalityName || 'Dança'}</span>
              <span className="class-students">{c.userClass?.filter(uc => uc.userClassRole?.userClassRoleName === 'Aluno').length || 0} alunos</span>
            </div>
          </div>
        )) : (
          <p>Sem aulas atribuídas.</p>
        )}
      </div>
    </section>
  );
};

const TeacherAlerts = () => (
  <aside className="alerts-panel">
    <h3>Meus Alertas</h3>
    <div className="alert alert--pending_coaching">
      <h4>Nenhum aviso</h4>
      <p>Tudo em dia!</p>
    </div>
  </aside>
);

const TeacherHomePage = () => {
  const { user, token } = useAuth();
  const [classes, setClasses] = useState([]);
  const [myStudentsCount, setMyStudentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient('/classes', { token });
        const myClasses = data.filter(c => 
          c.userClass?.some(uc => uc.userId === user?.user_id && uc.userClassRole?.userClassRoleName === 'Professor')
        );
        setClasses(myClasses || []);

        const studentsSet = new Set();
        myClasses.forEach(c => {
          c.userClass?.forEach(uc => {
            if (uc.userClassRole?.userClassRoleName === 'Aluno') {
              studentsSet.add(uc.userId);
            }
          });
        });
        setMyStudentsCount(studentsSet.size);

      } catch (error) {
        console.error("Erro ao carregar dados do professor", error);
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
        <TeacherStatsCards classes={classes} myStudentsCount={myStudentsCount} />
        <div className="secondary-column">
          <TeacherSchedule classes={classes} />
        </div>
      </div>
    </div>
  );
};

export default TeacherHomePage;