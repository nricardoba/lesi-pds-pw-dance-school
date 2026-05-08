import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import './Sidebar.css';

const Sidebar = () => {
  const { user, role } = useAuth();

  let menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '▦' },
    { path: '/horario', name: 'Horário de Aulas', icon: '📅' },
    { path: '/coachings', name: 'Coachings', icon: '✨' },
    { path: '/figurinos', name: 'Figurinos', icon: '👗' },
    { path: '/professores', name: 'Professores', icon: '👨‍🏫' },
    { path: '/estudios', name: 'Estúdios', icon: '🏢' },
    { path: '/alunos', name: 'Alunos', icon: '👥' },
    { path: '/templates-aulas', name: 'Templates de Aulas', icon: '▶' },
    { path: '/modalidades', name: 'Modalidades', icon: '🩰' },
  ];

  if (role === 'admin') {
    menuItems.push({ path: '/aprovacao-horarios', name: 'Aprovação Horários', icon: '✅' });
  }

  if (role === 'student') {
    const allowedForStudent = ['/dashboard', '/horario', '/coachings', '/figurinos', '/professores'];
    menuItems = menuItems.filter((item) => allowedForStudent.includes(item.path));
  }

  if (role === 'teacher') {
    menuItems.splice(2, 0, { path: '/horario-professor', name: 'Meu Horário', icon: '🧭' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">✨</div>
        <div className="logo-text">
          <h2>Ent'Artes</h2>
          <p>Escola de Dança</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? 'sidebar-item active' : 'sidebar-item')}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-name">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-profile">
        <div className="profile-avatar">{user?.user_name?.[0] || 'U'}</div>
        <div className="profile-info">
          <h4>{user?.user_name || 'Utilizador'}</h4>
          <p>{role || 'sem perfil'}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
