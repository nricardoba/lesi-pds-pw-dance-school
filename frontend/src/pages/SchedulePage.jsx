import '../pagesCss/SchedulePage.css';
import React, { useEffect, useState } from 'react';
import { registerLocale } from 'react-datepicker';
import { pt } from 'date-fns/locale';
import { isSameWeek, getISODay } from 'date-fns';
import WeekNavigator from '../components/weekNavigator/WeekNavigator';
import DaysTabs from '../components/daysTabs/DaysTabs';
import { useAuth } from '../context/useAuth';
import FilteredDayClasses from '../components/filteredDayClasses/FilteredDayClasses';
import ClassModal from '../components/classModal/ClassModal';
import { createClassRequest, listClassesRequest } from '../services/classes';
import {
  readClassTemplatesFromStorage,
  readScheduleClassesFromStorage,
  writeScheduleClassesToStorage
} from '../utils/scheduleStorage';
import {
  WEEK_DAYS_META,
  pad2,
  formatDateForInput,
  buildWeekFromDate,
  getDateFromIso,
  toHourDecimal,
  decimalToHourString,
  buildDayClassesLayout
} from '../utils/scheduleUtils';

registerLocale('pt', pt);





const SchedulePage = () => {
  const { role, token, user } = useAuth();
  const daysOfWeek = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'DOMINGO'];
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const getWeekDayClass = (date) => {
    if (!referenceDate) return '';

    const sameWeek = isSameWeek(date, referenceDate, { weekStartsOn: 1 });

    if (!sameWeek) return '';

    const isoDay = getISODay(date); // 1 = segunda, 7 = domingo

    if (isoDay === 1) return 'week-bar week-bar-start';
    if (isoDay === 7) return 'week-bar week-bar-end';

    return 'week-bar week-bar-middle';
  };

  // Dados das aulas
  const [classesData, setClassesData] = useState(() => {
    return readScheduleClassesFromStorage();
  });

  useEffect(() => {
    // Fetch classes from backend on component mount
    const fetchClasses = async () => {
      try {
        if (token) {
          const fetchedClasses = await listClassesRequest(token);

          // Map backend format to frontend format
          const mappedClasses = fetchedClasses.map((backendClass) => {
            const startDate = new Date(backendClass.classDateStart);
            const endDate = new Date(backendClass.classDateEnd);

            const startDec = startDate.getHours() + startDate.getMinutes() / 60;
            const endDec = endDate.getHours() + endDate.getMinutes() / 60;
            const duration = endDec - startDec;

            const dayOfWeekIndex = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1; // 0=SEG, 6=DOM
            const dayName = WEEK_DAYS_META[dayOfWeekIndex]?.day || 'SEGUNDA';

            const instructor = backendClass.userClass?.find(uc => uc.userClassRole?.userClassRoleName === 'Professor')?.user?.userName || 'Sem professor';

            return {
              id: backendClass.classId,
              day: dayName,
              start: startDec,
              duration: duration > 0 ? duration : 1.5,
              name: backendClass.studioModality?.modality?.modalityName || 'Aula',
              instructor: instructor,
              room: backendClass.studioModality?.studio?.studioDesignation || 'Estúdio',
              level: 'Geral', // Hardcoded as there is no level in DB directly easily accessible
              category: backendClass.studioModality?.modality?.modalityName || 'Geral',
              occupancy: `${backendClass.userClass?.length || 0}/20`,
              classDate: formatDateForInput(startDate)
            };
          });

          if (mappedClasses.length > 0) {
            setClassesData(mappedClasses);
          }
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, [token]);

  useEffect(() => {
    writeScheduleClassesToStorage(classesData);
  }, [classesData]);

  // Estado para o dia selecionado e vista selecionada
  const [selectedDay, setSelectedDay] = useState('Todos os dias');
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' ou 'daily'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [prefillClass, setPrefillClass] = useState(null);
  const [forceCreateMode, setForceCreateMode] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [preferredClassDate, setPreferredClassDate] = useState(() => formatDateForInput(new Date()));
  const [activeSlotMenu, setActiveSlotMenu] = useState(null);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [templateTargetSlot, setTemplateTargetSlot] = useState(null);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDuration, setTemplateDuration] = useState(1);
  const [templateError, setTemplateError] = useState('');

  const currentWeek = buildWeekFromDate(referenceDate);
  const weekStart = currentWeek[0]?.fullDate;
  const weekEnd = currentWeek[currentWeek.length - 1]?.fullDate;
  const monthLabel = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(weekStart);
  const weekRangeLabel = `${pad2(weekStart.getDate())}/${pad2(weekStart.getMonth() + 1)} - ${pad2(weekEnd.getDate())}/${pad2(weekEnd.getMonth() + 1)}`;
  const currentWeekForSchedule = currentWeek.filter((weekDay) => daysOfWeek.includes(weekDay.day));

  const currentWeekDates = new Set(currentWeek.map((weekDay) => formatDateForInput(weekDay.fullDate)));
  const classesInCurrentWeek = classesData.filter((classItem) => classItem.classDate && currentWeekDates.has(classItem.classDate));

  // Função para filtrar as aulas
  const filteredClasses = classesInCurrentWeek.filter((classItem) => selectedDay === 'Todos os dias' || classItem.day === selectedDay);

  // Função para calcular a posição da aula na grelha (1 hora = 80px de altura)
  const calculatePosition = (startHour, duration, overlap = { column: 0, columns: 1 }) => {
    const baseHour = 8; // O calendário começa às 08:00
    const topPosition = (startHour - baseHour) * 80;
    const height = duration * 80;

    const safeColumns = Math.max(overlap.columns || 1, 1);
    const safeColumn = Math.min(Math.max(overlap.column || 0, 0), safeColumns - 1);
    const gutterPercent = 1.2;
    const horizontalPaddingPercent = 1.8;
    const totalGutter = (safeColumns - 1) * gutterPercent;
    const usableWidth = 100 - (horizontalPaddingPercent * 2) - totalGutter;
    const width = usableWidth / safeColumns;
    const left = horizontalPaddingPercent + (safeColumn * (width + gutterPercent));

    return {
      top: `${topPosition}px`,
      height: `${height}px`,
      width: `${width}%`,
      left: `${left}%`
    };
  };

  const handleOpenNewClass = () => {
    if (selectedDay !== 'Todos os dias') {
      const selectedDayInWeek = currentWeek.find((dayMeta) => dayMeta.day === selectedDay);
      setPreferredClassDate(selectedDayInWeek ? formatDateForInput(selectedDayInWeek.fullDate) : formatDateForInput(referenceDate));
    } else {
      setPreferredClassDate(formatDateForInput(referenceDate));
    }

    setEditingClass(null);
    setPrefillClass(null);
    setForceCreateMode(false);
    setIsModalOpen(true);
  };

  const handleEditClass = (classItem) => {
    setPrefillClass(null);
    setForceCreateMode(false);
    setEditingClass(classItem);
    setIsModalOpen(true);
  };

  const openNewClassFromSlot = (slotInfo) => {
    if (!slotInfo) {
      return;
    }

    const slotStart = toHourDecimal(slotInfo.hour);
    setPreferredClassDate(slotInfo.classDate);
    setEditingClass(null);
    setPrefillClass({
      name: '',
      room: '',
      day: slotInfo.day,
      classDate: slotInfo.classDate,
      category: '',
      instructor: '',
      class_time_start: slotInfo.hour,
      class_time_end: decimalToHourString(slotStart + 1),
      start: slotStart,
      duration: 1,
      level: '',
      occupancy: '0/15',
      maxStudents: 15
    });
    setForceCreateMode(true);
    setIsModalOpen(true);
    setActiveSlotMenu(null);
  };

  const openTemplatePickerFromSlot = (slotInfo) => {
    setTemplateOptions(readClassTemplatesFromStorage());
    setTemplateTargetSlot(slotInfo);
    setSelectedTemplate(null);
    setTemplateDuration(1);
    setTemplateError('');
    setIsTemplatePickerOpen(true);
    setActiveSlotMenu(null);
  };

  const handleUseTemplateInSlot = () => {
    if (!selectedTemplate || !templateTargetSlot) {
      return;
    }

    const startDec = toHourDecimal(templateTargetSlot.hour);
    const duration = Number(templateDuration) > 0 ? Number(templateDuration) : 1;
    const maxStudents = Number(selectedTemplate.maxStudents) || Number(selectedTemplate.occupancy?.split('/')?.[1]) || 15;

    const endDec = startDec + duration;
    const isConflict = classesData.some(c => {
      if (c.classDate !== templateTargetSlot.classDate || c.room !== selectedTemplate.room) return false;
      const cStart = Number(c.start);
      const cEnd = cStart + Number(c.duration);
      return (startDec < cEnd && endDec > cStart);
    });

    if (isConflict) {
      setTemplateError(`A sala "${selectedTemplate.room}" não está disponível para este horário e duração.`);
      return;
    }

    const classFromTemplate = {
      ...selectedTemplate,
      id: Date.now(),
      day: templateTargetSlot.day,
      classDate: templateTargetSlot.classDate,
      start: startDec,
      duration,
      class_time_start: templateTargetSlot.hour,
      class_time_end: decimalToHourString(startDec + duration),
      occupancy: `0/${maxStudents}`,
      maxStudents
    };

    setClassesData((prevData) => [...prevData, classFromTemplate]);
    setReferenceDate(getDateFromIso(templateTargetSlot.classDate));
    setIsTemplatePickerOpen(false);
    setTemplateTargetSlot(null);
    setSelectedTemplate(null);
  };

  const handleSaveClass = async (classData) => {
    try {
      if (editingClass) {
        // ... (Simulando editar por agora na DB local)
        setClassesData((prevData) => prevData.map((c) => c.id === classData.id ? classData : c));
      } else {
        // Integração real com o backend //
        const startHourStr = classData.class_time_start || decimalToHourString(classData.start);
        const endHourStr = classData.class_time_end || decimalToHourString(classData.start + classData.duration);

        const backendClassFormat = {
          schoolYearId: 1, // Fixado ou vindo do map (Ex: Ano Letivo 2025/2026) dependendo da config
          classDateStart: `${classData.classDate}T${startHourStr}:00.000Z`,
          classDateEnd: `${classData.classDate}T${endHourStr}:00.000Z`,
          classRecurrence: false,
          studioModalityId: 1, // Depende do mapeamento Estúdio <-> Modalidade na DB 
          classFinalFee: 20.00,
          classStatusId: 1 // Status: 1="Agendada"
        };

        if (token) {
          const newClass = await createClassRequest(backendClassFormat, token);

          // Re-map the created class roughly to frontend state, or just add classData
          const startDate = new Date(newClass.classDateStart || backendClassFormat.classDateStart);
          const endDate = new Date(newClass.classDateEnd || backendClassFormat.classDateEnd);
          const startDec = startDate.getHours() + startDate.getMinutes() / 60;
          const endDec = endDate.getHours() + endDate.getMinutes() / 60;
          const duration = endDec - startDec;
          const dayOfWeekIndex = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
          const dayName = WEEK_DAYS_META[dayOfWeekIndex]?.day || 'SEGUNDA';

          const mappedClass = {
            id: newClass.classId || Math.random(),
            day: dayName,
            start: startDec,
            duration: duration > 0 ? duration : 1.5,
            name: classData.name || 'Nova Aula',
            instructor: classData.instructor || 'Sem professor',
            room: classData.room || 'Estúdio 1',
            level: classData.level || 'Geral',
            category: classData.category || 'Geral',
            occupancy: '0/20',
            classDate: classData.classDate
          };

          setClassesData((prevData) => [...prevData, mappedClass]);
        } else {
          setClassesData((prevData) => [...prevData, classData]);
        }
      }

      if (classData.classDate) {
        setReferenceDate(getDateFromIso(classData.classDate));
      }

      if (viewMode === 'daily' && classData.day) {
        setSelectedDay(classData.day);
      }
    } catch (error) {
      alert("Erro ao gravar no servidor: " + error.message);
    }
  };

  const handleAskDeleteClass = (classItem) => {
    setClassToDelete(classItem);
  };

  const handleCancelDeleteClass = () => {
    setClassToDelete(null);
  };

  const handleConfirmDeleteClass = () => {
    if (!classToDelete) {
      return;
    }

    setClassesData(classesData.filter((item) => item.id !== classToDelete.id));
    setClassToDelete(null);
  };



  const goToPreviousWeek = () => {
    const prevWeek = new Date(referenceDate);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setReferenceDate(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(referenceDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setReferenceDate(nextWeek);
  };

  const getDayLayoutMap = (day) => {
    const dayClasses = classesInCurrentWeek.filter((classItem) => classItem.day === day);
    return buildDayClassesLayout(dayClasses);
  };

  const getIsoDateForDay = (day) => {
    const match = currentWeek.find((weekDay) => weekDay.day === day);
    return match ? formatDateForInput(match.fullDate) : formatDateForInput(referenceDate);
  };

  // Cria uma lista dos dias a apresentar na grelha do calendário
  const daysToRender = selectedDay === 'Todos os dias' ? daysOfWeek : [selectedDay];

  return (
    <div className="schedule-page">
      {/* Cabeçalho da Página */}
      <header className="schedule-page__header">
        <div>
          <h1 className="schedule-page__title">Horário de Aulas</h1>
          <p className="schedule-page__subtitle">Grelha semanal com todas as aulas</p>
        </div>
        {role === 'admin' && (
          <button className="btn-primary" onClick={handleOpenNewClass}>+ Nova Aula</button>
        )}
        {role === 'student' && (
          <button className="btn-primary" onClick={() => window.location.href = '/coachings'}>Pedir Coaching</button>
        )}
      </header>

      {/* Filtros e Controlos de Vista */}
      <div className="flex justify-end items-center schedule-page__filters">
        {/* View Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg view-toggle">
          <button
            onClick={() => { setViewMode('weekly'); setSelectedDay('Todos os dias'); }}
            className={`px-4 py-1.5 border-none rounded cursor-pointer font-medium transition-all duration-200 ${viewMode === 'weekly' ? 'bg-white shadow-sm text-gray-900' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Vista Semanal
          </button>
          <button
            onClick={() => {
              setViewMode('daily');
              if (selectedDay === 'Todos os dias') setSelectedDay('SEGUNDA');
            }}
            className={`px-4 py-1.5 border-none rounded cursor-pointer font-medium transition-all duration-200 ${viewMode === 'daily' ? 'bg-white shadow-sm text-gray-900' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Vista Diária
          </button>
        </div>
      </div>

      {/* Calendar Picker Strip */}
      <WeekNavigator
        referenceDate={referenceDate}
        setReferenceDate={setReferenceDate}
        monthLabel={monthLabel}
        weekRangeLabel={weekRangeLabel}
        getWeekDayClass={getWeekDayClass}
      />

      <DaysTabs
        viewMode={viewMode}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        currentWeek={currentWeek}
        currentWeekForSchedule={currentWeekForSchedule}
      />

      {/* Conteúdo da Página com base na vista selecionada */}
      {viewMode === 'daily' ? (
        <div className="mt-2 daily-view-container">

          {filteredClasses.length > 0 ? (
            <FilteredDayClasses
              day={selectedDay}
              classes={filteredClasses.sort((a, b) => a.start - b.start)}
              onEditClass={handleEditClass}
              onDeleteClass={role === 'admin' ? handleAskDeleteClass : undefined}
              role={role}
            />
          ) : (
            <div className="text-center p-10 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500 text-lg">Sem aulas agendadas para {selectedDay.toLowerCase()}.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-2 calendar-container" onClick={() => setActiveSlotMenu(null)}>
          {/* Cabeçalho dos Dias */}
          <div className="calendar-header">
            <div className="time-column-header">HORA</div>
            {daysToRender.map(day => (
              <div key={day} className="day-column-header">{day}</div>
            ))}
          </div>

          {/* Corpo do Calendário */}
          <div className="calendar-body">
            {/* Coluna das Horas */}
            <div className="time-column">
              {hours.map(hour => (
                <div key={hour} className="time-slot">{hour}</div>
              ))}
            </div>

            {/* Colunas dos Dias (onde os cartões vão encaixar) */}
            <div className="days-grid">
              {/* Linhas horizontais de fundo (guias das horas) */}
              <div className="grid-lines">
                {hours.map(hour => <div key={`line-${hour}`} className="grid-line"></div>)}
              </div>

              {/* Cartões das Aulas */}
              {daysToRender.map(day => {
                const dayClasses = classesInCurrentWeek.filter((classItem) => classItem.day === day);
                const dayLayoutMap = getDayLayoutMap(day);

                return (
                  <div key={`col-${day}`} className="day-column">
                    <div className="calendar-slots-layer">
                      {hours.map((hour) => {
                        const slotStart = toHourDecimal(hour);
                        const hasClassInSlot = dayClasses.some((classItem) => {
                          const classStart = Number(classItem.start);
                          const classEnd = classStart + Number(classItem.duration);
                          return classStart < slotStart + 1 && classEnd > slotStart;
                        });

                        const isMenuOpen =
                          activeSlotMenu?.day === day &&
                          activeSlotMenu?.hour === hour;

                        const slotInfo = {
                          day,
                          hour,
                          classDate: getIsoDateForDay(day)
                        };

                        return (
                          <div key={`${day}-${hour}`} className="calendar-slot-row">
                            {role === 'admin' && !hasClassInSlot && (
                              <button
                                type="button"
                                className={`calendar-slot-trigger ${isMenuOpen ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSlotMenu(isMenuOpen ? null : { day, hour, classDate: slotInfo.classDate });
                                }}
                                title="Adicionar aula neste slot"
                              >
                                +
                              </button>
                            )}

                            {role === 'admin' && isMenuOpen && !hasClassInSlot && (
                              <div className="slot-menu-schedule" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => openNewClassFromSlot(slotInfo)}
                                >
                                  + Nova Aula
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openTemplatePickerFromSlot(slotInfo)}
                                >
                                  ▶ Usar Template
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {dayClasses
                      .map(classItem => {
                        const overlapLayout = dayLayoutMap[classItem.id] || { column: 0, columns: 1 };

                        return (
                          <div
                            key={classItem.id}
                            className="class-card_schedule"
                            style={calculatePosition(classItem.start, classItem.duration, overlapLayout)}
                          >
                            {role === 'admin' && (
                              <div className="class-card_schedule__actions">
                                <button
                                  type="button"
                                  className="class-card_schedule__delete-btn"
                                  title="Eliminar aula"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAskDeleteClass(classItem);
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                            <h4 className="class-card_schedule__title">{classItem.name}</h4>
                            <p className="class-card_schedule__details">Professor: {classItem.instructor}</p>
                            <p className="class-card_schedule__details">Sala: {classItem.room}</p>
                            <div className="class-card_schedule__footer">
                              <span className={`class-level level-${classItem.level.toLowerCase()}`}>
                                {classItem.level}
                              </span>
                              <span className="class-occupancy">👥 {classItem.occupancy}</span>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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

      {isTemplatePickerOpen && (
        <div className="delete-confirm-overlay" onClick={() => { setIsTemplatePickerOpen(false); setTemplateTargetSlot(null); }}>
          <div className="delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-confirm-title">Escolher template</h3>
            <p className="delete-confirm-text">
              Seleciona um template para criar aula no slot {templateTargetSlot?.day} {templateTargetSlot?.hour}.
            </p>

            <div className="template-list-modal">
              {templateOptions.length === 0 && (
                <p className="delete-confirm-text">Ainda nao existem templates guardados.</p>
              )}

              {templateOptions.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  className={`template-option-btn ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                  style={{ border: selectedTemplate?.id === template.id ? '2px solid #F97316' : '' }}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <strong>{template.name}</strong>
                  <span>{template.category} • {template.instructor}</span>
                </button>
              ))}
            </div>

            {selectedTemplate && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Duração (horas):</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="8"
                  value={templateDuration}
                  onChange={(e) => {
                    setTemplateDuration(e.target.value);
                    setTemplateError('');
                  }}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                {templateError && <p style={{ color: 'red', fontSize: '0.875rem', margin: 0 }}>{templateError}</p>}
              </div>
            )}

            <div className="delete-confirm-actions" style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={() => {
                  setIsTemplatePickerOpen(false);
                  setTemplateTargetSlot(null);
                }}
              >
                Fechar
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!selectedTemplate}
                onClick={handleUseTemplateInSlot}
                style={{ padding: '10px 16px', borderRadius: '4px', border: 'none', backgroundColor: !selectedTemplate ? '#ccc' : '#F97316', color: 'white', cursor: !selectedTemplate ? 'not-allowed' : 'pointer' }}
              >
                Comfirmar e Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {classToDelete && (
        <div className="delete-confirm-overlay" onClick={handleCancelDeleteClass}>
          <div className="delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-confirm-title">Remover aula</h3>
            <p className="delete-confirm-text">
              Tens a certeza que queres remover <strong>{classToDelete.name}</strong> do horário?
            </p>
            <div className="delete-confirm-actions">
              <button type="button" className="delete-cancel-btn" onClick={handleCancelDeleteClass}>
                Cancelar
              </button>
              <button type="button" className="delete-confirm-btn" onClick={handleConfirmDeleteClass}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default SchedulePage;
