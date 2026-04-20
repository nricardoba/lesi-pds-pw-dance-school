import { useState } from 'react';
import { createUser, updateUser } from '../../services/users';
import './StudentModal.css';

const StudentModal = ({ isOpen, onClose, initialData, onSave, token }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Aluno' : 'Novo Aluno';
  const submitButtonText = isEditing ? (isSubmitting ? 'A guardar...' : 'Guardar') : (isSubmitting ? 'A criar...' : 'Criar Aluno');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.target);
    
    const studentUserTypeId = 3; 

    // Valores do formulário base
    const payload = {
      userName: formData.get('name'),
      userBirthDate: formData.get('birthdate') || null,
      userStartDate: formData.get('user_start_date') || null,
      userTypeId: studentUserTypeId,
      userIsActive: true,
      studentNumber: formData.get('student_number') || undefined,
      userNif: formData.get('nif') || undefined,
    };

    try {
      let createdOrUpdatedUserId;

      if (isEditing) {
        // --- ATUALIZAR ---
        await updateUser(initialData.id, { userName: payload.userName, userBirthDate: payload.userBirthDate, userStartDate: payload.userStartDate }, token);
        createdOrUpdatedUserId = initialData.id;
        
        // Futuramente farás chamadas aqui para atualizar nif, student number, ou adicionar novos contactos em falta
        // Exemplo:
        // await updateUser(initialData.id, { userNif: payload.userNif }, token);
      } else {
        // --- CRIAR NOVO ---
        const response = await createUser(payload, token);
          
        createdOrUpdatedUserId = response.userId;
      }

      // Finalizado sem erros
      onSave(); 
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao guardar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        
        <div className="modal-header">
          <h2 className="modal-title">{modalTitle}</h2>
          <button className="modal-close-btn" onClick={onClose} disabled={isSubmitting}>&times;</button>
        </div>

        <form className="modal-form scrollable-form" onSubmit={handleSubmit}>
          
          {error && <div className="error-message" style={{color: 'red', marginBottom: '15px'}}>{error}</div>}

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
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>{submitButtonText}</button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default StudentModal;