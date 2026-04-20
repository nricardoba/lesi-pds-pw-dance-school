import React, { useState } from 'react';
import '../pagesCss/TeacherSchedulePage.css';
import TeacherScheduleStatus from '../components/teacherSchedule/TeacherScheduleStatus';
import TeacherScheduleSlots from '../components/teacherSchedule/TeacherScheduleSlots';
import TeacherScheduleHistory from '../components/teacherSchedule/TeacherScheduleHistory';
import SubmitScheduleModal from '../components/teacherSchedule/SubmitScheduleModal';

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const TeacherSchedulePage = () => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState({
    submissionDate: '01/03/2026',
    reviewDate: '01/03/2026',
    totalSlots: 6,
    status: 'Aprovado'
  });

  const [availableSlots, setAvailableSlots] = useState([
    { id: 1, day: 'Segunda-feira', time: '09:00 - 13:00' },
    { id: 2, day: 'Segunda-feira', time: '14:00 - 18:00' },
    { id: 3, day: 'Terça-feira', time: '10:00 - 14:00' },
    { id: 4, day: 'Quarta-feira', time: '09:00 - 13:00' },
    { id: 5, day: 'Quinta-feira', time: '14:00 - 19:00' },
    { id: 6, day: 'Sexta-feira', time: '09:00 - 12:00' }
  ]);

  const [history, setHistory] = useState([
    { id: 1, date: '01/03/2026', status: 'Aprovado', details: '6 slots • Horário aprovado pela direção' },
    { id: 2, date: '15/02/2026', status: 'Rejeitado', details: '4 slots • Conflito com outras aulas - por favor ajustar Segunda-feira manhã' }
  ]);

  const handleOpenModal = () => {
    setIsSubmitModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSubmitModalOpen(false);
  };

  const handleSubmitSchedule = (newSlots, selectedSlotsCount) => {
    const today = formatDate(new Date());

    setAvailableSlots(newSlots);
    setCurrentStatus({
      submissionDate: today,
      reviewDate: '-',
      totalSlots: selectedSlotsCount,
      status: 'Pendente'
    });

    setHistory((previous) => [
      {
        id: Date.now(),
        date: today,
        status: 'Pendente',
        details: `${selectedSlotsCount} slots • Horário enviado e a aguardar aprovação da direção`
      },
      ...previous
    ]);

    setIsSubmitModalOpen(false);
  };

  return (
    <div className="teacher-schedule-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Meu Horário</h1>
          <p className="page-subtitle">Gerir e enviar disponibilidades para aprovação</p>
        </div>
        <button type="button" className="submit-schedule-btn" onClick={handleOpenModal}>
          <span className="submit-schedule-btn__icon">＋</span>
          Enviar Novo Horário
        </button>
      </header>

      <TeacherScheduleStatus currentStatus={currentStatus} />
      
      <TeacherScheduleSlots availableSlots={availableSlots} />
      
      <TeacherScheduleHistory history={history} />

      <SubmitScheduleModal 
        isOpen={isSubmitModalOpen} 
        onClose={handleCloseModal} 
        onSubmit={handleSubmitSchedule} 
        teacherName="Ana Ribeiro" 
      />
    </div>
  );
};

export default TeacherSchedulePage;