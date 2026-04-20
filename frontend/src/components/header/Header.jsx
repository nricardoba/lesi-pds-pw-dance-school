import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const { role, setRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
  <header className="header">
      <div className="header__actions">
        <button 
          onClick={handleLogout}
          style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header