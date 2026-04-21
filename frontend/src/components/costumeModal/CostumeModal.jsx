import './CostumeModal.css';

const CostumeModal = ({ isOpen, onClose, initialData, onSave }) => {
  if (!isOpen) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Figurino' : 'Novo Figurino';
  const submitButtonText = isEditing ? 'Guardar' : 'Criar Figurino';

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const costumeData = {
      id: isEditing ? initialData.id : Date.now(),
      title: formData.get('title'),
      category: formData.get('category'),
      size: formData.get('size'),
      color: formData.get('color'),
      condition: formData.get('condition'),
      isRental: true,
      price: parseFloat(formData.get('price') || 0),
      lateFee: parseFloat(formData.get('lateFee') || 0),
      image: formData.get('image'),
      description: formData.get('description'),
      status: 'Disponível'
    };

    onSave(costumeData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        
        <div className="modal-header">
          <h2 className="modal-title">{modalTitle}</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form className="modal-form scrollable-form" onSubmit={handleSubmit}>
          
          <div className="form-group full-width">
            <label>Nome</label>
            <input name="title" type="text" placeholder="Ex: Tutu Branco" defaultValue={isEditing ? initialData.title : ''} required />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Categoria</label>
              <input name="category" type="text" placeholder="Ex: Ballet, Hip Hop" defaultValue={isEditing ? initialData.category : ''} required />
            </div>
            <div className="form-group">
              <label>Tamanho</label>
              <select name="size" defaultValue={isEditing ? initialData.size : ''} required>
                <option value="" disabled>Selecionar</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Cor</label>
              <select name="color" defaultValue={isEditing ? initialData.color : ''} required>
                <option value="" disabled>Selecionar</option>
                <option value="Branco">Branco</option>
                <option value="Preto">Preto</option>
                <option value="Vermelho">Vermelho</option>
                <option value="Azul">Azul</option>
              </select>
            </div>
            <div className="form-group">
              <label>Condição</label>
              <select name="condition" defaultValue={isEditing ? initialData.condition : 'Novo'} required>
                <option value="Novo">Novo</option>
                <option value="Bom">Bom Estado</option>
                <option value="Gasto">Gasto</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Modo</label>
              <input type="text" value="Aluguer" readOnly />
            </div>
            <div className="form-group">
              <label>Preço (€)</label>
              <input name="price" type="number" step="0.01" min="0" defaultValue={isEditing ? initialData.price : '0'} required />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Multa/dia (€)</label>
              <input name="lateFee" type="number" step="0.01" min="0" defaultValue={isEditing ? initialData.lateFee : '0'} />
            </div>
            <div className="form-group">
              
            </div>
          </div>

          <div className="form-group full-width mt-16">
            <label>URL da Imagem</label>
            <input name="image" type="url" placeholder="https://..." defaultValue={isEditing ? initialData.image : ''} required />
          </div>

          <div className="form-group full-width mt-16">
            <label>Descrição</label>
            <textarea name="description" rows="3" defaultValue={isEditing ? initialData.description : ''}></textarea>
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

export default CostumeModal;