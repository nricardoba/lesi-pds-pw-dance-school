import '../pagesCss/HomePage.css';
import { useState, useEffect } from 'react';
import '../components/statsCards/StatsCards.css';
import '../components/schedule/Schedule.css';
import { useAuth } from '../context/useAuth';
import { apiClient } from '../services/apiClient';

const getRoleDesc = (uc) =>
  uc.userClassRole?.userClassRoleDesc ||
  uc.userClassRole?.userClassRoleName ||
  '';

const TeacherStatsCards = ({ classes, myStudentsCount }) => {
  const { user } = useAuth();

  const stats = [
    { icon: '🎓', value: myStudentsCount, label: 'Meus Alunos', bgColor: '#eef7fb' },
    { icon: '📅', value: classes.length, label: 'Total de Aulas', bgColor: '#e6fcf5' },
    { icon: '✨', value: 0, label: 'Coachings Pendentes', bgColor: '#fff9db' },
    { icon: '⏳', value: 0, label: 'Validações Pendentes', bgColor: '#fdf2f2' },
  ];

  return (
    <section className="stats-section">
      <div className="stats-header">
        <div>
          <h1 className="stats-header__title">
            Olá, {user?.user_name || user?.userName || 'Professor'}!
          </h1>
          <p className="stats-header__date">
            {new Date().toLocaleDateString('pt-PT', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
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

const TeacherQuickActions = () => (
  <section className="quick-actions">
    <h2>Ações rápidas</h2>

    <div className="quick-actions-grid">
      <a href="/horario-professor" className="quick-action-card">
        <span>📅</span>
        <div>
          <h3>O meu horário</h3>
          <p>Consultar aulas atribuídas e horários.</p>
        </div>
      </a>

      <a href="/coachings" className="quick-action-card">
        <span>✨</span>
        <div>
          <h3>Coachings</h3>
          <p>Consultar sessões e validações associadas.</p>
        </div>
      </a>

      <a href="/perfil" className="quick-action-card">
        <span>👤</span>
        <div>
          <h3>Perfil</h3>
          <p>Consultar e atualizar dados pessoais.</p>
        </div>
      </a>
    </div>
  </section>
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

        const myClasses = data.filter((c) =>
          c.userClass?.some((uc) => {
            const roleDesc = getRoleDesc(uc);

            return (
              uc.userId === user?.user_id &&
              (
                roleDesc === 'Professor' ||
                roleDesc === 'Professor Responsável' ||
                roleDesc === 'Professor Assistente'
              )
            );
          })
        );

        setClasses(myClasses || []);

        const studentsSet = new Set();

        myClasses.forEach((c) => {
          c.userClass?.forEach((uc) => {
            if (getRoleDesc(uc) === 'Aluno') {
              studentsSet.add(uc.userId);
            }
          });
        });

        setMyStudentsCount(studentsSet.size);
      } catch (error) {
        console.error('Erro ao carregar dados do professor', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id && token) {
      fetchStats();
    }
  }, [user, token]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <p className="loading-message">A carregar dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">
        <div className="primary-column">
          <h1 className="stats-header__title">
            Olá, {user?.user_name || user?.userName || 'Professor'}!
          </h1>
          <TeacherQuickActions />

          <div className="secondary-column">

          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherHomePage;