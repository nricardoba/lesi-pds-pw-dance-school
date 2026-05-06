import React, { useEffect, useMemo, useState } from 'react';
import './ClassModal.css';
import { useAuth } from '../../context/useAuth';
import { getUsers } from '../../services/users';
import { getModalities } from '../../services/modalities';
import { getStudios } from '../../services/studios';

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
  const { token } = useAuth();
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
  const [isRecurrent, setIsRecurrent] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [studios, setStudios] = useState([]);

  useEffect(() => {
    if (!isOpen || !token) return;

    const fetchData = async () => {
      try {
        const [usersData, modalitiesData, studiosData] = await Promise.all([
          getUsers(token),
          getModalities(token),
          getStudios(token)
        ]);

        const professors = usersData.filter(u => u.userType?.userTypeDesc === 'Professor');
        setTeachers(professors);
        setModalities(modalitiesData);
        setStudios(studiosData);
      } catch (err) {
        console.error("Failed to load modal data:", err);
      }
    };

    fetchData();
  }, [isOpen, token]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect */
    // Reacting to `effectiveData` changing when modal opens
    setSelectedStyle(effectiveData?.category || '');
    setSelectedTeacher(effectiveData?.instructor || '');
    setIsRecurrent(effectiveData?.classRecurrence || false);
    setTeacherError('');
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen, effectiveData]);
const availableTeachers = useMemo(() => {
  if (!selectedStyle) {
    return teachers
      .map((teacher) => ({
        ...teacher,
        isSpecialist: false
      }))
      .sort((a, b) => a.userName.localeCompare(b.userName));
  }

  return teachers
    .map((teacher) => {
      const isSpecialist = teacher.userModality?.some(
        (um) => um.modality?.modalityName === selectedStyle
      );

      return { ...teacher, isSpecialist };
    })
    .sort((a, b) => {
      if (a.isSpecialist === b.isSpecialist) {
        return a.userName.localeCompare(b.userName);
      }

      return a.isSpecialist ? -1 : 1;
    });
}, [selectedStyle, teachers]);

const specialistTeachers = useMemo(
  () => availableTeachers.filter((teacher) => teacher.isSpecialist),
  [availableTeachers]
);

const fallbackTeachers = useMemo(
  () => availableTeachers.filter((teacher) => !teacher.isSpecialist),
  [availableTeachers]
);

const selectedTeacherIsSpecialist = useMemo(() => {
  if (!selectedTeacher || !selectedStyle) return true;

  const teacher = teachers.find(
    (t) => t.userId.toString() === selectedTeacher
  );

  if (!teacher) return true;

  return teacher.userModality?.some(
    (um) => um.modality?.modalityName === selectedStyle
  );
}, [selectedTeacher, selectedStyle, teachers]);

const availableStyles = useMemo(() => {
  if (!selectedTeacher) {
    return modalities
      .map((modality) => ({
        name: modality.modalityName,
        isTeacherModality: false
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const teacher = teachers.find(
    (t) => t.userId.toString() === selectedTeacher
  );

  if (!teacher) {
    return modalities
      .map((modality) => ({
        name: modality.modalityName,
        isTeacherModality: false
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const teacherModalities =
    teacher.userModality?.map((um) => um.modality?.modalityName) || [];

  return modalities
    .map((modality) => ({
      name: modality.modalityName,
      isTeacherModality: teacherModalities.includes(modality.modalityName)
    }))
    .sort((a, b) => {
      if (a.isTeacherModality === b.isTeacherModality) {
        return a.name.localeCompare(b.name);
      }

      return a.isTeacherModality ? -1 : 1;
    });
}, [selectedTeacher, modalities, teachers]);

const teacherStyles = useMemo(
  () => availableStyles.filter((style) => style.isTeacherModality),
  [availableStyles]
);

const fallbackStyles = useMemo(
  () => availableStyles.filter((style) => !style.isTeacherModality),
  [availableStyles]
);

  if (!isOpen) return null;

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

    const startTimeStr = formData.get('startTime');
    const endTimeStr = formData.get('endTime');

    if (!startTimeStr || !endTimeStr || !formData.get('schoolYear')) {
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
      start: startDec,
      duration: duration >= 1 ? duration : 1,
      //level: formData.get('level'),
      maxStudents: Number(formData.get('maxStudents')),
      occupancy: isEditing ? effectiveData.occupancy : `0/${formData.get('maxStudents')}`,
      classRecurrence: isRecurrent,
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
                <option value="1">2025/2026</option>
                <option value="2">2026/2027</option>
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
                {studios.map(studio => (
                  <option key={studio.studioId} value={studio.studioId}>{studio.studioName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Data da Aula</label>
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
              <label>Recorrente</label>
              <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <input
                  name="recurrence"
                  type="checkbox"
                  checked={isRecurrent}
                  onChange={(e) => setIsRecurrent(e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                <span style={{ marginLeft: '10px' }}>Sim</span>
              </div>
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
                disabled={availableTeachers.length === 0}
                required
                onInvalid={(e) => e.target.setCustomValidity('Tem que preencher o campo')}
                onInput={(e) => e.target.setCustomValidity('')}
              >
                <option value="" disabled>Selecionar</option>

                {!selectedStyle && (
                  <optgroup label="Professores disponíveis">
                    {availableTeachers.map((teacher) => (
                      <option key={teacher.userId} value={teacher.userId}>
                        {teacher.userName}
                      </option>
                    ))}
                  </optgroup>
                )}

                {selectedStyle && specialistTeachers.length > 0 && (
                  <optgroup label="Professores especializados">
                    {specialistTeachers.map((teacher) => (
                      <option key={teacher.userId} value={teacher.userId}>
                        {teacher.userName}
                      </option>
                    ))}
                  </optgroup>
                )}

                {selectedStyle && fallbackTeachers.length > 0 && (
                  <optgroup label="Professores disponíveis">
                    {fallbackTeachers.map((teacher) => (
                      <option key={teacher.userId} value={teacher.userId}>
                        {teacher.userName}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {availableTeachers.length === 0 && (
                <p className="form-help form-help--warning">
                  Nenhum professor disponível.
                </p>
              )}

              {!selectedTeacherIsSpecialist && selectedTeacher && selectedStyle && (
                <p className="form-help form-help--warning">
                  Professor selecionado como substituição. Não é especialista neste estilo.
                </p>
              )}

              {teacherError && <p className="form-help form-help--error">{teacherError}</p>}
            </div>

            <div className="form-group">
              <label>Estilo de Dança</label>
              <select
                name="category"
                value={selectedStyle}
                onChange={(e) => {
                  setSelectedStyle(e.target.value);
                  setTeacherError('');
                }}
                required
                onInvalid={(e) => e.target.setCustomValidity('Tem que preencher o campo')}
                onInput={(e) => e.target.setCustomValidity('')}
              >
                <option value="" disabled>Selecionar</option>

                {!selectedTeacher && (
                  <optgroup label="Modalidades disponíveis">
                    {availableStyles.map((style) => (
                      <option key={style.name} value={style.name}>
                        {style.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {selectedTeacher && teacherStyles.length > 0 && (
                  <optgroup label="Modalidades do professor">
                    {teacherStyles.map((style) => (
                      <option key={style.name} value={style.name}>
                        {style.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {selectedTeacher && fallbackStyles.length > 0 && (
                  <optgroup label="Outras modalidades disponíveis">
                    {fallbackStyles.map((style) => (
                      <option key={style.name} value={style.name}>
                        {style.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
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

            {/* <div className="form-group">
              <label>Nível</label>
              <select name="level" defaultValue={effectiveData?.level || ''} required>
                <option value="" disabled>Selecionar</option>
                <option value="Iniciante">Iniciante</option>
                <option value="Intermédio">Intermédio</option>
                <option value="Avançado">Avançado</option>
                <option value="Todos">Todos</option>
              </select>
            </div> */}

            <div className="form-group">
              <label>Máx. Alunos</label>
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