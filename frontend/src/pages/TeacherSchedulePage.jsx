import React, { useState, useEffect } from 'react';
import { scheduleService } from '../services/scheduleService';
import { useAuth } from '../context/useAuth';
import '../pagesCss/TeacherSchedulePage.css';
import TeacherScheduleStatus from '../components/teacherSchedule/TeacherScheduleStatus';
import TeacherScheduleSlots from '../components/teacherSchedule/TeacherScheduleSlots';
import TeacherScheduleHistory from '../components/teacherSchedule/TeacherScheduleHistory';
import SubmitScheduleModal from '../components/teacherSchedule/SubmitScheduleModal';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const TeacherSchedulePage = () => {
  const { token, user } = useAuth();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [history, setHistory] = useState([]);

  // Use actual logged-in user ID
  const userId = user?.id || 1;

  useEffect(() => {
    if (token && user) {
      fetchScheduleData();
    }
  }, [token, user]);

  const fetchScheduleData = () => {
    scheduleService.getScheduleVacanciesByUserId(userId, token)
      .then(response => {
        // Obter apenas as aprovadas (se scheduleVacancyRecurrence === false) de acordo com o nosso mock de BD
        const approvedSlots = response.filter(slot => slot.scheduleVacancyRecurrence === false);
        
        const formattedSlots = approvedSlots.map(slot => {
          const startDate = new Date(slot.scheduleVacancyStart);
          const endDate = new Date(slot.scheduleVacancyEnd);
          const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
          
          const startStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
          const endStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

          return {
            id: slot.scheduleVacancyId,
            day: days[startDate.getDay()],
            time: `${startStr} - ${endStr}`
          };
        });
        setAvailableSlots(formattedSlots);
      })
      .catch(error => {
        console.error('Error fetching schedule vacancies:', error);
      });

    scheduleService.getScheduleSubmissions(userId, token)
      .then(response => {
        const formattedHistory = response.map(item => ({
          id: item.scheduleSubmissionId,
          date: formatDate(item.submissionDate),
          status: item.status?.scheduleSubmissionStatusDesc || 'Pendente',
          details: `${item.scheduleVacancies?.length || 0} slots • ${item.rejectionReason || `Horário ${item.status?.scheduleSubmissionStatusDesc?.toLowerCase() || 'pendente'} pela direção`}`
        }));
        setHistory(formattedHistory);
      })
      .catch(error => {
        console.error('Error fetching schedule submissions:', error);
      });

    scheduleService.getLatestSubmissionStatus(userId, token)
      .then(response => {
        if (response) {
          setCurrentStatus({
            submissionDate: formatDate(response.submissionDate),
            reviewDate: response.reviewDate ? formatDate(response.reviewDate) : '-',
            totalSlots: response.scheduleVacancies?.length || 0,
            status: response.status?.scheduleSubmissionStatusDesc || 'Pendente'
          });
        }
      })
      .catch(error => {
        console.error('Error fetching latest submission status:', error);
      });
  };

  const handleOpenModal = () => {
    setIsSubmitModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSubmitModalOpen(false);
  };

  const handleSubmitSchedule = (newSlots, selectedSlotsCount) => {
    const submissionData = {
      userId: userId,
      schoolYearId: 11, // Getting a real valid school year ID from db
      vacancies: newSlots.map(slot => ({
        day_of_week: slot.day,
        start_time: slot.time.split(' - ')[0],
        end_time: slot.time.split(' - ')[1],
      }))
    };

    scheduleService.submitSchedule(submissionData, token)
      .then(() => {
        fetchScheduleData(); // Refresh data after submission
        setIsSubmitModalOpen(false);
      })
      .catch(error => {
        console.error('Error submitting schedule:', error);
      });
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
        teacherName={user?.userName || "Professor"} 
      />
    </div>
  );
};

export default TeacherSchedulePage;