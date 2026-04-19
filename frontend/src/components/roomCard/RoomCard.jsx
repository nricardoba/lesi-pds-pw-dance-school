import './RoomCard.css';

const RoomCard = ({ room , onEdit }) => {
  return (
    <div className="room-card">
      <div className="room-card__header">
        <div className="room-card__title-area">
          <div className="room-icon">🏢</div>
          <div>
            <h3 className="room-name">{room.name}</h3>
            <span className={`room-size-tag tag-${room.size.toLowerCase()}`}>
              {room.size}
            </span>
          </div>
        </div>
        <div className="room-card__actions">
          <button 
            className="icon-btn edit-btn" 
            title="Editar"
            onClick={onEdit}
          >
            ✎
          </button>
          <button className="icon-btn delete-btn" title="Eliminar">🗑️</button>
        </div>
      </div>

      <div className="room-card__capacity">
        <span className="capacity-icon">👥</span> {room.capacity} pessoas
      </div>

      <div className="room-card__equipment">
        {room.equipment.map((item, index) => (
          <span key={index} className="equipment-tag">{item}</span>
        ))}
      </div>
    </div>
  );
};

export default RoomCard;