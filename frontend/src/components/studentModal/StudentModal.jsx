import './StudentModal.css';

const StudentModal = ({ isOpen, onClose, initialData, onSave }) => {
  if (!isOpen) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Aluno' : 'Novo Aluno';
  const submitButtonText = isEditing ? 'Guardar' : 'Criar Aluno';

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const phone = formData.get('phone');
    
    const studentData = {
      id: isEditing ? initialData.id : Date.now(),
      name: formData.get('name'),
      student_number: formData.get('student_number'),
      nif: formData.get('nif'),
      user_start_date: formData.get('user_start_date'),
      email,
      phone,
      contacts: [
        { type: 'email', value: email },
        { type: 'phone', value: phone }
      ],
      birthdate: formData.get('birthdate'),
      guardianName: formData.get('guardianName'),
      guardianEmail: formData.get('guardianEmail'),
      guardianPhone: formData.get('guardianPhone'),
      address: {
        street: formData.get('street'),
        postalCode: formData.get('postalCode'),
        locality: formData.get('locality')
      },
      notes: formData.get('notes'),
      // Se for edição mantém a cor, se for novo, atribui uma cor padrão (ou podias fazer uma função para gerar cores aleatórias pastel)
      avatarColor: isEditing ? initialData.avatarColor : '#E0E7FF' 
    };

    onSave(studentData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        
        <div className="modal-header">
          <h2 className="modal-title">{modalTitle}</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Adicionei uma class scrollable para o caso do ecrã ser pequeno, o formulário não sair por fora */}
        <form className="modal-form scrollable-form" onSubmit={handleSubmit}>
          
          {/* --- DADOS DO ALUNO --- */}
          <div className="form-group full-width">
            <label>Nome do Aluno</label>
            <input name="name" type="text" defaultValue={isEditing ? initialData.name : ''} required />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Número de Aluno</label>
              <input name="student_number" type="text" defaultValue={isEditing ? initialData.student_number : ''} required />
            </div>
            <div className="form-group">
              <label>NIF</label>
              <input name="nif" type="text" defaultValue={isEditing ? initialData.nif : ''} required />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Data de Início</label>
              <input name="user_start_date" type="date" defaultValue={isEditing ? initialData.user_start_date : ''} required />
            </div>
            <div className="form-group">
              <label>Data de Nascimento</label>
              <input name="birthdate" type="date" defaultValue={isEditing ? initialData.birthdate : ''} required />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" defaultValue={isEditing ? (initialData.contacts?.find(c => c.type === 'email')?.value || initialData.email) : ''} required />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input name="phone" type="tel" defaultValue={isEditing ? (initialData.contacts?.find(c => c.type === 'phone')?.value || initialData.phone) : ''} required />
            </div>
          </div>

          {/* --- DADOS DO ENCARREGADO --- */}
          <h3 className="section-divider">Encarregado de Educação</h3>

          <div className="form-group full-width">
            <label>Nome do Encarregado</label>
            <input name="guardianName" type="text" defaultValue={isEditing ? initialData.guardianName : ''} required />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Email do Encarregado</label>
              <input name="guardianEmail" type="email" defaultValue={isEditing ? initialData.guardianEmail : ''} />
            </div>
            <div className="form-group">
              <label>Telefone do Encarregado</label>
              <input name="guardianPhone" type="tel" defaultValue={isEditing ? initialData.guardianPhone : ''} required />
            </div>
          </div>

          <div className="form-group full-width mt-16">
            <label>Rua / Morada</label>
            <input name="street" type="text" defaultValue={isEditing ? (initialData.address?.street || initialData.address) : ''} />
          </div>
          
          <div className="form-grid-2">
            <div className="form-group">
              <label>Código Postal</label>
              <input name="postalCode" type="text" defaultValue={isEditing ? initialData.address?.postalCode : ''} />
            </div>
            <div className="form-group">
              <label>Localidade</label>
              <input name="locality" type="text" defaultValue={isEditing ? initialData.address?.locality : ''} />
            </div>
          </div>

          <div className="form-group full-width mt-16">
            <label>Notas</label>
            <textarea name="notes" rows="3" defaultValue={isEditing ? initialData.notes : ''}></textarea>
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

export default StudentModal;