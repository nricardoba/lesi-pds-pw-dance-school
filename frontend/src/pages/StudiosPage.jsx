import React, { useEffect, useMemo, useState } from 'react';
import '../pagesCss/StudiosPage.css';
import StudioCard from '../components/studioCard/StudioCard';
import DaysTabs from '../components/daysTabs/DaysTabs';
import AvailabilityGrid from '../components/availabilityGrid/AvailabilityGrid';
import MaintenanceModal from '../components/maintenanceModal/MaintenanceModal';
import StudioModal from '../components/studioModal/StudioModal';
import AddMaintenanceToSlotModal from '../components/addMaintenanceToSlotModal/AddMaintenanceToSlotModal';
import WeekNavigator from '../components/weekNavigator/weekNavigator';
import ClassModal from '../components/classModal/ClassModal';

import { useAuth } from '../context/useAuth';
import { getStudios, createStudio, updateStudio, getStudioModalities, createStudioModality, deleteStudioModality } from '../services/studios';
import { createClassRequest, updateClassRequest } from '../services/classes';

import {
  buildWeekFromDate,
  formatDateForInput,
  getDateFromIso,
  toHourDecimal,
  decimalToHourString,
} from '../utils/scheduleUtils';

import {
  readScheduleClassesFromStorage,
} from '../utils/scheduleStorage';

import { useScheduleData } from '../Schedule/useScheduleData';

import { isSameWeek, getISODay } from 'date-fns';

const StudiosPage = () => {
  const { token, user } = useAuth();
  const isAdmin = user?.user_type_desc?.toLowerCase() === 'admin';
  const normalizeDay = (day) => {
    if (!day) {
      return '';
    }

    return `${day.charAt(0).toUpperCase()}${day.slice(1).toLowerCase()}`;
  };

  const pad2 = (value) => String(value).padStart(2, '0');

  const hourFromClass = (classItem) => {
    if (classItem.class_time_start) {
      return classItem.class_time_start;
    }

    if (typeof classItem.start === 'number') {
      const h = Math.floor(classItem.start);
      const m = Math.round((classItem.start - h) * 60);
      return `${pad2(h)}:${pad2(m)}`;
    }

    return '08:00';
  };

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const [activeDay, setActiveDay] = useState('Segunda');


  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isNewStudioModalOpen, setIsNewStudioModalOpen] = useState(false);
  const [editingStudio, setEditingStudio] = useState(null);
  const [isAddMaintenanceToSlotModalOpen, setIsAddMaintenanceToSlotModalOpen] = useState(false);
  const [isAddMaintenanceSlotModalOpen, setIsAddMaintenanceSlotModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [prefillClass, setPrefillClass] = useState(null);
  const [preferredClassDate, setPreferredClassDate] = useState('');
  const [forceCreateMode, setForceCreateMode] = useState(false);

  const [studios, setStudios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { classesData, setClassesData } = useScheduleData(token);

  const fetchStudios = async () => {
    try {
      setIsLoading(true);
      const data = await getStudios(token);
      
      const formattedStudios = data.map(s => ({
        id: s.studioId,
        name: s.studioName,
        capacity: s.studioMaxCapacity,
        size: s.studioMaxCapacity >= 20 ? 'Grande' : s.studioMaxCapacity >= 10 ? 'Média' : 'Pequena',
        equipment: [],
      }));

      setStudios(formattedStudios);
    } catch (error) {
      console.error('Erro ao carregar estúdios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (token) fetchStudios();
  }, [token]);

  useEffect(() => {
    const syncClassesFromStorage = () => {
      const persisted = readScheduleClassesFromStorage();

      setClassesData(
        persisted.map((classItem) => ({
          id: classItem.id,
          day: classItem.day,
          start: typeof classItem.start === 'number' ? classItem.start : toHourDecimal(classItem.class_time_start),
          duration: typeof classItem.duration === 'number' ? classItem.duration : 1,
          name: classItem.name,
          instructor: classItem.instructor,
          instructorName: classItem.instructorName,
          room: classItem.room,
          roomName: classItem.roomName,
          category: classItem.category,
          categoryName: classItem.categoryName,
          occupancy: classItem.occupancy,
          classDate: classItem.classDate,
          class_time_start: classItem.class_time_start,
          class_time_end: classItem.class_time_end,
          studioId: classItem.studioId,
          schoolYear: classItem.schoolYear,
        }))
      );
    };

    syncClassesFromStorage();
    window.addEventListener('scheduleClassesUpdated', syncClassesFromStorage);
    window.addEventListener('storage', syncClassesFromStorage);

    return () => {
      window.removeEventListener('scheduleClassesUpdated', syncClassesFromStorage);
      window.removeEventListener('storage', syncClassesFromStorage);
    };
  }, [setClassesData]);

  const scheduledClasses = useMemo(() => {
    return (classesData || []).map((classItem) => ({
      id: classItem.id,
      day: normalizeDay(classItem.day),
      studio: classItem.roomName || classItem.room || classItem.studio || '',
      studioId: classItem.studioId || null,
      time: hourFromClass(classItem),
      className: classItem.name,
      teacher: classItem.instructorName || classItem.instructor || 'A Definir'
    }));
  }, [classesData]);

  const [maintenances, setMaintenances] = useState([
    { id: 1, day: 'Terça', studio: 'Estúdio Principal', time: '10:00', reason: 'Reparação espelho' }
  ]);

  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const currentWeek = buildWeekFromDate(referenceDate);
  const getWeekDayClass = (date) => {
    if (!referenceDate) return '';

    const sameWeek = isSameWeek(date, referenceDate, { weekStartsOn: 1 });
    if (!sameWeek) return '';

    const isoDay = getISODay(date);

    if (isoDay === 1) return 'week-bar week-bar-start';
    if (isoDay === 7) return 'week-bar week-bar-end';

    return 'week-bar week-bar-middle';
  };


  const handleOpenNewStudio = () => {
    setEditingStudio(null);
    setIsNewStudioModalOpen(true);
  };

  const handleEditStudio = (studio) => {
    setEditingStudio({
       id: studio.id,
       studio_name: studio.name,
       studio_max_capacity: studio.capacity,
    });
    setIsNewStudioModalOpen(true);
  };

  const handleSaveStudio = async (studioData) => {
    try {
      const payload = {
         studioName: studioData.studio_name,
         studioMaxCapacity: studioData.studio_max_capacity,
      };

      let savedStudio = null;
      if (editingStudio) {
        savedStudio = await updateStudio(editingStudio.id, payload, token);
      } else {
        savedStudio = await createStudio(payload, token);
      }

      // If modalities provided, sync relations: delete existing relations for this studio and recreate
      if (Array.isArray(studioData.modalities)) {
        try {
          // fetch all studio-modalities
          const allRelations = await getStudioModalities(token);
          // find relations for this studio (if created, savedStudio.studioId, else editingStudio.id)
          const studioId = savedStudio?.studioId || (editingStudio && editingStudio.id);
          if (studioId) {
            const myRelations = (Array.isArray(allRelations) ? allRelations : []).filter(r => r.studioId === studioId || (r.studio && r.studio.studioId === studioId));
            // delete existing
            for (const rel of myRelations) {
              await deleteStudioModality(rel.studioModalityId, token);
            }
            // create new relations
            for (const modalityId of studioData.modalities) {
              await createStudioModality({ studioId, modalityId }, token);
            }
          }
        } catch (relErr) {
          console.error('Erro a sincronizar modalidades do estúdio:', relErr);
        }
      }

      await fetchStudios();
    } catch(err) {
      console.error('Erro a guardar estúdio:', err);
    }
  };

    const handleAddClassToSlot = (studio, hour) => {
      const activeWeekDay = currentWeek[daysOfWeek.indexOf(activeDay)];
      const slotDate = activeWeekDay ? formatDateForInput(activeWeekDay.fullDate) : formatDateForInput(referenceDate);

      setSelectedSlot({ studio: studio, hour: hour, day: activeDay, classDate: slotDate });
      setPreferredClassDate(slotDate);
      setPrefillClass({
        name: '',
        room: String(studio.id),
        roomName: studio.name,
        day: activeDay.toUpperCase(),
        classDate: slotDate,
        category: '',
        instructor: '',
        class_time_start: hour,
        class_time_end: decimalToHourString(toHourDecimal(hour) + 1),
        start: toHourDecimal(hour),
        duration: 1,
        occupancy: '0/15',
        maxStudents: studio.capacity || 15
      });
      setForceCreateMode(true);
      setIsClassModalOpen(true);
  };

  const handleAddMaintenanceToSlot = (studio, hour) => {
    setSelectedSlot({ studio: studio, hour: hour, day: activeDay });
    setIsAddMaintenanceSlotModalOpen(true);
  };

  const handleSaveClass = async (classData) => {
    try {
      const startHourStr = classData.class_time_start || decimalToHourString(classData.start);
      const endHourStr = classData.class_time_end || decimalToHourString(classData.start + classData.duration);

      const backendClassFormat = {
        schoolYearId: Number(classData.schoolYear) || 1,
        classDateStart: `${classData.classDate}T${startHourStr}:00`,
        classDateEnd: `${classData.classDate}T${endHourStr}:00`,
        classRecurrence: false,
        studioId: Number(classData.room),
        modalityId: Number(classData.category),
        instructorId: classData.instructorId ? Number(classData.instructorId) : Number(classData.instructor) || undefined,
        classFinalFee: 20.0,
        classStatusId: 1
      };

      if (backendClassFormat.instructorId === undefined || Number.isNaN(backendClassFormat.instructorId)) {
        delete backendClassFormat.instructorId;
      }

      if (classData.id && classesData.some((c) => c.id === classData.id)) {
        await updateClassRequest(classData.id, backendClassFormat, token);
        setClassesData((prevData) =>
          prevData.map((c) => (c.id === classData.id ? { ...c, ...classData } : c))
        );
      } else {
        const newClass = await createClassRequest(backendClassFormat, token);

        const startDate = getDateFromIso(classData.classDate);
        const startDec = toHourDecimal(startHourStr);
        const endDec = toHourDecimal(endHourStr);

        setClassesData((prevData) => [
          ...prevData,
          {
            id: newClass.classId || Date.now(),
            day: classData.day,
            start: startDec,
            duration: endDec - startDec || 1,
            name: classData.categoryName || classData.name || 'Nova Aula',
            instructor: classData.instructor || 'Sem professor',
            instructorName: classData.instructorName || classData.instructor || 'Sem professor',
            room: classData.room,
            roomName: classData.roomName || classData.room || 'Estúdio',
            category: classData.category,
            categoryName: classData.categoryName || classData.category || 'Geral',
            occupancy: '0/20',
            classDate: classData.classDate,
            class_time_start: startHourStr,
            class_time_end: endHourStr,
            studioId: Number(classData.room),
            schoolYear: String(classData.schoolYear || 1),
          }
        ]);

        setReferenceDate(startDate);
      }
    } catch (error) {
      console.error('Erro a guardar aula:', error);
    }
  };

  //Função para guardar a nova manutenção
  const handleSaveSlotMaintenance = (maintenanceData) => {
    // Adiciona o novo bloco laranja à grelha!
    setMaintenances([...maintenances, maintenanceData]);
  };

  const weekStart = currentWeek[0]?.fullDate || new Date(referenceDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const dayIndex = daysOfWeek.indexOf(activeDay);
  const activeWeekDay = currentWeek[dayIndex];
  const activeDateObj = activeWeekDay ? activeWeekDay.fullDate : new Date(weekStart);
  const formattedActiveDate = `${pad2(activeDateObj.getDate())}/${pad2(activeDateObj.getMonth() + 1)}`;

  const dateForLabel = activeDateObj || new Date(referenceDate);
  const monthLabel = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(dateForLabel);
  const weekRangeLabel = formattedActiveDate;

  return (
    <div className="studios-page">
      {/* Cabeçalho */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Estúdios</h1>
          <p className="page-subtitle">{studios.length} estúdios registadas</p>
        </div>
        <div className="header-actions">
          {isAdmin && (
            <button className="btn-secondary" onClick={() => setIsMaintenanceModalOpen(true)}>
              🔧 Agendar Manutenção
            </button>
          )}
          {isAdmin && (
            <button className="btn-primary" onClick={handleOpenNewStudio}>
              + Novo Estúdio
            </button>
          )}
        </div>
      </header>

      {/* Cartões das Estúdios */}
      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>A carregar estúdios...</div>
      ) : (
        <div className="studios-cards-container">
          {studios.map(studio => (
            <StudioCard 
              key={studio.id} 
              studio={studio} 
              isAdmin={isAdmin}
              onEdit={() => handleEditStudio(studio)} 
            />
          ))}
          {studios.length === 0 && <div className="empty-results">Nenhum estúdio encontrado.</div>}
        </div>
      )}

      <WeekNavigator
        referenceDate={referenceDate}
        setReferenceDate={setReferenceDate}
        monthLabel={monthLabel}
        weekRangeLabel={weekRangeLabel}
        getWeekDayClass={getWeekDayClass}
      />

      <DaysTabs days={daysOfWeek} activeDay={activeDay} onSelectDay={setActiveDay} />

      <AvailabilityGrid 
        studios={studios} 
        activeDay={activeDay}
        displayDate={formattedActiveDate}
        classes={scheduledClasses}
        maintenances={maintenances} // Passar manutenções
        onAddClass={handleAddClassToSlot} // Passar função de aula
        onAddMaintenance={handleAddMaintenanceToSlot} // Passar função de manutenção
      />

     <MaintenanceModal isOpen={isMaintenanceModalOpen} onClose={() => setIsMaintenanceModalOpen(false)} />

     <StudioModal 
        isOpen={isNewStudioModalOpen} 
        onClose={() => setIsNewStudioModalOpen(false)} 
        initialData={editingStudio}
        onSave={handleSaveStudio}
      />

      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setPrefillClass(null);
          setForceCreateMode(false);
          setPreferredClassDate('');
        }}
        initialData={null}
        prefillData={prefillClass}
        forceCreateMode={forceCreateMode}
        preferredClassDate={preferredClassDate}
        onSave={handleSaveClass}
      />

      <AddMaintenanceToSlotModal 
        isOpen={isAddMaintenanceSlotModalOpen}
        onClose={() => setIsAddMaintenanceSlotModalOpen(false)}
        slotData={selectedSlot}
        studios={studios}
        onSave={handleSaveSlotMaintenance}
      />
    </div>
  );
};

export default StudiosPage;