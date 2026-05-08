import React, { useEffect, useRef, useState } from 'react';
import './TeacherModal.css';
import { readExtraFeesFromStorage, writeExtraFeesToStorage } from '../../utils/scheduleStorage';
import { 
  createUser, 
  updateUser, 
  updateUserNif, 
  addUserContact,
  addUserAddress,
  getUserById
} from '../../services/users';
import { registerRequest } from '../../services/auth';
import { getModalities } from '../../services/modalities';

const TeacherModal = ({ isOpen, onClose, initialData, onSave, token }) => {
  const specialtiesRef = useRef(null);
  const [specialtiesOpen, setSpecialtiesOpen] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [availableModalities, setAvailableModalities] = useState([]);
  
  // Extra fee state
  const [extraFeeCost, setExtraFeeCost] = useState('');
  const [extraFeeReason, setExtraFeeReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (isOpen) {
      getModalities(token).then((data) => {
        if (active && data) {
          setAvailableModalities(data);
        }
      }).catch(err => console.error("Erro a carregar modalidades:", err));
    }
    
    if (isOpen && initialData?.user_id) {
      setIsLoading(true);
      getUserById(initialData.user_id, token)
        .then((data) => {
          if (!active) return;
          
          const emailContact = data.userContact?.find(c => c.contact?.contactType?.contactTypeDesc?.toLowerCase() === 'email');
          const phoneContact = data.userContact?.find(c => ['telemóvel', 'phone'].includes(c.contact?.contactType?.contactTypeDesc?.toLowerCase()));
          const mainAddress = data.userAddress?.find(a => a.isMainAddress)?.address || data.userAddress?.[0]?.address;

          setTeacherData({
            id: data.userId,
            name: data.userName,
            email: emailContact?.contact?.contactValue || '',
            phone: phoneContact?.contact?.contactValue || '',
            nif: data.userNIF?.userNif || '',
            user_start_date: data.userStartDate ? data.userStartDate.split('T')[0] : '',
            birthdate: data.userBirthDate ? data.userBirthDate.split('T')[0] : '',
            address: mainAddress ? {
              street: mainAddress.streetName || '',
              postalCode: mainAddress.postalCode || '',
              locality: mainAddress.postalCodeRel?.locality?.localityName || ''
            } : {},
            modalities: data.userModality ? data.userModality.map(um => um.modalityId) : []
          });
          setSelectedSpecialties(data.userModality ? data.userModality.map(um => um.modalityId) : []);
        })
        .catch((err) => {
          console.error("Erro a obter dados do professor", err);
          if (active) setError("Erro a carregar dados do professor.");
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    } else {
      setTeacherData(initialData || null);
      setSelectedSpecialties([]);
    }

    setSpecialtiesOpen(false);

    const allFees = readExtraFeesFromStorage();
    const existingFee = allFees.find(f => f.teacher === initialData?.name);
    if (existingFee) {
      setExtraFeeCost(existingFee.cost.toString());
      setExtraFeeReason(existingFee.reason);
    } else {
      setExtraFeeCost('');
      setExtraFeeReason('');
    }

    return () => { active = false; };
  }, [initialData, isOpen, token]);

  useEffect(() => {
    const handleDocumentMouseDown = (event) => {
      if (!specialtiesOpen) {
        return;
      }

      if (specialtiesRef.current && !specialtiesRef.current.contains(event.target)) {
        setSpecialtiesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [specialtiesOpen]);

  if (!isOpen) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Professor' : 'Novo Professor';
  const submitButtonText = isEditing ? (isSubmitting ? 'A guardar...' : 'Guardar') : (isSubmitting ? 'A criar...' : 'Criar Professor');

  const toggleSpecialty = (specialty) => {
    setSelectedSpecialties((currentSpecialties) =>
      currentSpecialties.includes(specialty)
        ? currentSpecialties.filter((item) => item !== specialty)
        : [...currentSpecialties, specialty]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.target);
    const teacherName = formData.get('name');

    const payload = {
      userName: teacherName,
      userBirthDate: formData.get('birthdate') || null,
      userStartDate: formData.get('user_start_date') || null,
      userTypeId: 2, // Tipo utilizador professor
      userIsActive: true,
      userNif: formData.get('nif') || undefined,
      modalities: selectedSpecialties,
    };
    
    try {
      let createdOrUpdatedUserId;

      if (isEditing) {
        await updateUser(teacherData.id, { 
          userName: payload.userName,
          userBirthDate: payload.userBirthDate,
          userStartDate: payload.userStartDate,
          modalities: payload.modalities
        }, token);
        createdOrUpdatedUserId = teacherData.id;
        
        if (payload.userNif) {
          try {
            await updateUserNif(createdOrUpdatedUserId, { userNif: payload.userNif.toString() }, token);
          } catch (nifErr) {
            console.error('Failed to update NIF', nifErr);
          }
        }

        const email = formData.get('email');
        const phone = formData.get('phone');
        
        if (email) {
          try { await addUserContact(createdOrUpdatedUserId, { contactValue: email, contactTypeId: 2, isMainContact: false }, token); } catch (e) { console.error(e); }
        }
        if (phone) {
          try { await addUserContact(createdOrUpdatedUserId, { contactValue: phone, contactTypeId: 1, isMainContact: true }, token); } catch (e) { console.error(e); }
        }
        
        // Morada
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
        
        if (email) {
          try { 
            await addUserContact(createdOrUpdatedUserId, { contactValue: email, contactTypeId: 2, isMainContact: false }, token); 
            
            // Criar password automático: <prof@dataNascimento>
            // Ex: dataNascimento="2010-01-13" -> password: "prof@20100113"
            let birthStr = '12345678';
            if (payload.userBirthDate) {
              // Converte "YYYY-MM-DD" para "YYYYMMDD"
              birthStr = payload.userBirthDate.replace(/-/g, '');
            }
          
            
            await registerRequest(email, autoPassword);
          } catch (e) { console.error(e); }
        }
        if (phone) {
          try { await addUserContact(createdOrUpdatedUserId, { contactValue: phone, contactTypeId: 1, isMainContact: true }, token); } catch (e) { console.error(e); }
        }
        
        // Morada
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

      // Save extra fee logic
      let allFees = readExtraFeesFromStorage();
      if (isEditing && initialData?.name) {
        allFees = allFees.filter(f => f.teacher !== initialData.name);
      }
      allFees = allFees.filter(f => f.teacher !== teacherName);

      if (extraFeeCost && extraFeeReason) {
        allFees.push({
          id: Date.now(),
          teacher: teacherName,
          reason: extraFeeReason,
          cost: parseFloat(extraFeeCost)
        });
      }
      writeExtraFeesToStorage(allFees);

      onSave(); 
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao guardar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || (isEditing && !teacherData)) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={handleModalClick}>
          <div className="modal-header">
            <h2 className="modal-title">{modalTitle}</h2>
            <button className="modal-close-btn" onClick={onClose} disabled={isSubmitting}>&times;</button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>A carregar informações do professor...</p>
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
          <button type="button" className="modal-close-btn" onClick={onClose} disabled={isSubmitting}>&times;</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="error-message" style={{color: 'red', marginBottom: '15px'}}>{error}</div>}

          <div className="form-group full-width">
            <label>Nome</label>
            <input name="name" type="text" defaultValue={teacherData ? teacherData.name : ''} required />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Data de Nascimento</label>
              <input name="birthdate" type="date" defaultValue={teacherData?.birthdate || ''} />
            </div>
            <div className="form-group">
              <label>Data de Início</label>
              <input name="user_start_date" type="date" defaultValue={teacherData?.user_start_date || ''} />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" defaultValue={teacherData ? teacherData.email : ''} required />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input name="phone" type="tel" defaultValue={teacherData ? teacherData.phone : ''} required />
            </div>
          </div>
          
          <div className="form-group">
            <label>NIF (Opcional)</label>
            <input name="nif" type="text" defaultValue={teacherData?.nif || ''} />
          </div>
          
          <div className="form-group full-width mt-16">
            <h4 style={{ margin: '0 0 10px 0', color: '#334155' }}>Morada</h4>
            <div className="form-grid-2" style={{ marginBottom: '10px' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Rua</label>
                <input name="street" type="text" defaultValue={teacherData?.address?.street || ''} placeholder="Nome da rua, nº, porta" />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Código Postal</label>
                <input name="postalCode" type="text" defaultValue={teacherData?.address?.postalCode || ''} placeholder="Ex: 4000-123" />
              </div>
              <div className="form-group">
                <label>Localidade</label>
                <input name="locality" type="text" defaultValue={teacherData?.address?.locality || ''} placeholder="Ex: Porto" />
              </div>
            </div>
          </div>

          <div className="form-group full-width mt-16 specialty-field" ref={specialtiesRef}>
            <label>Modalidades</label>
            <button
              type="button"
              className="specialty-select-trigger"
              onClick={() => setSpecialtiesOpen((currentValue) => !currentValue)}
              aria-expanded={specialtiesOpen}
            >
              <span>{selectedSpecialties.length === 0 ? 'Selecionar modalidades' : availableModalities.filter(m => selectedSpecialties.includes(m.modalityId)).map(m => m.modalityName).join(', ')}</span>
              <span className="specialty-select-arrow">▾</span>
            </button>

            {specialtiesOpen && (
              <div className="specialty-options">
                {availableModalities.map((modality) => (
                  <label key={modality.modalityId} className="specialty-option">
                    <input
                      type="checkbox"
                      checked={selectedSpecialties.includes(modality.modalityId)}
                      onChange={() => toggleSpecialty(modality.modalityId)}
                    />
                    <span>{modality.modalityName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'none' }}>
            <div className="form-group full-width mt-16">
              <label>URL da Foto</label>
              <input 
                name="avatar"
                type="url" 
                placeholder="https://..." 
                defaultValue={initialData?.avatar || ''}
              />
            </div>

            <div className="form-grid-2 mt-16">
              <div className="form-group">
                <label>Custo Extra Coaching (€) <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>(Opcional)</span></label>
                <input 
                  name="extraFeeCost" 
                  type="number" 
                  step="0.01" 
                  value={extraFeeCost} 
                  onChange={(e) => setExtraFeeCost(e.target.value)} 
                  placeholder="Ex: 15" 
                />
              </div>
              <div className="form-group">
                <label>Motivo do Custo Extra <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>(Opcional)</span></label>
                <input 
                  name="extraFeeReason" 
                  type="text" 
                  value={extraFeeReason} 
                  onChange={(e) => setExtraFeeReason(e.target.value)} 
                  placeholder="Ex: Deslocação Intercidades" 
                />
              </div>
            </div>

            <div className="form-group full-width mt-16">
              <label>Bio</label>
              <textarea 
                name="bio"
                rows="4"
                defaultValue={initialData?.bio || ''}
              ></textarea>
            </div>
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

export default TeacherModal;