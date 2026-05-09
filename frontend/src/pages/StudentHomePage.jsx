import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import '../pagesCss/StudentDashboard.css';

const StudentHomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="student-home-container">
      <section className="student-hero">
        <div>
          <h1>Olá, {user?.user_name || 'Aluno'}!</h1>
          <p>Consulta a tua área pessoal, horários, aulas e informações importantes.</p>
        </div>
      </section>

      <section className="student-cards-grid">
        <a href="/horario" className="student-card">
          <span>📅</span>
          <div>
            <h3>Horário</h3>
            <p>Consulta horário de aulas.</p>
          </div>
        </a>

        <a href="/perfil" className="student-card">
          <span>👤</span>
          <div>
            <h3>Perfil</h3>
            <p>Consulta e atualiza os teus dados pessoais.</p>
          </div>
        </a>

        <a href="/figurinos" className="student-card">
          <span>🎒</span>
          <div>
            <h3>Figurinos</h3>
            <p>Consulta os figurinos disponíveis e alugados.</p>
          </div>
        </a>
      </section>
    </div>
  );
};

export default StudentHomePage;