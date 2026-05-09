import React, { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../services/scheduleService';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/useAuth';
import '../pagesCss/TeacherSchedulePage.css';
import TeacherScheduleStatus from '../components/teacherSchedule/TeacherScheduleStatus';
import TeacherScheduleSlots from '../components/teacherSchedule/TeacherScheduleSlots';
import TeacherScheduleHistory from '../components/teacherSchedule/TeacherScheduleHistory';
import SubmitScheduleModal from '../components/teacherSchedule/SubmitScheduleModal';

const formatDate = (dateString) => {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

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
  const [schoolYearId, setSchoolYearId] = useState(null);

  const fetchCurrentSchoolYear = useCallback(() => {
    apiClient('/school-years', { token })
      .then(response => {
        const now = new Date();
        const currentSchoolYear = response.find(schoolYear => {
          const startDate = new Date(schoolYear.schoolYearStart);
          const endDate = new Date(schoolYear.schoolYearEnd);
          return startDate <= now && now <= endDate;
        }) || response[response.length - 1];

        if (currentSchoolYear?.schoolYearId) {
          setSchoolYearId(currentSchoolYear.schoolYearId);
        }
      })
      .catch(error => {
        console.error('Error fetching school years:', error);
      });
  }, [token]);

  const fetchScheduleData = useCallback(() => {
    scheduleService.getMyScheduleVacancies(token)
      .then(response => {
        // Show PENDING slots (scheduleVacancyRecurrence === true) - slots submitted and awaiting approval
        const pendingSlots = response.filter(slot => slot.scheduleVacancyRecurrence === true);
        
        const formattedSlots = pendingSlots.map(slot => {
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

    scheduleService.getMyScheduleSubmissions(token)
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

    scheduleService.getMyLatestSubmissionStatus(token)
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
  }, [token]);

  useEffect(() => {
    if (token && user) {
      fetchCurrentSchoolYear();
      fetchScheduleData();
    }
  }, [token, user, fetchCurrentSchoolYear, fetchScheduleData]);

  const handleOpenModal = () => {
    setIsSubmitModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSubmitModalOpen(false);
  };

  const handleSubmitSchedule = (newSlots) => {
    if (!schoolYearId) {
      console.error('School year not loaded yet');
      return;
    }

    const submissionData = {
      schoolYearId,
      vacancies: newSlots.map(slot => ({
        day_of_week: slot.day,
        start_time: slot.time.split(' - ')[0],
        end_time: slot.time.split(' - ')[1],
      }))
    };

    scheduleService.submitSchedule(submissionData, token)
      .then(() => {
        console.log('Schedule submitted successfully');
        fetchScheduleData(); // Refresh data after submission
        setIsSubmitModalOpen(false);
      })
      .catch(error => {
        console.error('Error submitting schedule:', error);
      })
      .finally(() => {
        // Ensure any dangling promise handlers are resolved
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