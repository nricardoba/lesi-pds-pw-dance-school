import './RoomModal.css';

const RoomModal = ({ isOpen, onClose, initialData, onSave }) => {
  if (!isOpen) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Sala' : 'Nova Sala';
  const submitButtonText = isEditing ? 'Guardar' : 'Criar Sala';

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const roomData = {
      id: isEditing ? initialData.id : Date.now(),
      studio_name: formData.get('name'),
      studio_max_capacity: parseInt(formData.get('capacity'), 10),
      // Transforma a string de modalidades num array
      modalities: formData.get('modalities') ? formData.get('modalities').split(',').map(item => item.trim()).filter(Boolean) : [],
      notes: formData.get('notes')
    };

    onSave(roomData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        
        <div className="modal-header">
          <h2 className="modal-title">{modalTitle}</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          
          <div className="form-group full-width">
            <label>Nome da Sala</label>
            <input name="name" type="text" defaultValue={isEditing ? (initialData.studio_name || initialData.name) : ''} required />
          </div>

          <div className="form-grid-2 mt-16">
            <div className="form-group">
              <label>Capacidade Máxima</label>
              <input name="capacity" type="number" defaultValue={isEditing ? (initialData.studio_max_capacity || initialData.capacity) : '20'} required />
            </div>
            <div className="form-group">
              <label>Modalidades (separadas por vírgula)</label>
              <input 
                name="modalities" 
                type="text" 
                placeholder="Ex: Ballet, Hip Hop" 
                defaultValue={isEditing && initialData.modalities ? initialData.modalities.join(', ') : ''} 
              />
            </div>
          </div>

          <div className="form-group full-width mt-16">
            <label>Notas</label>
            <textarea name="notes" rows="4" defaultValue={isEditing ? initialData.notes : ''}></textarea>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-submit">{submitButtonText}</button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default RoomModal;