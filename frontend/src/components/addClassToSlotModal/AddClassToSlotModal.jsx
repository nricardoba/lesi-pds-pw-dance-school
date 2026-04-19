import './AddClassToSlotModal.css';

const AddClassToSlotModal = ({ isOpen, onClose, slotData, rooms, onSave }) => {
  // Se não estiver aberto ou faltarem dados, não renderiza
  if (!isOpen || !slotData) return null;

  const handleModalClick = (e) => e.stopPropagation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Aqui podes depois ligar à tua lógica real de gravar a aula
    const assignmentData = {
      roomId: parseInt(formData.get('roomId')),
      day: slotData.day,
      hour: slotData.hour,
      duration: parseFloat(formData.get('duration'))
    };

    onSave(assignmentData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        
        <div className="modal-header">
          <h2 className="modal-title">Adicionar Aula ao Slot</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          
          {/* 1. Dropdown para selecionar a Sala (conforme o teu pedido) */}
          <div className="form-group full-width">
            <label>Sala</label>
            <select name="roomId" defaultValue={slotData.room.id} required>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2 mt-16">
            {/* 2. Horário (Estático baseado no clique) */}
            <div className="form-group">
              <label>Horário</label>
              <input 
                type="text" 
                value={`${slotData.day} às ${slotData.hour}`} 
                disabled 
                className="disabled-input"
              />
            </div>
            
            {/* 3. Duração (conforme o teu pedido) */}
            <div className="form-group">
              <label>Duração (horas)</label>
              <input 
                name="duration" 
                type="number" 
                step="0.5" 
                min="0.5" 
                defaultValue="1" 
                required 
              />
            </div>
          </div>

          {/* Caixa de Aviso igual à da imagem */}
          <div className="info-box mt-16">
            Não há aulas sem sala atribuída para {slotData.day}.<br/>
            Crie uma nova aula no Horário de Aulas primeiro.
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-submit">
              <span style={{ marginRight: '6px' }}>➔</span> Atribuir à Sala
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddClassToSlotModal;