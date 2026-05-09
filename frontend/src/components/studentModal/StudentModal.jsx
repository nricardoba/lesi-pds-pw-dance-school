import { useState, useEffect } from 'react';
import { 
  createUser, 
  updateUser, 
  updateUserNif, 
  updateStudentNumber, 
  addUserContact,
  addUserAddress,
  getUserById
} from '../../services/users';
import { registerRequest } from '../../services/auth';
import './StudentModal.css';

const StudentModal = ({ isOpen, onClose, initialData, onSave, token }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (isOpen && initialData?.id) {
      setIsLoading(true);
      getUserById(initialData.id, token)
        .then((data) => {
          if (!active) return;
          
          const emailContact = data.userContact?.find(c => c.contact?.contactType?.contactTypeDesc?.toLowerCase() === 'email');
          const phoneContact = data.userContact?.find(c => ['telemóvel', 'phone'].includes(c.contact?.contactType?.contactTypeDesc?.toLowerCase()));
          const mainAddress = data.userAddress?.find(a => a.isMainAddress)?.address || data.userAddress?.[0]?.address;

          setStudentData({
            id: data.userId,
            name: data.userName,
            email: emailContact?.contact?.contactValue || '',
            phone: phoneContact?.contact?.contactValue || '',
            nif: data.userNIF?.userNif || '',
            student_number: data.studentNumber?.studentNumber || '',
            user_start_date: data.userStartDate ? data.userStartDate.split('T')[0] : '',
            birthdate: data.userBirthDate ? data.userBirthDate.split('T')[0] : '',
            guardianName: initialData.guardianName || '',
            guardianEmail: initialData.guardianEmail || '',
            guardianPhone: initialData.guardianPhone || '',
            address: mainAddress ? {
              street: mainAddress.streetName || '',
              postalCode: mainAddress.postalCode || '',
              locality: mainAddress.postalCodeRel?.locality?.localityName || ''
            } : (initialData.address || {})
          });
        })
        .catch((err) => {
          console.error("Erro a obter dados do aluno", err);
          if (active) setError("Erro a carregar dados do aluno.");
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    } else {
      setStudentData(initialData || null);
    }
    return () => { active = false; };
  }, [isOpen, initialData, token]);

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
    const payload = {
      userName: formData.get('name'),
      userBirthDate: formData.get('birthdate') || null,
      userStartDate: formData.get('user_start_date') || null,
      userTypeId: 3, // Tipo utilizador aluno
      userIsActive: true,
      studentNumber: formData.get('student_number') || undefined,
      userNif: formData.get('nif') || undefined,
    };

    try {
      let createdOrUpdatedUserId;

      if (isEditing) {
        await updateUser(studentData.id, { 
          userName: payload.userName, 
          userBirthDate: payload.userBirthDate, 
          userStartDate: payload.userStartDate 
        }, token);
        createdOrUpdatedUserId = studentData.id;
        
        if (payload.userNif) {
          try {
            await updateUserNif(createdOrUpdatedUserId, { userNif: payload.userNif.toString() }, token);
          } catch (nifErr) {
            console.error('Failed to update NIF', nifErr);
          }
        }
        if (payload.studentNumber) {
          try {
            await updateStudentNumber(createdOrUpdatedUserId, { studentNumber: payload.studentNumber.toString() }, token);
          } catch (stNumErr) {
            console.error('Failed to update Student Number', stNumErr);
          }
        }
        
        // Adicionar contactos (telefone e email)
        const email = formData.get('email');
        const phone = formData.get('phone');
        
        if (email) {
          try { await addUserContact(createdOrUpdatedUserId, { contactValue: email, contactTypeId: 2, isMainContact: false }, token); } catch (e) { console.error(e); }
        }
        if (phone) {
          try { await addUserContact(createdOrUpdatedUserId, { contactValue: phone, contactTypeId: 1, isMainContact: true }, token); } catch (e) { console.error(e); }
        }

        // Adicionar / Atualizar Morada
        const street = formData.get('street');
        const postalCode = formData.get('postalCode');
        const locality = formData.get('locality');

        if (street && postalCode && locality) {
          try {
            await addUserAddress(createdOrUpdatedUserId, {
              streetName: street,
              postalCode: postalCode,
              localityName: locality,
              isMainAddress: true
            }, token);
          } catch(err) {
            console.error('Failed to add/update address', err);
          }
        }
      } else {
        const response = await createUser(payload, token);
        createdOrUpdatedUserId = response.userId;
        
        const email = formData.get('email');
        const phone = formData.get('phone');
        
        // Adicionar os contactos do Estudante recém criado
        if (email) {
          try { 
            await addUserContact(createdOrUpdatedUserId, { contactValue: email, contactTypeId: 2, isMainContact: false }, token);
          } catch (e) { 
            console.error(e); 
          }
        }
        if (phone) {
          try { await addUserContact(createdOrUpdatedUserId, { contactValue: phone, contactTypeId: 1, isMainContact: true }, token); } catch (e) { console.error(e); }
        }

        // Adicionar Morada
        const street = formData.get('street');
        const postalCode = formData.get('postalCode');
        const locality = formData.get('locality');

        if (street && postalCode && locality) {
          try {
            await addUserAddress(createdOrUpdatedUserId, {
              streetName: street,
              postalCode: postalCode,
              localityName: locality,
              isMainAddress: true
            }, token);
          } catch(err) {
            console.error('Failed to add address', err);
          }
        }
      }

      onSave(); 
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao guardar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || (isEditing && !studentData)) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={handleModalClick}>
          <div className="modal-header">
            <h2 className="modal-title">{modalTitle}</h2>
            <button className="modal-close-btn" onClick={onClose} disabled={isSubmitting}>&times;</button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>A carregar informações do aluno...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        
        <div className="modal-header">
          <h2 className="modal-title">{modalTitle}</h2>
          <button className="modal-close-btn" onClick={onClose} disabled={isSubmitting}>&times;</button>
        </div>

        <form className="modal-form scrollable-form" onSubmit={handleSubmit}>
          
          {error && <div className="error-message" style={{color: 'red', marginBottom: '15px'}}>{error}</div>}

          <div className="form-group full-width">
            <label>Nome do Aluno</label>
            <input name="name" type="text" defaultValue={isEditing ? studentData.name : ''} required />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Número de Aluno</label>
              <input name="student_number" type="text" defaultValue={isEditing ? studentData.student_number : ''} required />
            </div>
            <div className="form-group">
              <label>NIF (Opcional)</label>
              <input name="nif" type="text" defaultValue={isEditing ? studentData.nif : ''} />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Data de Início</label>
              <input name="user_start_date" type="date" defaultValue={isEditing ? studentData.user_start_date : ''} required />
            </div>
            <div className="form-group">
              <label>Data de Nascimento</label>
              <input name="birthdate" type="date" defaultValue={isEditing ? studentData.birthdate : ''} required />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" defaultValue={isEditing ? studentData.email : ''} required />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input name="phone" type="tel" defaultValue={isEditing ? studentData.phone : ''} required />
            </div>
          </div>

          <div style={{ display: 'none' }}>
            <h3 className="section-divider">Encarregado de Educação</h3>

            <div className="form-group full-width">
              <label>Nome do Encarregado</label>
              <input name="guardianName" type="text" defaultValue={isEditing ? studentData.guardianName : ''} />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Email do Encarregado</label>
                <input name="guardianEmail" type="email" defaultValue={isEditing ? studentData.guardianEmail : ''} />
              </div>
              <div className="form-group">
                <label>Telefone do Encarregado</label>
                <input name="guardianPhone" type="tel" defaultValue={isEditing ? studentData.guardianPhone : ''} />
              </div>
            </div>
          </div>

          <div className="form-group full-width mt-16">
            <label>Rua / Morada</label>
            <input name="street" type="text" defaultValue={isEditing ? (studentData.address?.street || studentData.address) : ''} placeholder="Nome da rua, nº, porta" />
          </div>
          
          <div className="form-grid-2">
            <div className="form-group">
              <label>Código Postal</label>
              <input name="postalCode" type="text" defaultValue={isEditing ? studentData.address?.postalCode : ''} placeholder="Ex: 4000-123" />
            </div>
            <div className="form-group">
              <label>Localidade</label>
              <input name="locality" type="text" defaultValue={isEditing ? studentData.address?.locality : ''} placeholder="Ex: Porto" />
            </div>
          </div>

          <div className="form-group full-width mt-16" style={{ display: 'none' }}>
            <label>Notas</label>
            <textarea name="notes" rows="3" defaultValue={isEditing ? studentData.notes : ''}></textarea>
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