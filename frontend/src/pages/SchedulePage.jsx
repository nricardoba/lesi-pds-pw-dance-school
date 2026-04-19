import '../pagesCss/SchedulePage.css';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FilteredDayClasses from '../components/filteredDayClasses/FilteredDayClasses';
import ClassModal from '../components/classModal/ClassModal';
import {
  readClassTemplatesFromStorage,
  readScheduleClassesFromStorage,
  writeScheduleClassesToStorage
} from '../utils/scheduleStorage';


const WEEK_DAYS_META = [
  { day: 'SEGUNDA', short: 'SEG' },
  { day: 'TERÇA', short: 'TER' },
  { day: 'QUARTA', short: 'QUA' },
  { day: 'QUINTA', short: 'QUI' },
  { day: 'SEXTA', short: 'SEX' },
  { day: 'SÁBADO', short: 'SÁB' },
  { day: 'DOMINGO', short: 'DOM' }
];

const pad2 = (value) => String(value).padStart(2, '0');

const formatDateForInput = (date) => {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const getMondayOfWeek = (inputDate) => {
  const date = new Date(inputDate);
  date.setHours(12, 0, 0, 0);

  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);

  return date;
};

const buildWeekFromDate = (inputDate) => {
  const monday = getMondayOfWeek(inputDate);

  return WEEK_DAYS_META.map((meta, index) => {
    const fullDate = new Date(monday);
    fullDate.setDate(monday.getDate() + index);

    return {
      ...meta,
      date: String(fullDate.getDate()),
      fullDate
    };
  });
};

const getDateFromIso = (isoDate) => new Date(`${isoDate}T12:00:00`);

const toHourDecimal = (hourString) => {
  const [h = '0', m = '0'] = String(hourString || '08:00').split(':');
  return parseInt(h, 10) + parseInt(m, 10) / 60;
};

const decimalToHourString = (decimalHour) => {
  const safeValue = Number.isFinite(decimalHour) ? decimalHour : 8;
  const h = Math.floor(safeValue);
  const m = Math.round((safeValue - h) * 60);
  return `${pad2(h)}:${pad2(m)}`;
};

const buildDayClassesLayout = (dayClasses) => {
  const sortedClasses = [...dayClasses].sort((a, b) => {
    if (a.start === b.start) {
      return b.duration - a.duration;
    }

    return a.start - b.start;
  });

  const layoutMap = {};
  let active = [];
  let clusterIds = [];
  let clusterMaxColumns = 0;

  const finalizeCluster = () => {
    if (!clusterIds.length) {
      return;
    }

    clusterIds.forEach((classId) => {
      layoutMap[classId].columns = clusterMaxColumns;
    });

    clusterIds = [];
    clusterMaxColumns = 0;
  };

  sortedClasses.forEach((classItem) => {
    const classStart = classItem.start;

    active = active.filter((activeItem) => activeItem.end > classStart);

    if (!active.length) {
      finalizeCluster();
    }

    const usedColumns = new Set(active.map((activeItem) => activeItem.column));
    let selectedColumn = 0;

    while (usedColumns.has(selectedColumn)) {
      selectedColumn += 1;
    }

    layoutMap[classItem.id] = {
      column: selectedColumn,
      columns: 1
    };

    clusterIds.push(classItem.id);

    active.push({
      end: classItem.start + classItem.duration,
      column: selectedColumn,
      id: classItem.id
    });

    clusterMaxColumns = Math.max(clusterMaxColumns, active.length);
  });

  finalizeCluster();

  return layoutMap;
};


const SchedulePage = () => {
  const { role } = useAuth();
  const daysOfWeek = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO', 'DOMINGO'];
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const [referenceDate, setReferenceDate] = useState(() => new Date());

  // Dados das aulas reproduzidos a partir da tua imagem (com alguns extras para testar)
  const [classesData, setClassesData] = useState(() => {
    const storedClasses = readScheduleClassesFromStorage();
    if (storedClasses.length > 0) {
      return storedClasses;
    }

    const baseClasses = [
      { id: 1, day: 'TERÇA', start: 8, duration: 1.5, name: 'ballet', instructor: 'Ricardo Santos', room: 'Sala Ballet', level: 'Intermédio', category: 'Ballet', occupancy: '0/10' },
      { id: 2, day: 'SEGUNDA', start: 10, duration: 1.5, name: 'Ballet Iniciante', instructor: 'Sofia Martins', room: 'Sala Ballet', level: 'Iniciante', category: 'Ballet', occupancy: '3/15' },
      { id: 3, day: 'SÁBADO', start: 10, duration: 1.5, name: 'Dança Moderna', instructor: 'Ana Ferreira', room: 'Sala Principal', level: 'Intermédio', category: 'Modern Jazz', occupancy: '4/20' },
      { id: 4, day: 'SEGUNDA', start: 14, duration: 1.5, name: 'ballet', instructor: 'Ricardo Santos', room: 'Sala Ballet', level: 'Intermédio', category: 'Ballet', occupancy: '0/15' },
      { id: 5, day: 'TERÇA', start: 14, duration: 1.5, name: 'ballet', instructor: 'Ricardo Santos', room: 'Sala Ballet', level: 'Intermédio', category: 'Ballet', occupancy: '0/15' },
      { id: 6, day: 'QUARTA', start: 14, duration: 1.5, name: 'Ballet Intermédio', instructor: 'Sofia Martins', room: 'Sala Ballet', level: 'Intermédio', category: 'Ballet', occupancy: '3/15' },
      { id: 7, day: 'TERÇA', start: 16, duration: 1.5, name: 'Hip Hop Kids', instructor: 'Ricardo Santos', room: 'Sala Hip Hop', level: 'Iniciante', category: 'Hip Hop', occupancy: '3/20' },
      { id: 8, day: 'SEGUNDA', start: 16, duration: 1.5, name: 'Dança Contemporânea', instructor: 'Pedro Silva', room: 'Sala Principal', level: 'Avançado', category: 'Contemporânea', occupancy: '5/25' },
      { id: 9, day: 'SEGUNDA', start: 18, duration: 1.5, name: 'Hip Hop Senior', instructor: 'Marta Ferreira', room: 'Sala Hip Hop', level: 'Avançado', category: 'Hip Hop', occupancy: '2/10' }
    ];

    const initialWeek = buildWeekFromDate(new Date());

    return baseClasses.map((classItem) => {
      const weekDay = initialWeek.find((dayMeta) => dayMeta.day === classItem.day);

      return {
        ...classItem,
        classDate: weekDay ? formatDateForInput(weekDay.fullDate) : formatDateForInput(new Date())
      };
    });
  });

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

  const handleSaveClass = (classData) => {
    if (editingClass) {
      setClassesData((prevData) => prevData.map((c) => c.id === classData.id ? classData : c));
    } else {
      setClassesData((prevData) => [...prevData, classData]);
    }

    if (classData.classDate) {
      setReferenceDate(getDateFromIso(classData.classDate));
    }

    if (viewMode === 'daily' && classData.day) {
      setSelectedDay(classData.day);
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

  const handleWeekDateChange = (event) => {
    if (!event.target.value) {
      return;
    }

    setReferenceDate(new Date(`${event.target.value}T12:00:00`));
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
      <div className="schedule-page__filters" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="filter-dropdown">
          <span className="filter-icon">📅</span> {/* Ícone de calendário */}
          <select 
            value={selectedDay}
            onChange={(e) => {
              setSelectedDay(e.target.value);
              // Quando escolhe "Todos os dias" estando na vista diária, podemos manter,
              // mas normalmente a vista diária mostra um dia específico.
            }}
            className="day-select"
          >
            {viewMode === 'weekly' && <option value="Todos os dias">Todos os dias</option>}
            {daysOfWeek.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="view-toggle" style={{ display: 'flex', gap: '8px', backgroundColor: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
          <button 
            onClick={() => { setViewMode('weekly'); setSelectedDay('Todos os dias'); }}
            style={{ 
              padding: '6px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s',
              backgroundColor: viewMode === 'weekly' ? 'white' : 'transparent', 
              boxShadow: viewMode === 'weekly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', 
              color: viewMode === 'weekly' ? '#111827' : '#6B7280' 
            }}
          >
            Vista Semanal
          </button>
          <button 
            onClick={() => { 
              setViewMode('daily'); 
              if (selectedDay === 'Todos os dias') setSelectedDay('SEGUNDA'); 
            }}
            style={{ 
              padding: '6px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s',
              backgroundColor: viewMode === 'daily' ? 'white' : 'transparent', 
              boxShadow: viewMode === 'daily' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', 
              color: viewMode === 'daily' ? '#111827' : '#6B7280' 
            }}
          >
            Vista Diária
          </button>
        </div>
      </div>

      {/* Calendar Picker Strip */}
      <div className="calendar-picker-strip" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={goToPreviousWeek}
            style={{ padding: '8px 12px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}
          >
            ←
          </button>

          <label style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #E5E7EB', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151', position: 'relative' }}>
            <span style={{ color: '#F97316' }}>📅</span>
            <span style={{ textTransform: 'capitalize' }}>{monthLabel}</span>
            <span style={{ color: '#6B7280' }}>{weekRangeLabel}</span>
            <input
              type="date"
              value={formatDateForInput(referenceDate)}
              onChange={handleWeekDateChange}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              aria-label="Selecionar data para mudar a semana"
            />
          </label>

          <button
            type="button"
            onClick={goToNextWeek}
            style={{ padding: '8px 12px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}
          >
            →
          </button>
        </div>
      </div>

      {/* Days Strip */}
      <div className="days-strip" style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', padding: '8px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
        {viewMode === 'weekly' && (
          <button
            onClick={() => setSelectedDay('Todos os dias')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 14px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              minWidth: '90px',
              transition: 'all 0.2s',
              backgroundColor: selectedDay === 'Todos os dias' ? '#1A1A1A' : 'transparent',
              color: selectedDay === 'Todos os dias' ? 'white' : '#9CA3AF'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' }}>
              TODOS
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: selectedDay === 'Todos os dias' ? 600 : 500 }}>
              Dias
            </span>
          </button>
        )}

        {(viewMode === 'daily' ? currentWeek : currentWeekForSchedule).map((dayObj) => {
          const isSelected = selectedDay === dayObj.day;

          return (
            <button
              key={dayObj.day}
              onClick={() => setSelectedDay(dayObj.day)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 14px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                minWidth: '70px',
                transition: 'all 0.2s',
                backgroundColor: isSelected ? '#1A1A1A' : 'transparent',
                color: isSelected ? 'white' : '#9CA3AF'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>
                {dayObj.short}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: isSelected ? 600 : 400 }}>
                {dayObj.date}
              </span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo da Página com base na vista selecionada */}
      {viewMode === 'daily' ? (
        <div className="daily-view-container" style={{ marginTop: '8px' }}>

          {filteredClasses.length > 0 ? (
            <FilteredDayClasses 
              day={selectedDay} 
              classes={filteredClasses.sort((a, b) => a.start - b.start)} 
              onEditClass={handleEditClass}
              onDeleteClass={role === 'admin' ? handleAskDeleteClass : undefined}
              role={role}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <p style={{ color: '#6B7280', fontSize: '1.125rem' }}>Sem aulas agendadas para {selectedDay.toLowerCase()}.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="calendar-container" style={{ marginTop: '8px' }} onClick={() => setActiveSlotMenu(null)}>
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
                  )})}
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
