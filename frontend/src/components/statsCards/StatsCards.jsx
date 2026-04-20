import './StatsCards.css';

const StatsCards = () => {
const stats = [
    { icon: "👥", value: 6, label: "Total de Alunos", color: "#eef7fb" },
    { icon: "🎓", value: 3, label: "Professores", color: "#fdf2f2" },
    { icon: "📅", value: 9, label: "Aulas Agendadas", color: "#e6fcf5" },
    { icon: "✨", value: 2, label: "Coachings Pendentes", color: "#fff9db" },
    { icon: "👕", value: 0, label: "Figurinos Ativos", color: "#f3f0ff" },
    { icon: "🧾", value: 2, label: "Faturas Pendentes", color: "#fff5f5" },
  ]
  return (
   <section className="stats-section">
      <div className="stats-header">
        <div>
          <h1 className="stats-header__title">Dashboard</h1>
          <p className="stats-header__date">Quinta, 9 de abril de 2026</p>
        </div>
        
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div 
              className="stat-card__icon" 
              style={{ backgroundColor: stat.bgColor }}
            >
              {stat.icon}
            </div>
            <div className="stat-card__info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
       
  );
};

export default StatsCards