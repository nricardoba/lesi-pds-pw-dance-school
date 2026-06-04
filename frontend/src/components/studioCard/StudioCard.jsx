import './StudioCard.css';

const StudioCard = ({ studio , onEdit }) => {
  return (
    <div className="studio-card">
      <div className="studio-card__header">
        <div className="studio-card__title-area">
          <div className="studio-icon">🏢</div>
          <div>
            <h3 className="studio-name">{studio.name}</h3>
            <span className={`studio-size-tag tag-${studio.size.toLowerCase()}`}>
              {studio.size}
            </span>
          </div>
        </div>
        <div className="studio-card__actions">
          <button 
            className="icon-btn edit-btn" 
            title="Editar"
            onClick={onEdit}
          >
            ✏️
          </button>
          <button className="icon-btn delete-btn" title="Eliminar">🗑️</button>
        </div>
      </div>

      <div className="studio-card__capacity">
        <span className="capacity-icon">👥</span> {studio.capacity} pessoas
      </div>

      <div className="studio-card__modalities">
        <span className="studio-card__modalities-label">Modalidades</span>
        <div className="studio-card__equipment">
          {Array.isArray(studio.modalities) && studio.modalities.length > 0 ? (
            studio.modalities.map((item, index) => (
              <span key={index} className="equipment-tag">{item}</span>
            ))
          ) : (
            <span className="studio-card__modalities-empty">Sem modalidades associadas</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioCard;
