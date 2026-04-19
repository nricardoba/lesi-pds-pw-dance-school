import React, { useMemo, useState } from 'react';
import '../pagesCss/classTemplatesPage.css';
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
            <div className="class-template-card__top">
              <h3>{template.name}</h3>
              <div className="class-template-card__actions">
                <button
                  type="button"
                  className="icon-btn play-btn"
                  title="Usar template"
                  onClick={() => openUseTemplate(template)}
                >
                  ▶
                </button>
                <button
                  type="button"
                  className="icon-btn edit-btn"
                  title="Editar template"
                  onClick={() => openEditTemplate(template)}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="icon-btn delete-btn"
                  title="Apagar template"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  🗑
                </button>
              </div>
            </div>
            <p><strong>Estilo:</strong> {template.category}</p>
            <p><strong>Professor/a:</strong> {template.instructor}</p>
            <p><strong>Sala:</strong> {template.room}</p>
            <p><strong>Nivel:</strong> {template.level}</p>
            <p><strong>Horario:</strong> {template.class_time_start} - {template.class_time_end}</p>
          </article>
        ))}
      </section>

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
