import './Header.css';

const Header = () => {
  return (
  <header className="header">
      <div className="header__actions">
        <button className="header__action-btn header__action-btn--direcao">Direção</button>
        <button className="header__action-btn header__action-btn--notif">
          <span className="header__notif-icon">🔔</span>        
        </button>
        <div className="header__user-dropdown">
          <span className="header__user-avatar">D</span>
          <p>Direção Ent'Artes</p>
        </div>
      </div>
    </header>
  )
}

export default Header