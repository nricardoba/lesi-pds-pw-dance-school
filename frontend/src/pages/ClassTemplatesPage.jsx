import React, { useMemo, useState } from 'react';
import '../pagesCss/ClassTemplatesPage.css';
import ClassModal from '../components/classModal/ClassModal';
import {
  readClassTemplatesFromStorage,
  readScheduleClassesFromStorage,
  writeClassTemplatesToStorage,
  writeScheduleClassesToStorage
} from '../utils/scheduleStorage';

const formatDateForInput = (date) => {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const ClassTemplatesPage = () => {
  const [templates, setTemplates] = useState(() => readClassTemplatesFromStorage());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [modalMode, setModalMode] = useState('template');
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const today = useMemo(() => formatDateForInput(new Date()), []);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setModalMode('template');
  };

  const openCreateTemplate = () => {
    setEditingTemplate(null);
    setModalMode('template');
    setIsModalOpen(true);
  };

  const openEditTemplate = (template) => {
    setEditingTemplate(template);
    setModalMode('template');
    setIsModalOpen(true);
  };

  const openUseTemplate = (template) => {
    setEditingTemplate(template);
    setModalMode('class');
    setIsModalOpen(true);
  };

  const handleDeleteTemplate = (templateId) => {
    const nextTemplates = templates.filter((template) => template.id !== templateId);
    setTemplates(nextTemplates);
    writeClassTemplatesToStorage(nextTemplates);
    setTemplateToDelete(null);
  };

  const handleSaveTemplate = (templateData) => {
    const isEditing = !!templates.find((template) => template.id === templateData.id);
    const nextTemplates = isEditing
      ? templates.map((template) => (template.id === templateData.id ? templateData : template))
      : [...templates, { ...templateData, id: Date.now() }];

    setTemplates(nextTemplates);
    writeClassTemplatesToStorage(nextTemplates);
    closeModal();
  };

  const handleCreateClassFromTemplate = (classData) => {
    const scheduleClasses = readScheduleClassesFromStorage();
    const nextClasses = [...scheduleClasses, { ...classData, id: Date.now() }];
    writeScheduleClassesToStorage(nextClasses);
    closeModal();
  };

  return (
    <div className="class-templates-page">
      <header className="class-templates-page__header">
        <div>
          <h1 className="class-templates-page__title">Templates de Aulas</h1>
          <p className="class-templates-page__subtitle">Guarda e reutiliza aulas com um clique.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreateTemplate}>
          + Novo Template
        </button>
      </header>

      <section className="class-templates-grid">
        {templates.length === 0 && (
          <div className="class-template-empty">
            Ainda não existem templates. Cria o primeiro template para reutilizar aulas.
          </div>
        )}

        {templates.map((template) => (
          <article key={template.id} className="class-template-card">
            <h3 className="class-template-card__title">{template.name}</h3>
            
            <div className="class-template-card__tags">
              <span className="class-template-tag">{template.category}</span>
              <span className="class-template-tag">{template.level}</span>
            </div>

            <div className="class-template-card__details">
              <div className="detail-row">
                <span className="detail-label">Ano Letivo:</span>
                <span className="detail-value">{template.schoolYear || 'Não definido'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Professor/a:</span>
                <span className="detail-value">{template.instructor}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Sala:</span>
                <span className="detail-value">{template.room}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Horário:</span>
                <span className="detail-value">{template.class_time_start} - {template.class_time_end}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Máx. Alunos:</span>
                <span className="detail-value">{template.capacity || '15'}</span>
              </div>
            </div>

            <div className="class-template-card__divider"></div>

            <div className="class-template-card__actions">
              <button
                type="button"
                className="action-btn edit-btn"
                title="Editar template"
                onClick={() => openEditTemplate(template)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar
              </button>
              <button
                type="button"
                className="action-btn delete-btn"
                title="Apagar template"
                onClick={() => setTemplateToDelete(template)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </article>
        ))}
      </section>

      {templateToDelete && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-card">
            <h3 className="delete-confirm-title">Eliminar Template</h3>
            <p className="delete-confirm-text">
              Tem a certeza que pretende eliminar o template <strong>{templateToDelete.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="delete-confirm-actions">
              <button className="delete-cancel-btn" onClick={() => setTemplateToDelete(null)}>
                Cancelar
              </button>
              <button className="delete-confirm-btn" onClick={() => handleDeleteTemplate(templateToDelete.id)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <ClassModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialData={editingTemplate}
        preferredClassDate={today}
        mode={modalMode}
        onSave={modalMode === 'template' ? handleSaveTemplate : handleCreateClassFromTemplate}
      />
    </div>
  );
};

export default ClassTemplatesPage;
