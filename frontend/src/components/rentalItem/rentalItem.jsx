import './RentalItem.css';

const RentalItem = ({ rental }) => {
  const isLate = rental.status.toLowerCase() === 'atrasado';

  return (
    <div className="rental-item">
      <div className="rental-item__info">
        <h4 className="rental-title">{rental.costumeName}</h4>
        <p className="rental-student">Alugado por: {rental.studentName}</p>
        <p className="rental-dates">{rental.startDate} ➔ {rental.endDate}</p>
      </div>
      
      <div className="rental-item__actions">
        <span className="rental-price">€{rental.price.toFixed(2)}</span>
        
        <span className={`rental-status ${isLate ? 'status-late' : 'status-active'}`}>
          {rental.status}
        </span>
        
        {/* Só mostra o botão de devolver se não estiver já devolvido (embora na imagem sejam todos ativos) */}
        <button className="btn-return">Devolver</button>
      </div>
    </div>
  );
};

export default RentalItem;