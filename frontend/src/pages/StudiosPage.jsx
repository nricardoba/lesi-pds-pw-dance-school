import React, { useState } from 'react';
import '../pagesCss/StudiosPage.css';
import StudioCard from '../components/studioCard/StudioCard';
import DaysTabs from '../components/daysTabs/DaysTabs';
import AvailabilityGrid from '../components/availabilityGrid/AvailabilityGrid';
import MaintenanceModal from '../components/maintenanceModal/MaintenanceModal';
import StudioModal from '../components/studioModal/StudioModal';
import AddClassToSlotModal from '../components/addClassToSlotModal/AddClassToSlotModal';
import AddMaintenanceToSlotModal from '../components/addMaintenanceToSlotModal/AddMaintenanceToSlotModal';

import { useAuth } from '../context/useAuth';
import { getStudios, createStudio, updateStudio } from '../services/studios';

import {
  readScheduleClassesFromStorage,
  writeScheduleClassesToStorage
} from '../utils/scheduleStorage';

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
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isAddMaintenanceToSlotModalOpen, setIsAddMaintenanceToSlotModalOpen] = useState(false);
  const [isAddMaintenanceSlotModalOpen, setIsAddMaintenanceSlotModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [studios, setStudios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const [scheduledClasses, setScheduledClasses] = useState(() => {
    const persisted = readScheduleClassesFromStorage();
    return persisted.map((classItem) => ({
      id: classItem.id,
      day: normalizeDay(classItem.day),
      studio: classItem.studio,
      time: hourFromClass(classItem),
      className: classItem.name,
      teacher: classItem.instructor
    }));
  });

  const [maintenances, setMaintenances] = useState([
    { id: 1, day: 'Terça', studio: 'Estúdio Principal', time: '10:00', reason: 'Reparação espelho' }
  ]);


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

      if (editingStudio) {
        await updateStudio(editingStudio.id, payload, token);
      } else {
        await createStudio(payload, token);
      }
      
      await fetchStudios();
    } catch(err) {
      console.error('Erro a guardar estúdio:', err);
    }
  };

    const handleAddClassToSlot = (studio, hour) => {
    setSelectedSlot({ studio: studio, hour: hour, day: activeDay });
    setIsAddClassModalOpen(true);
  };

  const handleAddMaintenanceToSlot = (studio, hour) => {
    setSelectedSlot({ studio: studio, hour: hour, day: activeDay });
    setIsAddMaintenanceSlotModalOpen(true);
  };

  // Função para guardar a nova manutenção
 const handleSaveSlotAssignment = (data) => {
    //Encontrar o nome da estúdio através do ID que vem do modal
    const studioObj = studios.find(r => r.id === data.studioId);

    //objeto da aula que será adicionado à grelha
    const newClassBlock = {
      id: Date.now(),
      day: data.day,
      studio: studioObj ? studioObj.name : '', 
      time: data.hour,                   
      className: 'Aula Atribuída',       
      teacher: 'A Definir'               
    };

    //Adicionar o novo bloco aulas!
    const nextScheduledClasses = [...scheduledClasses, newClassBlock];
    setScheduledClasses(nextScheduledClasses);

    const startHour = parseInt((data.hour || '08:00').split(':')[0], 10);
    const sourceClasses = readScheduleClassesFromStorage();
    const nextSourceClasses = [
      ...sourceClasses,
      {
        id: Date.now(),
        name: 'Aula Atribuída',
        studio: studioObj ? studioObj.name : '',
        day: (data.day || '').toUpperCase(),
        classDate: '',
        category: 'A Definir',
        instructor: 'A Definir',
        class_time_start: data.hour,
        class_time_end: `${pad2(startHour + 1)}:00`,
        start: startHour,
        duration: 1,
        level: 'Todos',
        occupancy: '0/10',
        maxStudents: 10
      }
    ];

    writeScheduleClassesToStorage(nextSourceClasses);
  };

  //Função para guardar a nova manutenção
  const handleSaveSlotMaintenance = (maintenanceData) => {
    // Adiciona o novo bloco laranja à grelha!
    setMaintenances([...maintenances, maintenanceData]);
  };

  const [referenceDate, setReferenceDate] = useState(() => new Date());

  const getMondayOfWeek = (inputDate) => {
    const date = new Date(inputDate);
    date.setHours(12, 0, 0, 0);
    const day = date.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + offset);
    return date;
  };

  const weekStart = getMondayOfWeek(referenceDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const monthLabel = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(weekStart);
  const weekRangeLabel = `${pad2(weekStart.getDate())}/${pad2(weekStart.getMonth() + 1)} - ${pad2(weekEnd.getDate())}/${pad2(weekEnd.getMonth() + 1)}`;

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

  const dayIndex = daysOfWeek.indexOf(activeDay);
  const activeDateObj = new Date(weekStart);
  if (dayIndex !== -1) {
    activeDateObj.setDate(weekStart.getDate() + dayIndex);
  }
  const formattedActiveDate = `${pad2(activeDateObj.getDate())}/${pad2(activeDateObj.getMonth() + 1)}`;

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

      <div className="calendar-picker-strip" style={{ margin: '20px 0' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={goToPreviousWeek}
            style={{ padding: '8px 12px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}
          >
            ←
          </button>

          <div style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #E5E7EB', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
            <span style={{ color: '#8b5CF6' }}>📅</span>
            <span style={{ textTransform: 'capitalize' }}>{monthLabel}</span>
            <span style={{ color: '#6B7280' }}>{weekRangeLabel}</span>
          </div>

          <button
            type="button"
            onClick={goToNextWeek}
            style={{ padding: '8px 12px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}
          >
            →
          </button>
        </div>
      </div>

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

      <AddClassToSlotModal 
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        slotData={selectedSlot}
        studios={studios}
        onSave={handleSaveSlotAssignment}
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