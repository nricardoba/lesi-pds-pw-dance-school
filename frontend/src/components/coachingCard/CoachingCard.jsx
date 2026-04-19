import './CoachingCard.css';

const CoachingCard = ({ data, onAccept, onReject, hideActions }) => {
  // Define classes baseadas no status
  const statusClass = data.status.toLowerCase();

  return (
    <div className={`coaching-card card-${statusClass}`}>
      <div className="coaching-card__header">
        <div>
          <h4 className="coaching-card__student">{data.student}</h4>
          <p className="coaching-card__teacher">com {data.teacher}</p>
        </div>
        <span className={`coaching-status-tag tag-${statusClass}`}>
          {data.status}
        </span>
      </div>

      <div className="coaching-card__details">
        <p className="detail-item">
          <span className="icon">🕒</span> {data.date}
        </p>
        {data.duration && (
          <p className="detail-item">
            <span className="icon">⏳</span> {data.duration}
          </p>
        )}
        {data.room && (
          <p className="detail-item">
            <span className="icon">📍</span> {data.room}
          </p>
        )}
      </div>

      {data.note && (
        <div className="coaching-card__note">
          {data.note}
        </div>
      )}

      {!hideActions && data.status === 'Pendente' && (
        <div className="coaching-card__actions" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button 
            onClick={onAccept}
            style={{ flex: 1, padding: '6px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            Aceitar
          </button>
          <button 
            onClick={onReject}
            style={{ flex: 1, padding: '6px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            Rejeitar
          </button>
        </div>
      )}
      
      {data.rejectReason && data.status === 'Rejeitado' && (
        <div className="coaching-card__note" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
          <strong>Motivo:</strong> {data.rejectReason}
        </div>
      )}
    </div>
  );
};

export default CoachingCard;