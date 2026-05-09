import './RentalItem.css';

const RentalItem = ({ rental, onReturn, onViewDetails }) => {
  const isLate = rental.status.toLowerCase() === 'atrasado';
  const isReturned = rental.status.toLowerCase() === 'concluído';

  return (
    <div className="rental-item">
      <div className="rental-item__info">
        <div className="rental-title-row">
          <h4 className="rental-title">{rental.costumeName}</h4>
          <button type="button" className="btn-details" onClick={() => onViewDetails(rental)}>
            Ver detalhes
          </button>
        </div>
        <p className="rental-student">Alugado por: {rental.studentName}</p>
        <p className="rental-dates">{rental.startDate} - {rental.endDate}</p>
        {isReturned && rental.actualReturnDate && (
          <p className="rental-returned-date">Entregue em: {rental.actualReturnDate}</p>
        )}
      </div>
      
      <div className="rental-item__actions">
        <span className="rental-price">€{Number(rental.price).toFixed(2)}</span>
        
        <span className={`rental-status ${isLate ? 'status-late' : isReturned ? 'status-returned' : 'status-active'}`}>
          {rental.status}
        </span>
        
        {!isReturned && (
          <button className="btn-return" onClick={() => onReturn(rental.id)}>
            Devolver
          </button>
        )}
      </div>
    </div>
  );
};

export default RentalItem;
