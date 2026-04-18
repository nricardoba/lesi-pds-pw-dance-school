import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  // Lista de todos os itens do menu com os respetivos caminhos (rotas)
  const menuItems = [
    { path: '/', name: 'Dashboard', icon: '▦' },
    { path: '/horario', name: 'Horário de Aulas', icon: '📅' },
    { path: '/coachings', name: 'Coachings', icon: '✨' },
    { path: '/figurinos', name: 'Figurinos', icon: '👗' },
    { path: '/professores', name: 'Professores', icon: '👨‍🏫' },
    { path: '/salas', name: 'Salas', icon: '🏢' },
    { path: '/alunos', name: 'Alunos', icon: '👥' },
    { path: '/modalidades', name: 'Modalidades', icon: '📊' }
  ];

  return (
    <aside className="sidebar">
      {/* Logótipo */}
      <div className="sidebar-logo">
        <div className="logo-icon">✨</div>
        <div className="logo-text">
          <h2>Ent'Artes</h2>
          <p>Escola de Dança</p>
        </div>
      </div>

      {/* Menu de Navegação */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => 
              isActive ? "sidebar-item active" : "sidebar-item"
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-name">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-profile">
        <div className="profile-avatar">D</div>
        <div className="profile-info">
          <h4>Direção Ent'Artes</h4>
          <p>Admin</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;