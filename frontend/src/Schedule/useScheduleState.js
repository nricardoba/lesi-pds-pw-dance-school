import { useState } from 'react';
import { isSameWeek, getISODay } from 'date-fns';
import {
  createClassRequest,
  updateClassRequest,
  deleteClassRequest
} from '../services/classes';
import { useScheduleData } from './useScheduleData';
import { useScheduleModals } from './useScheduleModals';
import { readClassTemplatesFromStorage } from '../utils/scheduleStorage';
import {
  WEEK_DAYS_META,
  buildWeekFromDate,
  getDateFromIso,
  toHourDecimal,
  decimalToHourString,
  buildDayClassesLayout,
  formatDateForInput
} from '../utils/scheduleUtils';

export const useScheduleState = (token, daysOfWeek) => {
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState('Todos os dias');
  const viewMode = selectedDay === 'Todos os dias' ? 'weekly' : 'daily';

  const { classesData, setClassesData } = useScheduleData(token);
  const modals = useScheduleModals();

  const getWeekDayClass = (date) => {
    if (!referenceDate) return '';

    const sameWeek = isSameWeek(date, referenceDate, { weekStartsOn: 1 });
    if (!sameWeek) return '';

    const isoDay = getISODay(date);

    if (isoDay === 1) return 'week-bar week-bar-start';
    if (isoDay === 7) return 'week-bar week-bar-end';

    return 'week-bar week-bar-middle';
  };

  const currentWeek = buildWeekFromDate(referenceDate);
  const currentWeekForSchedule = currentWeek.filter((weekDay) =>
    daysOfWeek.includes(weekDay.day)
  );

  const currentWeekDates = new Set(
    currentWeek.map((weekDay) => formatDateForInput(weekDay.fullDate))
  );

  const classesInCurrentWeek = classesData.filter(
    (classItem) => classItem.classDate && currentWeekDates.has(classItem.classDate)
  );

  const filteredClasses = classesInCurrentWeek.filter(
    (classItem) => selectedDay === 'Todos os dias' || classItem.day === selectedDay
  );

  const calculatePosition = (startHour, duration, overlap = { column: 0, columns: 1 }) => {
    const baseHour = 8;
    const topPosition = (startHour - baseHour) * 80;
    const height = duration * 80;

    const safeColumns = Math.max(overlap.columns || 1, 1);
    const safeColumn = Math.min(Math.max(overlap.column || 0, 0), safeColumns - 1);
    const gutterPercent = 0.5;
    const horizontalPaddingPercent = 0.5;
    const totalGutter = (safeColumns - 1) * gutterPercent;
    const usableWidth = 100 - horizontalPaddingPercent * 2 - totalGutter;
    const width = usableWidth / safeColumns;
    const left = horizontalPaddingPercent + safeColumn * (width + gutterPercent);

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
      modals.setPreferredClassDate(
        selectedDayInWeek
          ? formatDateForInput(selectedDayInWeek.fullDate)
          : formatDateForInput(referenceDate)
      );
    } else {
      modals.setPreferredClassDate(formatDateForInput(referenceDate));
    }

    modals.setEditingClass(null);
    modals.setPrefillClass(null);
    modals.setForceCreateMode(false);
    modals.setIsModalOpen(true);
  };

  const handleEditClass = (classItem) => {
    modals.setPrefillClass(null);
    modals.setForceCreateMode(false);
    modals.setEditingClass(classItem);
    modals.setIsModalOpen(true);
  };

  const openNewClassFromSlot = (slotInfo) => {
    if (!slotInfo) return;

    const slotStart = toHourDecimal(slotInfo.hour);

    modals.setPreferredClassDate(slotInfo.classDate);
    modals.setEditingClass(null);
    modals.setPrefillClass({
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
      // level: '',
      occupancy: '0/15',
      maxStudents: 15
    });
    modals.setForceCreateMode(true);
    modals.setIsModalOpen(true);
    modals.setActiveSlotMenu(null);
  };

  const openTemplatePickerFromSlot = (slotInfo) => {
    modals.setTemplateOptions(readClassTemplatesFromStorage());
    modals.setTemplateTargetSlot(slotInfo);
    modals.setSelectedTemplate(null);
    modals.setTemplateDuration(1);
    modals.setTemplateError('');
    modals.setIsTemplatePickerOpen(true);
    modals.setActiveSlotMenu(null);
  };

  const handleUseTemplateInSlot = () => {
    if (!modals.selectedTemplate || !modals.templateTargetSlot) return;

    const startDec = toHourDecimal(modals.templateTargetSlot.hour);
    const duration =
      Number(modals.templateDuration) > 0 ? Number(modals.templateDuration) : 1;
    const maxStudents =
      Number(modals.selectedTemplate.maxStudents) ||
      Number(modals.selectedTemplate.occupancy?.split('/')?.[1]) ||
      15;
    const endDec = startDec + duration;

    const isConflict = classesData.some((c) => {
      if (
        c.classDate !== modals.templateTargetSlot.classDate ||
        c.room !== modals.selectedTemplate.room
      ) {
        return false;
      }

      const cStart = Number(c.start);
      const cEnd = cStart + Number(c.duration);

      return startDec < cEnd && endDec > cStart;
    });

    if (isConflict) {
      modals.setTemplateError(
        `A sala "${modals.selectedTemplate.room}" não está disponível para este horário e duração.`
      );
      return;
    }

    const classFromTemplate = {
      ...modals.selectedTemplate,
      id: Date.now(),
      day: modals.templateTargetSlot.day,
      classDate: modals.templateTargetSlot.classDate,
      start: startDec,
      duration,
      class_time_start: modals.templateTargetSlot.hour,
      class_time_end: decimalToHourString(startDec + duration),
      occupancy: `0/${maxStudents}`,
      maxStudents
    };

    setClassesData((prevData) => [...prevData, classFromTemplate]);
    setReferenceDate(getDateFromIso(modals.templateTargetSlot.classDate));
    modals.setIsTemplatePickerOpen(false);
    modals.setTemplateTargetSlot(null);
    modals.setSelectedTemplate(null);
  };

  const handleSaveClass = async (classData) => {
    try {
      if (modals.editingClass) {
        if (token) {
          const startHourStr =
            classData.class_time_start || decimalToHourString(classData.start);
          const endHourStr =
            classData.class_time_end ||
            decimalToHourString(classData.start + classData.duration);

          const backendClassFormat = {
            schoolYearId: 1,
            classDateStart: `${classData.classDate}T${startHourStr}:00`,
            classDateEnd: `${classData.classDate}T${endHourStr}:00`,
            classRecurrence: classData.recurrence || false,
            studioModalityId: 1,
            classFinalFee: classData.classFinalFee || 20.0,
            classStatusId: 1
          };
          
          await updateClassRequest(classData.id, backendClassFormat, token);
          // For frontend immediate update (assuming the mapping is fine as is)
        }
        
        setClassesData((prevData) =>
          prevData.map((c) => (c.id === classData.id ? classData : c))
        );
      } else {
        const startHourStr =
          classData.class_time_start || decimalToHourString(classData.start);
        const endHourStr =
          classData.class_time_end ||
          decimalToHourString(classData.start + classData.duration);

        const backendClassFormat = {
          schoolYearId: 1,
          classDateStart: `${classData.classDate}T${startHourStr}:00`,
          classDateEnd: `${classData.classDate}T${endHourStr}:00`,
          classRecurrence: false,
          studioModalityId: 1,
          classFinalFee: 20.0,
          classStatusId: 1
        };

        if (token) {
          const newClass = await createClassRequest(backendClassFormat, token);

          const startDate = new Date(
            newClass.classDateStart || backendClassFormat.classDateStart
          );
          const endDate = new Date(
            newClass.classDateEnd || backendClassFormat.classDateEnd
          );

          const startDec = startDate.getHours() + startDate.getMinutes() / 60;
          const endDec = endDate.getHours() + endDate.getMinutes() / 60;
          const duration = endDec - startDec;

          const dayOfWeekIndex =
            startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
          const dayName = WEEK_DAYS_META[dayOfWeekIndex]?.day || 'SEGUNDA';

          const mappedClass = {
            id: newClass.classId || Math.random(),
            day: dayName,
            start: startDec,
            duration: duration > 0 ? duration : 1.5,
            name: classData.name || 'Nova Aula',
            instructor: classData.instructor || 'Sem professor',
            room: classData.room || 'Estúdio 1',
            // level: classData.level || 'Geral',
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
      const message =
        error instanceof Error ? error.message : 'Erro ao gravar no servidor.';
      alert(`Erro ao gravar no servidor: ${message}`);
    }
  };

  const handleAskDeleteClass = (classItem) => {
    modals.setClassToDelete(classItem);
  };

  const handleCancelDeleteClass = () => {
    modals.setClassToDelete(null);
  };

  const handleConfirmDeleteClass = async () => {
    if (!modals.classToDelete) return;

    try {
      if (token) {
        await deleteClassRequest(modals.classToDelete.id, token);
      }
      setClassesData((prevData) =>
        prevData.filter((item) => item.id !== modals.classToDelete.id)
      );
      modals.setClassToDelete(null);
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Erro ao apagar a aula do servidor.');
    }
  };

  const getDayLayoutMap = (day) => {
    const dayClasses = classesInCurrentWeek.filter((classItem) => classItem.day === day);
    return buildDayClassesLayout(dayClasses);
  };

  const getIsoDateForDay = (day) => {
    const match = currentWeek.find((weekDay) => weekDay.day === day);
    return match
      ? formatDateForInput(match.fullDate)
      : formatDateForInput(referenceDate);
  };

  return {
    referenceDate,
    setReferenceDate,
    getWeekDayClass,
    selectedDay,
    setSelectedDay,
    viewMode,
    
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
    getIsoDateForDay,
    ...modals
  };
};