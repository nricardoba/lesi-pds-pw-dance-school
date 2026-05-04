import React, { useState, useEffect, useMemo } from 'react';
import './CoachingModal.css';
import { useAuth } from '../../context/useAuth';
import { apiClient } from '../../services/apiClient';
import { getUsers } from '../../services/users';
import { requestCoachingRequest } from '../../services/classes';
import { listClassesRequest } from '../../services/classes';

const CoachingModal = ({ isOpen, onClose, onSave }) => {
  const { role, user, token } = useAuth();
  //const [extraFees, setExtraFees] = useState([]);

  const [formData, setFormData] = useState({
    studentId: role === 'student' ? (user?.user_name || 'Estudante Atual') : '',
    teacherId: '',
    schoolYearId: '',
    modalityId: '',
    date: '',
    time: '10:00',
    duration: '60 min',
  });

  const [scheduleClasses, setScheduleClasses] = useState([]);
  const [dbData, setDbData] = useState({ teachers: [], students: [], modalities: [], schoolYears: [] });

  useEffect(() => {
    if (isOpen && token) {
      const loadAllData = async () => {
        try {
          const [users, modalities, years] = await Promise.all([
            getUsers(token),
            apiClient('/modalities', { token }),
            apiClient('/school-years', { token })
          ]);

          setDbData({
            teachers: users.filter(u => u.userType?.userTypeDesc === 'Professor'),
            students: users.filter(u => u.userType?.userTypeDesc === 'Aluno'),
            modalities: modalities || [],
            schoolYears: years || []
          });
        } catch (error) {
          console.error("Erro ao carregar dados para o modal:", error);
        }
      };
      loadAllData();
    }
  }, [isOpen, token]);


  useEffect(() => {
    if (isOpen && token) {
      // Em vez de storage, agora carregamos da API para validar conflitos reais
      listClassesRequest(token).then(setScheduleClasses).catch(console.error);
    }
  }, [isOpen, token]);

  // Cálculo de maxDuration movido para useMemo para evitar renderizações em cascata
  const maxDuration = useMemo(() => {
    if (!formData.date || !formData.time || !formData.teacherId) return 120;

    const toHourDecimal = (hourString) => {
      const [h = '0', m = '0'] = String(hourString).split(':');
      return parseInt(h, 10) + parseInt(m, 10) / 60;
    };

    const startDec = toHourDecimal(formData.time);
    const teacherClasses = scheduleClasses.filter(c =>
      c.classDateStart?.split('T')[0] === formData.date &&
      c.userClass?.some(uc => uc.userId === Number(formData.teacherId))
    );

    let availableMinutes = 120;
    for (let c of teacherClasses) {
      const cStart = toHourDecimal(new Date(c.classDateStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (cStart > startDec) {
        availableMinutes = Math.min(availableMinutes, Math.round((cStart - startDec) * 60));
      }
    }
    return availableMinutes;
  }, [formData.date, formData.time, formData.teacherId, scheduleClasses]);

  /**const shouldApplyExtraFee = React.useMemo(() => {
    if (!formData.teacher || !formData.date) return false; // Don't show fee until both are picked

    const daysOfWeekStr = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
    const targetDate = new Date(formData.date);
    const dayName = daysOfWeekStr[targetDate.getDay()];

    const isAtSchool = scheduleClasses.some(c =>
      c.instructor === formData.teacher &&
      (c.classDate === formData.date || c.day === dayName)
    );

    return !isAtSchool;
  }, [formData.teacher, formData.date, scheduleClasses]);*/

  if (!isOpen) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      // Se o campo for um dos IDs, converte para número. 
      // Se for a nota/objetivo, mantém como string.
      [name]: name.includes('Id') ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time || !formData.teacherId) {
      alert("Por favor, preencha os campos de data, hora e professor.");
      return;
    }
    if (!formData.modalityId || !formData.teacherId || !formData.schoolYearId) {
      alert("Por favor, selecione a Modalidade, o Professor e o Ano Letivo.");
      return;
    }
    // Função auxiliar para calcular o end_time no formato ISO esperado pelo backend
    const calculateISOEndTime = (date, time, durationStr) => {
      const start = new Date(`${date}T${time}:00`);
      const minutes = parseInt(durationStr);
      return new Date(start.getTime() + minutes * 60000).toISOString();
    };

    const payload = {
      modality_id: Number(formData.modalityId),
      professor_id: Number(formData.teacherId),
      student_ids: [Number(formData.studentId)],
      school_year_id: Number(formData.schoolYearId),
      start_time: new Date(`${formData.date}T${formData.time}:00`).toISOString(),
      end_time: calculateISOEndTime(formData.date, formData.time, formData.duration)
    };

    try {
      await requestCoachingRequest(payload, token);

      if (onSave) {
        onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        <div className="modal-header">
          <h2 className="modal-title">Novo Pedido de Coaching</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-grid">

            {role !== 'student' && (
              <div className="form-group">
                <label>Aluno</label>
                <select
                  name="studentId" // O 'name' deve ser igual à chave no teu useState
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Selecionar</option>
                  {dbData.students.map(s => (
                    <option key={s.userId} value={s.userId}>
                      {s.userName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Tipo de Coaching</label>
              <select name="coachingType" value={formData.coachingType} onChange={handleChange} required>
                <option value="Solo">Solo</option>
                <option value="Duo">Duo</option>
                <option value="Grupo">Grupo</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ano Letivo</label>
              <select name="schoolYearId" value={formData.schoolYearId} onChange={handleChange} required>
                <option value="" disabled>Selecionar</option>
                {dbData.schoolYears.map(year => (
                  <option key={year.schoolYearId} value={year.schoolYearId}>
                    {year.schoolYearName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo de Dança</label>
              <select name="modalityId" value={formData.modalityId} onChange={handleChange} required>
                <option value="" disabled>Selecionar</option>
                {dbData.modalities.map(m => (
                  <option key={m.modalityId} value={m.modalityId}>{m.modalityName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Professor</label>
              <select name="teacherId" value={formData.teacherId} onChange={handleChange} required>
                <option value="" disabled>Selecionar</option>
                {dbData.teachers.map(t => (
                  <option key={t.userId} value={t.userId}>{t.userName}</option>
                ))}
              </select>
              {/* {shouldApplyExtraFee && extraFees.some(f => f.teacherId === formData.teacherId) && (
                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '4px', fontSize: '0.8rem', color: '#92400E' }}>
                  {extraFees.filter(f => f.teacher === formData.teacher).map(f => (
                    <div key={f.id}>
                      <strong>Custo Extra (Deslocação):</strong> +{f.cost}€<br />
                      <strong>Motivo:</strong> {f.reason}
                    </div>
                  ))}
                </div>
              )*/}
            </div>

            <div className="form-group">
              <label>Data Proposta</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                onInvalid={(e) => e.target.setCustomValidity('Tem que preencher o campo')}
                onInput={(e) => e.target.setCustomValidity('')}
              />
            </div>

            <div className="form-group">
              <label>Hora Proposta</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                onInvalid={(e) => e.target.setCustomValidity('Tem que preencher o campo')}
                onInput={(e) => e.target.setCustomValidity('')}
              />
            </div>

            <div className="form-group">
              <label>Duração</label>
              <select name="duration" value={formData.duration} onChange={handleChange} required>
                {maxDuration < 30 && <option value="" disabled>Indisponível (Professor ocupado)</option>}
                {maxDuration >= 30 && <option value="30 min">30 min</option>}
                {maxDuration >= 60 && <option value="60 min">60 min</option>}
                {maxDuration >= 90 && <option value="90 min">90 min</option>}
              </select>
              {maxDuration < 30 && formData.date && formData.time && formData.teacher && (
                <span className="error-text" style={{ color: 'red', fontSize: '0.8rem' }}>O professor tem aula neste horário.</span>
              )}
            </div>
          </div>

          <div className="form-group full-width mt-16">
            <label>Objetivo da Sessão</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Descreva o objetivo do coaching..."
              rows="4"
              required
            ></textarea>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-submit">Criar Pedido</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoachingModal;