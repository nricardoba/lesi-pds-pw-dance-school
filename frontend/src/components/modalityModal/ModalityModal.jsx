import './ModalityModal.css';

const ModalityModal = ({ isOpen, onClose, initialData, onSave }) => {
  if (!isOpen) return null;

  const isEditing = !!initialData;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const modalityData = {
      modality_id: isEditing ? (initialData.modalityId || initialData.modality_id) : Date.now(),
      modality_name: formData.get('modality_name'),
      modality_hourly_fee: parseFloat(formData.get('modality_hourly_fee'))
    };

    onSave(modalityData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'Editar Modalidade' : 'Nova Modalidade'}</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
         
          <div className="form-group full-width">
            <label>Nome da Modalidade (Ex: Ballet Classico)</label>
            <input
              name="modality_name"
              type="text"
              defaultValue={isEditing ? (initialData.modalityName || initialData.modality_name) : ''}
              required
            />
          </div>

          <div className="form-group full-width mt-16">
            <label>Preço por Hora </label>
            <input
              name="modality_hourly_fee"
              type="number"
              step="0.01"
              min="0"
              defaultValue={isEditing ? (initialData.modalityHourlyFee || initialData.modality_hourly_fee || 0) : ''}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalityModal;

