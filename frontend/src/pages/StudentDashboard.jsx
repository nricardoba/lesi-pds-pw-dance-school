import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import '../pagesCss/StudentDashboard.css';

const StudentDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="student-dashboard-container">
      <nav className="student-dashboard-nav">
        <h1 className="student-dashboard-title">Dashboard do Aluno</h1>
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </nav>

      <main className="student-dashboard-main">
        <div className="student-dashboard-card">
          <h2 className="student-dashboard-card-title">Bem-vindo, Aluno!</h2>
          <p className="student-dashboard-card-text">
            Esta é a tua área reservada. Aqui podes consultar os teus horários e progresso.
          </p>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;