import React, { useEffect, useMemo, useState } from 'react';
import './ClassModal.css';

const DANCE_STYLES = ['Ballet', 'Contemporâneo', 'Hip Hop', 'Street Dance', 'Jazz', 'Dança Moderna'];

const TEACHERS = [
  { name: 'Sofia Martins', specialties: ['Ballet', 'Contemporâneo'] },
  { name: 'Ricardo Santos', specialties: ['Hip Hop', 'Street Dance'] },
  { name: 'Ana Ferreira', specialties: ['Jazz', 'Dança Moderna'] }
];

const DAY_BY_INDEX = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];

const getDayNameFromIsoDate = (isoDate) => {
  const date = new Date(`${isoDate}T12:00:00`);
  return DAY_BY_INDEX[date.getDay()];
};

const ClassModal = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  preferredClassDate,
  mode = 'class',
  prefillData = null,
  forceCreateMode = false
}) => {
  const handleModalClick = (e) => e.stopPropagation();

  const isTemplateMode = mode === 'template';
  const effectiveData = prefillData || initialData;
  const isEditing = !!initialData && !forceCreateMode;
  const modalTitle = isTemplateMode
    ? (isEditing ? 'Editar Template' : 'Novo Template')
    : (isEditing ? 'Editar Aula' : 'Nova Aula');
  const submitButtonText = isTemplateMode
    ? (isEditing ? 'Guardar Template' : 'Criar Template')
    : (isEditing ? 'Guardar' : 'Criar Aula');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [teacherError, setTeacherError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedStyle(effectiveData?.category || '');
    setSelectedTeacher(effectiveData?.instructor || '');
    setTeacherError('');
  }, [isOpen, effectiveData]);

  const availableTeachers = useMemo(() => {
    if (!selectedStyle) {
      return [];
    }

    return TEACHERS.filter((teacher) =>
      teacher.specialties.some((specialty) => specialty.toLowerCase() === selectedStyle.toLowerCase())
    );
  }, [selectedStyle]);

  if (!isOpen) return null;

  // Função para converter hora decimal (ex: 10.5) para formato de input (ex: "10:30")
  const formatTimeForInput = (decimalTime) => {
    if (decimalTime === undefined || isNaN(decimalTime)) return "10:00";
    const h = Math.floor(decimalTime);
    const m = Math.round((decimalTime - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const classDate = formData.get('classDate');

    if (!selectedTeacher) {
      setTeacherError('Tens de escolher um professor/a para o estilo de dança selecionado.');
      return;
    }

    if (!isTemplateMode && !classDate) {
      return;
    }

    // Converter "10:30" de volta para 10.5 para o calendário funcionar
    const startTimeStr = formData.get('startTime');
    const endTimeStr = formData.get('endTime');
    
    if(!startTimeStr || !endTimeStr || !formData.get('schoolYear')) {
      alert("Tem que preencher todos os campos");
      return;
    }

    const startParts = startTimeStr.split(':');
    const endParts = endTimeStr.split(':');
    const startDec = parseInt(startParts[0]) + parseInt(startParts[1]) / 60;
    const endDec = parseInt(endParts[0]) + parseInt(endParts[1]) / 60;
    const duration = endDec - startDec;

    const baseData = {
      id: isEditing ? initialData.id : Date.now(),
      name: formData.get('name'),
      schoolYear: formData.get('schoolYear'),
      room: formData.get('room'),
      category: formData.get('category'),
      instructor: selectedTeacher,
      class_time_start: formData.get('startTime'),
      class_time_end: formData.get('endTime'),
      start: startDec, // mantido para o calendário se necessário
      duration: duration >= 1 ? duration : 1, // evita cartões demasiado pequenos no horário
      level: formData.get('level'),
      maxStudents: Number(formData.get('maxStudents')),
      occupancy: isEditing ? effectiveData.occupancy : `0/${formData.get('maxStudents')}`
    };

    const classData = isTemplateMode
      ? baseData
      : {
          ...baseData,
          day: getDayNameFromIsoDate(classDate),
          classDate
        };

    onSave(classData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        <div className="modal-header">
          <h2 className="modal-title">{modalTitle}</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form key={isEditing ? initialData.id : (prefillData ? 'prefill' : 'new')} className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label>Nome da Aula</label>
            <input 
              name="name" 
              type="text" 
              defaultValue={effectiveData?.name || ''} 
              required 
              onInvalid={(e) => e.target.setCustomValidity('Tem que preencher o campo')}
              onInput={(e) => e.target.setCustomValidity('')}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Ano Letivo</label>
              <select 
                name="schoolYear" 
                defaultValue={effectiveData?.schoolYear || ''} 
                required
                onInvalid={(e) => e.target.setCustomValidity('Tem que preencher o campo')}
                onInput={(e) => e.target.setCustomValidity('')}
              >
                <option value="" disabled>Selecionar</option>
                <option value="2025/2026">2025/2026</option>
                <option value="2026/2027">2026/2027</option>
                <option value="2027/2028">2027/2028</option>
              </select>
            </div>

            <div className="form-group">
              <label>Sala</label>
              <select 
                name="room" 
                defaultValue={effectiveData?.room || ''} 
                required
                onInvalid={(e) => e.target.setCustomValidity('Tem que preencher o campo')}
                onInput={(e) => e.target.setCustomValidity('')}
              >
                <option value="" disabled>Selecionar</option>
                <option value="Sala Ballet">Sala Ballet</option>
                <option value="Sala Principal">Sala Principal</option>
                <option value="Sala Hip Hop">Sala Hip Hop</option>
              </select>
            </div>

            <div className="form-group">
              <label>Data da Aula (ex.: 20/04/2027)</label>
              {!isTemplateMode && (
                <input
                  name="classDate"
                  type="date"
                  defaultValue={effectiveData?.classDate || preferredClassDate || ''}
                  required
                />
              )}
              {isTemplateMode && (
                <div className="form-help">A data sera escolhida quando usares o template para criar uma aula.</div>
              )}
            </div>

            <div className="form-group">
              <label>Estilo de Dança</label>
              <select
                name="category"
                value={selectedStyle}
                onChange={(e) => {
                  setSelectedStyle(e.target.value);
                  setSelectedTeacher('');
                  setTeacherError('');
                }}
                required
                onInvalid={(e) => e.target.setCustomValidity('Tem que preencher o campo')}
                onInput={(e) => e.target.setCustomValidity('')}
              >
                <option value="" disabled>Selecionar</option>
                {DANCE_STYLES.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Professor/a</label>
              <select
                name="instructor"
                value={selectedTeacher}
                onChange={(e) => {
                  setSelectedTeacher(e.target.value);
                  setTeacherError('');
                }}
                disabled={!selectedStyle || availableTeachers.length === 0}
                title={!selectedStyle ? 'Seleciona primeiro o estilo de dança' : ''}
                required
                onInvalid={(e) => e.target.setCustomValidity('Tem que preencher o campo')}
                onInput={(e) => e.target.setCustomValidity('')}
              >
                <option value="" disabled>Selecionar</option>
                {availableTeachers.map((teacher) => (
                  <option key={teacher.name} value={teacher.name}>{teacher.name}</option>
                ))}
              </select>
              {selectedStyle && availableTeachers.length === 0 && (
                <p className="form-help form-help--warning">
                  Tens de adicionar o estilo "{selectedStyle}" a um professor/a ou criar um novo professor/a.
                </p>
              )}
              {teacherError && <p className="form-help form-help--error">{teacherError}</p>}
            </div>

            <div className="form-group">
              <label>Hora de Início</label>
              <input
                name="startTime"
                type="time"
                defaultValue={effectiveData?.class_time_start || formatTimeForInput(effectiveData?.start) || '10:00'}
                required
              />
            </div>

            <div className="form-group">
              <label>Hora de Fim</label>
              <input
                name="endTime"
                type="time"
                defaultValue={
                  effectiveData?.class_time_end ||
                  formatTimeForInput((effectiveData?.start || 10) + (effectiveData?.duration || 1)) ||
                  '11:00'
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Nível</label>
              <select name="level" defaultValue={effectiveData?.level || ''} required>
                <option value="" disabled>Selecionar</option>
                <option value="Iniciante">Iniciante</option>
                <option value="Intermédio">Intermédio</option>
                <option value="Avançado">Avançado</option>
                <option value="Todos">Todos</option>
              </select>
            </div>

            <div className="form-group">
              <label>Máx. Alunos</label>
              {/* Extrai o max alunos do campo occupancy "3/15" -> "15" */}
              <input
                name="maxStudents"
                type="number"
                defaultValue={effectiveData?.maxStudents || effectiveData?.occupancy?.split('/')[1] || '15'}
                required
              />
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

export default ClassModal;