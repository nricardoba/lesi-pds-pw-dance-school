import React, { useState, useEffect } from 'react';
import './CoachingModal.css';
import { useAuth } from '../../context/useAuth';
import { readScheduleClassesFromStorage } from '../../utils/scheduleStorage';

const CoachingModal = ({ isOpen, onClose, onSave }) => {
  const { role } = useAuth();
  
  const [formData, setFormData] = useState({
    student: role === 'student' ? 'Estudante Atual' : '',
    teacher: '',
    coachingType: 'Solo',
    danceType: 'Ballet',
    date: '',
    time: '10:00',
    duration: '60 min',
    note: ''
  });

  const [maxDuration, setMaxDuration] = useState(120);
  const [scheduleClasses, setScheduleClasses] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setScheduleClasses(readScheduleClassesFromStorage());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!formData.date || !formData.time || !formData.teacher) {
      setMaxDuration(120);
      return;
    }

    const toHourDecimal = (hourString) => {
      const [h = '0', m = '0'] = String(hourString || '08:00').split(':');
      return parseInt(h, 10) + parseInt(m, 10) / 60;
    };

    const startDec = toHourDecimal(formData.time);
    
    // Filter classes for the exact day and exact teacher
    const teacherClasses = scheduleClasses.filter(c => 
      c.classDate === formData.date && c.instructor === formData.teacher
    );

    let availableDuration = 120; // fallback arbitrary limit in minutes

    for (let c of teacherClasses) {
      const cStart = Number(c.start);
      const cEnd = cStart + Number(c.duration);
      
      // If it overlaps directly with the requested start time
      if (cStart <= startDec && cEnd > startDec) {
        availableDuration = 0;
        break;
      }
      
      // If the class comes AFTER the requested start time, it restricts max size
      if (cStart > startDec) {
        const gapMinutes = Math.round((cStart - startDec) * 60);
        if (gapMinutes < availableDuration) {
          availableDuration = gapMinutes;
        }
      }
    }
    
    setMaxDuration(availableDuration);

    if (availableDuration < 30) {
      setFormData(prev => ({ ...prev, duration: '' })); // No options valid
    } else {
      const currentDurMin = parseInt(formData.duration) || 60;
      if (currentDurMin > availableDuration) {
        const fallbackDur = availableDuration >= 90 ? '90 min' : (availableDuration >= 60 ? '60 min' : '30 min');
        setFormData(prev => ({ ...prev, duration: fallbackDur }));
      }
    }
  }, [formData.date, formData.time, formData.teacher, scheduleClasses]);

  if (!isOpen) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
    onClose();
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
                <select name="student" value={formData.student} onChange={handleChange} required>
                  <option value="" disabled>Selecionar</option>
                  <option value="Mariana Silva">Mariana Silva</option>
                  <option value="João Costa">João Costa</option>
                  <option value="Miguel Ferreira">Miguel Ferreira</option>
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
              <label>Tipo de Dança</label>
              <select name="danceType" value={formData.danceType} onChange={handleChange} required>
                <option value="Ballet">Ballet</option>
                <option value="Contemporâneo">Contemporâneo</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Jazz">Jazz</option>
              </select>
            </div>

            <div className="form-group">
              <label>Professor</label>
              <select name="teacher" value={formData.teacher} onChange={handleChange} required>
                <option value="" disabled>Selecionar</option>
                <option value="Sofia Martins">Sofia Martins</option>
                <option value="Ricardo Santos">Ricardo Santos</option>
                <option value="Ana Ferreira">Ana Ferreira</option>
              </select>
            </div>

            <div className="form-group">
              <label>Data Proposta</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Hora Proposta</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} required />
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
                <span className="error-text" style={{color: 'red', fontSize: '0.8rem'}}>O professor tem aula neste horário.</span>
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