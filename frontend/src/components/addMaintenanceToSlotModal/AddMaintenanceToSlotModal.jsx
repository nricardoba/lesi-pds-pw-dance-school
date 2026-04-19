import '../AddClassToSlotModal/AddClassToSlotModal.css';

const AddMaintenanceToSlotModal = ({ isOpen, onClose, slotData, rooms, onSave }) => {
  if (!isOpen || !slotData) return null;

  const handleModalClick = (e) => e.stopPropagation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Cria o objeto da manutenção com os dados do slot e do formulário
    const maintenanceData = {
      id: Date.now(), // Gera um ID único provisório
      roomId: parseInt(formData.get('roomId')),
      room: rooms.find(r => r.id === parseInt(formData.get('roomId')))?.name, // Busca o nome da sala para a grelha
      day: slotData.day,
      time: slotData.hour,
      duration: parseFloat(formData.get('duration')),
      reason: formData.get('reason')
    };

    onSave(maintenanceData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        
        <div className="modal-header">
          <h2 className="modal-title">Bloquear para Manutenção</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          
          {/* Dropdown para selecionar/confirmar a Sala */}
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
            {/* Horário (Estático baseado no clique) */}
            <div className="form-group">
              <label>Horário Inicial</label>
              <input 
                type="text" 
                value={`${slotData.day} às ${slotData.hour}`} 
                disabled 
                className="disabled-input"
              />
            </div>
            
            {/* Duração em horas */}
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

          {/* Motivo da Manutenção */}
          <div className="form-group full-width mt-16">
            <label>Motivo</label>
            <textarea 
              name="reason" 
              rows="3" 
              placeholder="Ex: Reparação do piso, Limpeza profunda..." 
              required
            ></textarea>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-submit" style={{ backgroundColor: '#D97706' }}>
              <span style={{ marginRight: '6px' }}>🔧</span> Agendar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddMaintenanceToSlotModal;