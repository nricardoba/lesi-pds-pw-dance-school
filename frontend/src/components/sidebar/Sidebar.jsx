import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  
  // A role vem de user.user_type_desc e vem do backend (ex: "Admin", "Teacher", "Student")
  const role = user?.user_type_desc?.toLowerCase();

  // Lista de todos os itens do menu com os respetivos caminhos (rotas)
  let menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '▦' },
    { path: '/horario', name: 'Horário de Aulas', icon: '📅' },
    { path: '/coachings', name: 'Coachings', icon: '✨' },
    { path: '/figurinos', name: 'Figurinos', icon: '👗' },
    { path: '/professores', name: 'Professores', icon: '👨‍🏫' },
    { path: '/salas', name: 'Salas', icon: '🏢' },
    { path: '/alunos', name: 'Alunos', icon: '👥' },
    { path: '/templates-aulas', name: 'Templates de Aulas', icon: '▶' },
  ];

   if (role === 'admin') {
    menuItems.push({ path: '/aprovacao-horarios', name: 'Aprovação Horários', icon: '✅' });
  }

  if (role === 'student' || role === 'aluno') {
    const allowedForStudent = ['/dashboard', '/horario', '/coachings', '/figurinos', '/professores'];
    menuItems = menuItems.filter(item => allowedForStudent.includes(item.path));
  }
  
   if (role === 'teacher' || role === 'professor') {
    menuItems.splice(2, 0, { path: '/horario-professor', name: 'Meu Horário', icon: '🧭' });
  }

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
        <div className="profile-avatar">{user?.user_name?.[0] || 'D'}</div>
        <div className="profile-info">
          <h4>{user?.user_name || 'Direção'}</h4>
          <p>{role}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;