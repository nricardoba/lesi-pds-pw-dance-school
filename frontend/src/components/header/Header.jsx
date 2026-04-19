import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { role, setRole } = useAuth();

  return (
  <header className="header">
      <div className="header__actions">
        <select 
          className="header__action-btn header__action-btn--direcao" 
          value={role} 
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Direção</option>
          <option value="teacher">Professor</option>
          <option value="student">Aluno</option>
        </select>
        <button className="header__action-btn header__action-btn--notif">
          <span className="header__notif-icon">🔔</span>        
        </button>
      </div>
    </header>
  )
}

export default Header