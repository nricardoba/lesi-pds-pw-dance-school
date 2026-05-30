import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { scheduleService } from '../services/scheduleService';
import { getSchoolYears } from '../services/schoolYears';
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

const WEEK_DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const findCurrentSchoolYear = (schoolYears, referenceDate = new Date()) => {
  return schoolYears.find((schoolYear) => {
    const startDate = new Date(schoolYear.schoolYearStart);
    const endDate = new Date(schoolYear.schoolYearEnd);
    return startDate <= referenceDate && referenceDate <= endDate;
  }) || null;
};

const TeacherSchedulePage = () => {
  const { token, user } = useAuth();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState({});
  const [teacherVacancies, setTeacherVacancies] = useState([]);
  const [history, setHistory] = useState([]);
  const [schoolYearId, setSchoolYearId] = useState(null);
  const [schoolYearName, setSchoolYearName] = useState('');
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState('');

  const schoolYearNameById = useMemo(() => {
    return new Map(
      schoolYears.map((schoolYear) => [String(schoolYear.schoolYearId), schoolYear.schoolYearName])
    );
  }, [schoolYears]);

  const currentSchoolYear = useMemo(() => {
    const byDate = findCurrentSchoolYear(schoolYears);
    if (byDate) {
      return byDate;
    }

    if (schoolYearId != null) {
      return schoolYears.find((schoolYear) => schoolYear.schoolYearId === schoolYearId) || null;
    }

    return schoolYears[0] || null;
  }, [schoolYears, schoolYearId]);

  const currentSchoolYearLabel = currentSchoolYear?.schoolYearName || schoolYearName || 'A carregar...';

  const selectedSchoolYearName = useMemo(() => {
    if (selectedSchoolYearId === 'all') {
      return 'Todos os anos letivos';
    }

    if (!selectedSchoolYearId) {
      return schoolYearName || 'Ano letivo atual';
    }

    return schoolYearNameById.get(String(selectedSchoolYearId)) || 'Ano letivo';
  }, [selectedSchoolYearId, schoolYearName, schoolYearNameById]);

  const availableSlots = useMemo(() => {
    const effectiveSchoolYearId =
      selectedSchoolYearId === 'all'
        ? null
        : selectedSchoolYearId
          ? Number(selectedSchoolYearId)
          : schoolYearId;

    const currentYearVacancies = teacherVacancies.filter(slot => {
      if (effectiveSchoolYearId == null) {
        return slot.scheduleVacancyRecurrence === true;
      }

      return slot.schoolYearId === effectiveSchoolYearId && slot.scheduleVacancyRecurrence === true;
    });

    return currentYearVacancies.map(slot => {
      const startDate = new Date(slot.scheduleVacancyStart);
      const endDate = new Date(slot.scheduleVacancyEnd);
      const startStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
      const endStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

      return {
        id: slot.scheduleVacancyId,
        day: WEEK_DAYS[startDate.getDay()],
        time: `${startStr} - ${endStr}`,
        schoolYearName:
          slot.schoolYear?.schoolYearName ||
          schoolYearNameById.get(String(slot.schoolYearId)) ||
          'Ano letivo não definido'
      };
    });
  }, [teacherVacancies, schoolYearId, selectedSchoolYearId, schoolYearNameById]);

  const fetchSchoolYears = useCallback(() => {
    getSchoolYears(token)
      .then(response => {
        const normalizedSchoolYears = response.map((schoolYear) => ({
          schoolYearId: schoolYear.schoolYearId,
          schoolYearName: schoolYear.schoolYearName,
          schoolYearStart: schoolYear.schoolYearStart,
          schoolYearEnd: schoolYear.schoolYearEnd
        }));

        setSchoolYears(normalizedSchoolYears);

        const currentSchoolYear = findCurrentSchoolYear(normalizedSchoolYears);

        if (currentSchoolYear?.schoolYearId) {
          setSchoolYearId(currentSchoolYear.schoolYearId);
          setSchoolYearName(currentSchoolYear.schoolYearName || 'Ano letivo atual');
          setSelectedSchoolYearId(String(currentSchoolYear.schoolYearId));
        } else {
          setSchoolYearId(null);
          setSchoolYearName('');
        }
      })
      .catch(error => {
        console.error('Error fetching school years:', error);
      });
  }, [token]);

  const fetchScheduleData = useCallback(() => {
    scheduleService.getMyScheduleVacancies(token)
      .then(response => {
        setTeacherVacancies(response);
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
      fetchSchoolYears();
      fetchScheduleData();
    }
  }, [token, user, fetchSchoolYears, fetchScheduleData]);

  const handleOpenModal = () => {
    const currentSchoolYear = findCurrentSchoolYear(schoolYears);

    if (currentSchoolYear?.schoolYearId) {
      setSchoolYearId(currentSchoolYear.schoolYearId);
      setSchoolYearName(currentSchoolYear.schoolYearName || 'Ano letivo atual');
    }

    setIsSubmitModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSubmitModalOpen(false);
  };

  const handleSubmitSchedule = (newSlots) => {
    const currentSchoolYear = findCurrentSchoolYear(schoolYears);
    const currentSchoolYearId = currentSchoolYear?.schoolYearId || schoolYearId;

    if (!currentSchoolYearId) {
      console.error('School year not loaded yet');
      return;
    }

    const submissionData = {
      schoolYearId: currentSchoolYearId,
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
          <p className="page-subtitle">Ano letivo associado: {currentSchoolYearLabel}</p>
        </div>
        <button type="button" className="submit-schedule-btn" onClick={handleOpenModal}>
          <span className="submit-schedule-btn__icon">＋</span>
          Enviar Novo Horário
        </button>
      </header>

      <div className="teacher-schedule-page__year-filter">
        <label htmlFor="teacher-schedule-year-filter">Ano letivo nos horários disponíveis</label>
        <select
          id="teacher-schedule-year-filter"
          value={selectedSchoolYearId}
          onChange={(event) => setSelectedSchoolYearId(event.target.value)}
        >
          <option value="all">Todos os anos letivos</option>
          {schoolYears.map((schoolYear) => (
            <option key={schoolYear.schoolYearId} value={String(schoolYear.schoolYearId)}>
              {schoolYear.schoolYearName}
            </option>
          ))}
        </select>
        <span className="teacher-schedule-page__year-filter-hint">
          A mostrar: {selectedSchoolYearName}
        </span>
      </div>

      <TeacherScheduleStatus currentStatus={currentStatus} />
      
      <TeacherScheduleSlots availableSlots={availableSlots} selectedSchoolYearName={selectedSchoolYearName} />
      
      <TeacherScheduleHistory history={history} />

      <SubmitScheduleModal 
        isOpen={isSubmitModalOpen} 
        onClose={handleCloseModal} 
        onSubmit={handleSubmitSchedule} 
        teacherName={user?.userName || "Professor"}
        schoolYearName={currentSchoolYearLabel}
        vacancies={teacherVacancies}
        schoolYearId={schoolYearId}
      />
    </div>
  );
};

export default TeacherSchedulePage;