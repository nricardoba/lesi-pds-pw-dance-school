import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import '../pagesCss/TeacherDashboard.css';

const TeacherDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="teacher-dashboard-container">
      <nav className="teacher-dashboard-nav">
        <h1 className="teacher-dashboard-title">Dashboard do Professor</h1>
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </nav>

      <main className="teacher-dashboard-main">
        <div className="teacher-dashboard-card">
          <h2 className="teacher-dashboard-card-title">Bem-vindo, Professor!</h2>
          <p className="teacher-dashboard-card-text">
            Esta é a tua área reservada. Aqui podes gerir as tuas aulas e alunos.
          </p>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;