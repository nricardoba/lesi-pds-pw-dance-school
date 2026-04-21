import './RentalModal.css';

const RentalModal = ({ isOpen, onClose, costume, onSave, students = [] }) => {
  if (!isOpen || !costume) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
  
    const studentId = parseInt(formData.get('studentId'), 10);

    const rentalData = {
      // Backend ignorara estes, mas mantemos caso precisemos no frontend
      costumeName: costume.title,
      studentId: studentId,
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      price: parseFloat(formData.get('price'))
    };

    onSave(rentalData);
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
            <select name="studentId" defaultValue="" required>
              <option value="" disabled>Selecionar aluno</option>
              {students.map(std => (
                <option key={std.userId || std.id} value={std.userId || std.id}>
                  {std.userName || std.name}
                </option>
              ))}
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