import './AddClassToSlotModal.css';

const AddClassToSlotModal = ({ isOpen, onClose, slotData, studios, onSave }) => {
  // Se não estiver aberto ou faltarem dados, não renderiza
  if (!isOpen || !slotData) return null;

  const handleModalClick = (e) => e.stopPropagation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
  
    const assignmentData = {
      studioId: parseInt(formData.get('studioId')),
      day: slotData.day,
      hour: slotData.hour,
      duration: parseFloat(formData.get('duration')),
      className: formData.get('className') || 'Aula',
      teacher: formData.get('teacher') || 'A Definir'
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
          
          {/* 1. Dropdown para selecionar a Estúdio (conforme o teu pedido) */}
          <div className="form-group full-width">
            <label>Estúdio</label>
            <select name="studioId" defaultValue={slotData.studio.id} required>
              {studios.map(studio => (
                <option key={studio.id} value={studio.id}>
                  {studio.name}
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

          <div className="form-grid-2 mt-16">
            <div className="form-group">
              <label>Nome da Aula</label>
              <input name="className" type="text" placeholder="Ex: Ballet Iniciação" />
            </div>
            <div className="form-group">
              <label>Professor</label>
              <input name="teacher" type="text" placeholder="Nome do professor" />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-submit">
              <span style={{ marginRight: '6px' }}>➔</span> Atribuir à Estúdio
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddClassToSlotModal;