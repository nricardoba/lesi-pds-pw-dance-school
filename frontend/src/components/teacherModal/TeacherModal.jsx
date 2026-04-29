import React, { useEffect, useRef, useState } from 'react';
import './TeacherModal.css';
import { readExtraFeesFromStorage, writeExtraFeesToStorage } from '../../utils/scheduleStorage';

const SPECIALTY_OPTIONS = ['Ballet', 'Contemporâneo', 'Hip Hop', 'Street Dance', 'Jazz', 'Dança Moderna'];

const TeacherModal = ({ isOpen, onClose, initialData, onSave }) => {
  const specialtiesRef = useRef(null);
  const [specialtiesOpen, setSpecialtiesOpen] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState(initialData?.specialties || []);
  
  // Extra fee state
  const [extraFeeCost, setExtraFeeCost] = useState('');
  const [extraFeeReason, setExtraFeeReason] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedSpecialties(initialData?.specialties || []);
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
  }, [initialData, isOpen]);

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
  const submitButtonText = isEditing ? 'Guardar' : 'Criar Professor';

  const selectedSpecialtiesLabel = selectedSpecialties.length === 0
    ? 'Selecionar especialidades'
    : selectedSpecialties.join(', ');

  const toggleSpecialty = (specialty) => {
    setSelectedSpecialties((currentSpecialties) =>
      currentSpecialties.includes(specialty)
        ? currentSpecialties.filter((item) => item !== specialty)
        : [...currentSpecialties, specialty]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const teacherName = formData.get('name');

    const teacherData = {
      user_id: isEditing ? initialData.user_id : Date.now(),
      name: teacherName,
      email: formData.get('email'),
      phone: formData.get('phone'),
      specialties: selectedSpecialties,
      classesCount: isEditing ? initialData.classesCount : 0,
      avatar: formData.get('avatar') || initialData?.avatar || '',
      bio: formData.get('bio') || ''
    };
    
    // Save extra fee logic
    let allFees = readExtraFeesFromStorage();
    // remove previous entries for this teacher name (or the old name if edited)
    if (isEditing && initialData?.name) {
      allFees = allFees.filter(f => f.teacher !== initialData.name);
    }
    allFees = allFees.filter(f => f.teacher !== teacherName); // remove any existing just in case

    if (extraFeeCost && extraFeeReason) {
      allFees.push({
        id: Date.now(),
        teacher: teacherName,
        reason: extraFeeReason,
        cost: parseFloat(extraFeeCost)
      });
    }
    writeExtraFeesToStorage(allFees);

    onSave(teacherData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        
        <div className="modal-header">
          <h2 className="modal-title">{modalTitle}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label>Nome</label>
            <input name="name" type="text" defaultValue={isEditing ? initialData.name : ''} required />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" defaultValue={isEditing ? initialData.email : ''} required />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input name="phone" type="tel" defaultValue={isEditing ? initialData.phone : ''} />
            </div>
          </div>

          <div className="form-group full-width mt-16 specialty-field" ref={specialtiesRef}>
            <label>Especialidades</label>
            <button
              type="button"
              className="specialty-select-trigger"
              onClick={() => setSpecialtiesOpen((currentValue) => !currentValue)}
              aria-expanded={specialtiesOpen}
            >
              <span>{selectedSpecialtiesLabel}</span>
              <span className="specialty-select-arrow">▾</span>
            </button>

            {specialtiesOpen && (
              <div className="specialty-options">
                {SPECIALTY_OPTIONS.map((specialty) => (
                  <label key={specialty} className="specialty-option">
                    <input
                      type="checkbox"
                      checked={selectedSpecialties.includes(specialty)}
                      onChange={() => toggleSpecialty(specialty)}
                    />
                    <span>{specialty}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="form-group full-width mt-16">
            <label>URL da Foto</label>
            <input 
              name="avatar"
              type="url" 
              placeholder="https://..." 
              defaultValue={isEditing ? initialData.avatar : ''}
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
              defaultValue={isEditing ? initialData.bio : ''}
            ></textarea>
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

export default TeacherModal;