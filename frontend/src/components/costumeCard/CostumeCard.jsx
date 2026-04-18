import './CostumeCard.css';

  // Define a cor da tag de estado baseada no valor
 const CostumeCard = ({ costume, onEdit, onRent, onDelete }) => {
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'disponível': return 'status-available';
      case 'alugado': return 'status-rented';
      default: return 'status-default';
    }
  };

  return (
    <div className="costume-card">
      {/* Área da Imagem */}
      <div className="costume-card__image-container">
        <img src={costume.image} alt={costume.title} className="costume-image" />
        
        {/* Tag de Estado no canto superior direito */}
        <span className={`status-badge ${getStatusClass(costume.status)}`}>
          {costume.status}
        </span>

        {/* Ações rápidas (Editar/Eliminar) - Normalmente visíveis em hover ou para admin */}
        <div className="costume-card__image-actions">
          <button 
            className="icon-btn edit-btn-overlay" 
            title="Editar"
            onClick={onEdit}
          >
            ✎
          </button>
          <button className="icon-btn delete-btn-overlay" title="Eliminar" onClick={onDelete}>🗑️</button>
        </div>
      </div>

      {/* Conteúdo do Cartão */}
      <div className="costume-card__content">
        <h3 className="costume-title">{costume.title}</h3>
        
        <div className="costume-meta">
          <span className="category-tag">{costume.category}</span>
          <span className="size-text">Tam: {costume.size}</span>
          <span className="size-text">Condição: {costume.condition}</span>
          <span className="size-text">Cor: {costume.color}</span>
        </div>

        <div className="costume-price-row">
          <div className="price-info">
            <span className="price-value">€{costume.price.toFixed(2)}</span>
            {costume.isRental && <span className="price-suffix">/aluguer</span>}
          </div>
          <span className="stock-info">{costume.stock} disponíveis</span>
        </div>

        <button 
          className="btn-action-full" 
          onClick={onRent}
          disabled={costume.status === 'Alugado' || costume.stock === 0}
        >
          🛍️ {costume.actionText || 'Alugar'}
        </button>
      </div>
    </div>
  );
};

export default CostumeCard;