import '../pagesCss/HomePage.css';
import StatsCards from "../components/statsCards/StatsCards";
import Schedule from "../components/schedule/Schedule";
import TeacherHomePage from "./TeacherHomePage";
import StudentHomePage from "./StudentHomePage";
import { useAuth } from "../context/useAuth";

const HomePage = () => {
  const { role } = useAuth();

  if (role === 'teacher') {
    return <TeacherHomePage />;
  }

  if (role === 'student') {
    return <StudentHomePage />;
  }

  return (
      <div className="dashboard-page">
        <h1>Dashboard, Seja bem vindo {role}</h1>
        <div className="dashboard-grid">
          <div className="primary-column">
            

        <div className="quick-actions">
          <h2>Ações rápidas</h2>

          <div className="quick-actions-grid">
            <a href="/horario" className="quick-action-card">
              <span>📅</span>
              <div>
                <h3>Gerir aulas</h3>
                <p>Criar, editar e consultar aulas.</p>
              </div>
            </a>

            <a href="/alunos" className="quick-action-card">
              <span>👥</span>
              <div>
                <h3>Gerir utilizadores</h3>
                <p>Consultar alunos</p>
              </div>
            </a>

            <a href="/figurinos-venda" className="quick-action-card">
              <span>💸</span>
              <div>
                <h3>Venda de Figurinos</h3>
                <p>Figurinos de alunos e professores.</p>
              </div>
            </a>

            <a href="/figurinos-catalogo" className="quick-action-card">
              <span>🏫</span>
              <div>
                <h3>Catálogo da Escola</h3>
                <p>Aluguer e histórico de figurinos alugados.</p>
              </div>
            </a>

            <a href="/estudios" className="quick-action-card">
              <span>🏫</span>
              <div>
                <h3>Estúdios</h3>
                <p>Gerir salas e modalidades associadas.</p>
              </div>
            </a>
          </div>
        </div>

        <div className="secondary-column">
        </div>
      </div>
    </div>
  </div>
);
};

export default HomePage;