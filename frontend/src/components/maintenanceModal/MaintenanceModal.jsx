import './MaintenanceModal.css';

const MaintenanceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Evita que o clique dentro da caixa branca feche o modal
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        
        {/* Cabeçalho do Modal */}
        <div className="modal-header">
          <h2 className="modal-title">Agendar Manutenção</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Formulário */}
        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          
          {/* Sala (Largura total) */}
          <div className="form-group full-width">
            <label>Sala</label>
            <select defaultValue="">
              <option value="" disabled>Selecionar sala</option>
              <option value="principal">Sala Principal</option>
              <option value="ballet">Sala Ballet</option>
              <option value="hiphop">Sala Hip Hop</option>
              <option value="pequeno">Estúdio Pequeno</option>
            </select>
          </div>

          {/* Datas (Lado a lado usando a grelha) */}
          <div className="form-grid-2 mt-16">
            <div className="form-group">
              <label>Data Início</label>
              <input type="date" />
            </div>
            <div className="form-group">
              <label>Data Fim</label>
              <input type="date" />
            </div>
          </div>

          {/* Motivo (Largura total) */}
          <div className="form-group full-width mt-16">
            <label>Motivo</label>
            <textarea rows="4"></textarea>
          </div>

          {/* Botões de Ação */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-submit">Agendar</button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default MaintenanceModal;