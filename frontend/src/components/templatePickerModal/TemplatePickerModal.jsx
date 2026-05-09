import React from 'react';

const TemplatePickerModal = ({
  isOpen,
  templateTargetSlot,
  templateOptions,
  selectedTemplate,
  setSelectedTemplate,
  templateDuration,
  setTemplateDuration,
  templateError,
  setTemplateError,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="delete-confirm-overlay" onClick={onClose}>
      <div className="delete-confirm-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="delete-confirm-title">Escolher template</h3>
        <p className="delete-confirm-text">
          Seleciona um template para criar aula no slot {templateTargetSlot?.day} {templateTargetSlot?.hour}.
        </p>

        <div className="template-list-modal">
          {templateOptions.length === 0 && (
            <p className="delete-confirm-text">Ainda nao existem templates guardados.</p>
          )}

          {templateOptions.map((template) => (
            <button
              type="button"
              key={template.id}
              className={`template-option-btn ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
              style={{ border: selectedTemplate?.id === template.id ? '2px solid #F97316' : '' }}
              onClick={() => setSelectedTemplate(template)}
            >
              <strong>{template.name}</strong>
              <span>{template.category} • {template.instructor}</span>
            </button>
          ))}
        </div>

        {selectedTemplate && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Duração (horas):</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="8"
              value={templateDuration}
              onChange={(e) => {
                setTemplateDuration(e.target.value);
                setTemplateError('');
              }}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            {templateError && <p style={{ color: 'red', fontSize: '0.875rem', margin: 0 }}>{templateError}</p>}
          </div>
        )}

        <div className="delete-confirm-actions" style={{ marginTop: '16px' }}>
          <button
            type="button"
            className="delete-cancel-btn"
            onClick={onClose}
          >
            Fechar
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!selectedTemplate}
            onClick={onConfirm}
            style={{ 
              padding: '10px 16px', 
              borderRadius: '4px', 
              border: 'none', 
              backgroundColor: !selectedTemplate ? '#ccc' : '#F97316', 
              color: 'white', 
              cursor: !selectedTemplate ? 'not-allowed' : 'pointer' 
            }}
          >
            Confirmar e Criar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePickerModal;