import '../pagesCss/SchedulePage.css';
import React, { useEffect, useState } from 'react';
import { registerLocale } from 'react-datepicker';
import { pt } from 'date-fns/locale';
import WeekNavigator from '../components/weekNavigator/weekNavigator';
import DaysTabs from '../components/daysTabs/DaysTabs';
import { useAuth } from '../context/useAuth';
import FilteredDayClasses from '../components/filteredDayClasses/FilteredDayClasses';
import ClassModal from '../components/classModal/ClassModal';
import WeeklyCalendar from '../components/weeklyCalendar/WeeklyCalendar';
import DeleteConfirmModal from '../components/deleteConfirmModal/DeleteConfirmModal';
import TemplatePickerModal from '../components/templatePickerModal/TemplatePickerModal';
import { useScheduleState } from '../Schedule/useScheduleState';
import { getUsers } from '../services/users';
import { getStudios } from '../services/studios';
import { formatDateForInput, pad2 } from '../utils/scheduleUtils';

registerLocale('pt', pt);

const SchedulePage = () => {
  const { role, token } = useAuth();
  const daysOfWeek = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'DOMINGO'];

  const scheduleProps = useScheduleState(token, daysOfWeek);

  const {
    referenceDate,
    setReferenceDate,
    getWeekDayClass,
    selectedDay,
    setSelectedDay,
    viewMode,
    isModalOpen,
    setIsModalOpen,
    editingClass,
    setEditingClass,
    prefillClass,
    setPrefillClass,
    forceCreateMode,
    setForceCreateMode,
    classToDelete,
    preferredClassDate,
    activeSlotMenu,
    setActiveSlotMenu,
    activeClassMenu,
    setActiveClassMenu,
    isTemplatePickerOpen,
    setIsTemplatePickerOpen,
    templateTargetSlot,
    setTemplateTargetSlot,
    templateOptions,
    selectedTemplate,
    setSelectedTemplate,
    templateDuration,
    setTemplateDuration,
    templateError,
    setTemplateError,
    currentWeek,
    currentWeekForSchedule,
    classesInCurrentWeek,
    filteredClasses,
    calculatePosition,
    handleOpenNewClass,
    handleEditClass,
    openNewClassFromSlot,
    openTemplatePickerFromSlot,
    handleUseTemplateInSlot,
    handleSaveClass,
    handleAskDeleteClass,
    handleCancelDeleteClass,
    handleConfirmDeleteClass,
    getDayLayoutMap,
    getIsoDateForDay
  } = scheduleProps;

  const weekStart = currentWeek[0]?.fullDate;
  const weekEnd = currentWeek[currentWeek.length - 1]?.fullDate;

  const monthLabel = weekStart
    ? new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(weekStart)
    : '';

  const weekRangeLabel =
    weekStart && weekEnd
      ? `${pad2(weekStart.getDate())}/${pad2(weekStart.getMonth() + 1)} - ${pad2(weekEnd.getDate())}/${pad2(weekEnd.getMonth() + 1)}`
      : '';

  const todayDateIso = formatDateForInput(new Date());

  // Filter state
  const [professors, setProfessors] = useState([]);
  const [studiosList, setStudiosList] = useState([]);
  const [selectedProfessorId, setSelectedProfessorId] = useState('');
  const [selectedStudioId, setSelectedStudioId] = useState('');
  const [selectedModalityId, setSelectedModalityId] = useState('');
  useEffect(() => {
    if (!token) return;

    let mounted = true;

    const fetchFilterData = async () => {
      try {
        const [usersData, studiosData] = await Promise.all([getUsers(token), getStudios(token)]);
        if (!mounted) return;
        const professorList = (usersData || []).filter((u) => u.userType?.userTypeDesc === 'Professor');
        setProfessors(professorList);
        setStudiosList(studiosData || []);
      } catch (err) {
        console.error('Failed to load filters data', err);
      }
    };

    fetchFilterData();

    return () => { mounted = false; };
  }, [token]);

  const daysToRender = selectedDay === 'Todos os dias' ? daysOfWeek : [selectedDay];

  // Apply professor/studio filters to schedule data
  const classesInCurrentWeekFiltered = (classesInCurrentWeek || []).filter((c) => {
    if (selectedProfessorId && String(c.instructorId) !== String(selectedProfessorId)) return false;
    if (selectedStudioId && String(c.room) !== String(selectedStudioId)) return false;
    if (selectedModalityId && String(c.category) !== String(selectedModalityId)) return false;
    return true;
  });

  const filteredClassesBySelection = (filteredClasses || []).filter((c) => {
    if (selectedProfessorId && String(c.instructorId) !== String(selectedProfessorId)) return false;
    if (selectedStudioId && String(c.room) !== String(selectedStudioId)) return false;
    if (selectedModalityId && String(c.category) !== String(selectedModalityId)) return false;
    return true;
  });

  return (
    <div className="schedule-page">
      <header className="schedule-page__header">
        <div>
          <h1 className="schedule-page__title">Horário de Aulas</h1>
          <p className="schedule-page__subtitle">Grelha semanal com todas as aulas</p>
        </div>


        {role === 'admin' || role === 'teacher' && (
          <button className="btn-primary" onClick={handleOpenNewClass}>
            + Nova Aula
          </button>
        )}


        {role === 'student' && (
          <button
            className="btn-primary"
            onClick={() => {
              window.location.href = '/coachings';
            }}
          >
            Pedir Coaching
          </button>
        )}
      </header>

      <WeekNavigator
        referenceDate={referenceDate}
        setReferenceDate={setReferenceDate}
        monthLabel={monthLabel}
        weekRangeLabel={weekRangeLabel}
        getWeekDayClass={getWeekDayClass}
        stepDays={7}
      />

      <DaysTabs
        viewMode={viewMode}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        currentWeek={currentWeek}
        currentWeekForSchedule={currentWeekForSchedule}
        todayDateIso={todayDateIso}
      />
      
        <div className="schedule-page__filters">
          <label>
            Professor/a:&nbsp;
            <select value={selectedProfessorId} onChange={(e) => setSelectedProfessorId(e.target.value)}>
              <option value="">Todos os professores</option>
              {professors.map((p) => (
                <option key={p.userId} value={String(p.userId)}>{p.userName}</option>
              ))}
            </select>
          </label>

          <label style={{ marginLeft: '12px' }}>
            Estúdio:&nbsp;
            <select value={selectedStudioId} onChange={(e) => setSelectedStudioId(e.target.value)}>
              <option value="">Todos os estúdios</option>
              {studiosList.map((s) => (
                <option key={s.studioId} value={String(s.studioId)}>{s.studioName}</option>
              ))}
            </select>
          </label>

          <label style={{ marginLeft: '12px' }}>
            Estilo:&nbsp;
            <select value={selectedModalityId} onChange={(e) => setSelectedModalityId(e.target.value)}>
              <option value="">Todos os estilos</option>
              {(() => {
                const mapByCat = new Map();
                (classesInCurrentWeek || []).forEach((cls) => {
                  const key = String(cls.category || cls.categoryName || cls.name || cls.id);
                  if (!mapByCat.has(key)) mapByCat.set(key, { id: cls.category || key, name: cls.categoryName || cls.name || `Aula ${cls.id}` });
                });
                return Array.from(mapByCat.values()).map((m) => (
                  <option key={m.id} value={String(m.id)}>{m.name}</option>
                ));
              })()}
            </select>
          </label>
        </div>

      {viewMode === 'daily' ? (
        <div className="mt-2 daily-view-container">
          <div className="daily-view-container__header">
            <button
              type="button"
              className="daily-view-container__back-btn"
              onClick={() => setSelectedDay('Todos os dias')}
            >
              ← Voltar à semana
            </button>
          </div>

          {filteredClassesBySelection.length > 0 ? (
            <FilteredDayClasses
              day={selectedDay}
              classes={[...filteredClassesBySelection].sort((a, b) => a.start - b.start)}
              onEditClass={handleEditClass}
              onDeleteClass={role === 'admin' ? handleAskDeleteClass : undefined}
              role={role}
            />
          ) : (
            <div className="text-center p-10 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500 text-lg">
                Sem aulas agendadas para {selectedDay.toLowerCase()}.
              </p>
            </div>
          )}
        </div>
      ) : (
        <WeeklyCalendar
          role={role}
          daysToRender={daysToRender}
          classesInCurrentWeek={classesInCurrentWeekFiltered}
          getDayLayoutMap={getDayLayoutMap}
          calculatePosition={calculatePosition}
          activeSlotMenu={activeSlotMenu}
          setActiveSlotMenu={setActiveSlotMenu}
          activeClassMenu={activeClassMenu}
          setActiveClassMenu={setActiveClassMenu}
          openNewClassFromSlot={openNewClassFromSlot}
          openTemplatePickerFromSlot={openTemplatePickerFromSlot}
          getIsoDateForDay={getIsoDateForDay}
          handleEditClass={handleEditClass}
          handleAskDeleteClass={handleAskDeleteClass}
          onGoToDailyView={(day) => {
            setSelectedDay(day);
          }}
        />
      )}

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClass(null);
          setPrefillClass(null);
          setForceCreateMode(false);
        }}
        initialData={editingClass}
        prefillData={prefillClass}
        forceCreateMode={forceCreateMode}
        preferredClassDate={preferredClassDate}
        onSave={handleSaveClass}
      />

      <TemplatePickerModal
        isOpen={isTemplatePickerOpen}
        templateTargetSlot={templateTargetSlot}
        templateOptions={templateOptions}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        templateDuration={templateDuration}
        setTemplateDuration={setTemplateDuration}
        templateError={templateError}
        setTemplateError={setTemplateError}
        onClose={() => {
          setIsTemplatePickerOpen(false);
          setTemplateTargetSlot(null);
        }}
        onConfirm={handleUseTemplateInSlot}
      />

      <DeleteConfirmModal
        isOpen={!!classToDelete}
        title="Remover aula"
        message="Tens a certeza que queres remover"
        itemName={classToDelete?.name}
        onCancel={handleCancelDeleteClass}
        onConfirm={handleConfirmDeleteClass}
      />
    </div>
  );
};

export default SchedulePage;