import './RentalModal.css';

const RentalModal = ({ isOpen, onClose, costume, onSave }) => {
  if (!isOpen || !costume) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const rentalData = {
      id: Date.now(),
      costumeName: costume.title,
      studentName: formData.get('student'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      price: parseFloat(formData.get('price')),
      status: 'Ativo'
    };

    onSave(rentalData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        
        <div className="modal-header">
          <h2 className="modal-title">Novo Aluguer</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          
          <div className="form-group full-width">
            <label>Aluno</label>
            <select name="student" defaultValue="" required>
              <option value="" disabled>Selecionar aluno</option>
              <option value="Mariana Silva">Mariana Silva</option>
              <option value="Beatriz Oliveira">Beatriz Oliveira</option>
              <option value="João Costa">João Costa</option>
            </select>
          </div>

          <div className="form-grid-2 mt-16">
            <div className="form-group">
              <label>Data Início</label>
              {/* O defaultValue aqui seria hoje num cenário real, mas na foto está dia 16/04/2026 */}
              <input name="startDate" type="date" defaultValue="2026-04-16" required />
            </div>
            <div className="form-group">
              <label>Data Fim</label>
              <input name="endDate" type="date" required />
            </div>
          </div>

          <div className="form-group mt-16" style={{ maxWidth: '50%' }}>
            <label>Preço (€)</label>
            {/* Traz o preço predefinido do figurino selecionado */}
            <input name="price" type="number" step="0.01" min="0" defaultValue={costume.price} required />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-submit">Criar Aluguer</button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default RentalModal;