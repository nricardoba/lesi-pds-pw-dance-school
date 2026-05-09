import React, { useEffect, useState, useRef } from 'react';
import './StudioModal.css';
import { getModalities } from '../../services/modalities';
import { getStudioModalities } from '../../services/studios';
import { useAuth } from '../../context/useAuth';

const StudioModal = ({ isOpen, onClose, initialData, onSave }) => {
  const { token } = useAuth();

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Estúdio' : 'Novo Estúdio';
  const submitButtonText = isEditing ? 'Guardar' : 'Criar Estúdio';

  const [availableModalities, setAvailableModalities] = useState([]);
  // store modality ids
  const [selectedModalities, setSelectedModalities] = useState(() => (initialData && initialData.modalities) ? initialData.modalities.slice() : []);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getModalities(token);
        setAvailableModalities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar modalidades:', err);
      }
    };
    load();
  }, [token]);

  // when editing, load current studio-modalities relations to preselect
  useEffect(() => {
    if (!isEditing) return;
    const loadStudioModalities = async () => {
      try {
        const relations = await getStudioModalities(token);
        if (!Array.isArray(relations)) return;
        const my = relations
          .filter(r => r.studio && (r.studio.studioId === initialData.id || r.studioId === initialData.id))
          .map(r => r.modality?.modalityId)
          .filter(Boolean);
        setSelectedModalities(my);
      } catch (err) {
        console.error('Erro ao carregar relações estúdio-modalidade:', err);
      }
    };
    loadStudioModalities();
  }, [isEditing, initialData, token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const toggleSelection = (id) => {
    setSelectedModalities(prev => {
      const numId = Number(id);
      if (prev.includes(numId)) return prev.filter(x => x !== numId);
      return [...prev, numId];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDropdownOpen(false);
    const formData = new FormData(e.target);

    const studioData = {
      id: isEditing ? initialData.id : Date.now(),
      studio_name: formData.get('name'),
      studio_max_capacity: parseInt(formData.get('capacity'), 10),
      // send modality ids
      modalities: selectedModalities.slice(),
      notes: formData.get('notes')
    };

    try {
      await onSave(studioData);
      onClose();
    } catch (error) {
      console.error('Erro ao guardar estúdio:', error);
    }
  };

  const handleOverlayClick = () => {
    // If dropdown is open, close only dropdown first to avoid accidental modal close.
    if (dropdownOpen) {
      setDropdownOpen(false);
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={handleModalClick}>

        <div className="modal-header">
          <h2 className="modal-title">{modalTitle}</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>

          <div className="form-group full-width">
            <label>Nome do Estúdio</label>
            <input name="name" type="text" defaultValue={isEditing ? (initialData.studio_name || initialData.name) : ''} required />
          </div>

          <div className="form-grid-2 mt-16">
            <div className="form-group">
              <label>Capacidade Máxima</label>
              <input name="capacity" type="number" defaultValue={isEditing ? (initialData.studio_max_capacity || initialData.capacity) : '20'} required />
            </div>

            <div className="form-group" ref={dropdownRef}>
              <label>Modalidades</label>
              <button type="button" className="multiselect-toggle" onClick={() => setDropdownOpen(open => !open)}>
                {selectedModalities.length > 0 ? `${selectedModalities.length} selecionada(s)` : 'Selecionar modalidades'}
              </button>
              {dropdownOpen && (
                <div className="multiselect-panel">
                  {availableModalities.length === 0 ? (
                    <div className="multiselect-empty">Sem modalidades</div>
                  ) : (
                    availableModalities.map(m => (
                      <label key={m.modalityId} className="multiselect-item">
                        <input
                          type="checkbox"
                          checked={selectedModalities.includes(m.modalityId)}
                          onChange={() => toggleSelection(m.modalityId)}
                        />
                        <span>{m.modalityName}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
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

export default StudioModal;
