import React, { useState } from 'react';
import '../pagesCss/RoomsPage.css';
import RoomCard from '../components/roomCard/RoomCard';
import DaysTabs from '../components/daysTabs/DaysTabs';
import AvailabilityGrid from '../components/availabilityGrid/AvailabilityGrid';
import MaintenanceModal from '../components/maintenanceModal/MaintenanceModal';
import RoomModal from '../components/roomModal/RoomModal';
import AddClassToSlotModal from '../components/addClassToSlotModal/AddClassToSlotModal';
import AddMaintenanceToSlotModal from '../components/addMaintenanceToSlotModal/AddMaintenanceToSlotModal';

import {
  readScheduleClassesFromStorage,
  writeScheduleClassesToStorage
} from '../utils/scheduleStorage';

const RoomsPage = () => {
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
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isAddMaintenanceToSlotModalOpen, setIsAddMaintenanceToSlotModalOpen] = useState(false);
  const [isAddMaintenanceSlotModalOpen, setIsAddMaintenanceSlotModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Dados das Salas
 const [rooms, setRooms] = useState ([
    { id: 1, name: 'Sala Principal', size: 'Grande', capacity: 25, equipment: ['Espelhos', 'Barra', 'Som'] },
    { id: 2, name: 'Sala Ballet', size: 'Média', capacity: 15, equipment: ['Espelhos', 'Barra dupla', 'Piano'] },
    { id: 3, name: 'Sala Hip Hop', size: 'Média', capacity: 20, equipment: ['Espelhos', 'Som potente', 'Piso especial'] },
    { id: 4, name: 'Estúdio Pequeno', size: 'Pequena', capacity: 8, equipment: ['Espelhos', 'Som'] }
  ]);

  const [scheduledClasses, setScheduledClasses] = useState(() => {
    const persisted = readScheduleClassesFromStorage();
    return persisted.map((classItem) => ({
      id: classItem.id,
      day: normalizeDay(classItem.day),
      room: classItem.room,
      time: hourFromClass(classItem),
      className: classItem.name,
      teacher: classItem.instructor
    }));
  });

  const [maintenances, setMaintenances] = useState([
    { id: 1, day: 'Terça', room: 'Sala Principal', time: '10:00', reason: 'Reparação espelho' }
  ]);


  const handleOpenNewRoom = () => {
    setEditingRoom(null);
    setIsNewRoomModalOpen(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setIsNewRoomModalOpen(true);
  };

  const handleSaveRoom = (roomData) => {
    if (editingRoom) {
      // Atualiza a sala existente
      setRooms(rooms.map(r => r.id === roomData.id ? roomData : r));
    } else {
      // Adiciona nova sala
      setRooms([...rooms, roomData]);
    }
  };

    const handleAddClassToSlot = (room, hour) => {
    setSelectedSlot({ room: room, hour: hour, day: activeDay });
    setIsAddClassModalOpen(true);
  };

  const handleAddMaintenanceToSlot = (room, hour) => {
    setSelectedSlot({ room: room, hour: hour, day: activeDay });
    setIsAddMaintenanceSlotModalOpen(true);
  };

  // Função para guardar a nova manutenção
 const handleSaveSlotAssignment = (data) => {
    //Encontrar o nome da sala através do ID que vem do modal
    const roomObj = rooms.find(r => r.id === data.roomId);

    //objeto da aula que será adicionado à grelha
    const newClassBlock = {
      id: Date.now(),
      day: data.day,
      room: roomObj ? roomObj.name : '', 
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
        room: roomObj ? roomObj.name : '',
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
    <div className="rooms-page">
      {/* Cabeçalho */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Salas</h1>
          <p className="page-subtitle">{rooms.length} salas registadas</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setIsMaintenanceModalOpen(true)}>
            🔧 Agendar Manutenção
          </button>
          <button className="btn-primary" onClick={handleOpenNewRoom}>
            + Nova Sala
          </button>
        </div>
      </header>

      {/* Cartões das Salas */}
      <div className="rooms-cards-container">
        {rooms.map(room => (
          <RoomCard 
            key={room.id} 
            room={room} 
            onEdit={() => handleEditRoom(room)} 
          />
        ))}
      </div>

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
        rooms={rooms} 
        activeDay={activeDay}
        displayDate={formattedActiveDate}
        classes={scheduledClasses}
        maintenances={maintenances} // Passar manutenções
        onAddClass={handleAddClassToSlot} // Passar função de aula
        onAddMaintenance={handleAddMaintenanceToSlot} // Passar função de manutenção
      />

     <MaintenanceModal isOpen={isMaintenanceModalOpen} onClose={() => setIsMaintenanceModalOpen(false)} />

     <RoomModal 
        isOpen={isNewRoomModalOpen} 
        onClose={() => setIsNewRoomModalOpen(false)} 
        initialData={editingRoom}
        onSave={handleSaveRoom}
      />

      <AddClassToSlotModal 
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        slotData={selectedSlot}
        rooms={rooms}
        onSave={handleSaveSlotAssignment}
      />

      <AddMaintenanceToSlotModal 
        isOpen={isAddMaintenanceSlotModalOpen}
        onClose={() => setIsAddMaintenanceSlotModalOpen(false)}
        slotData={selectedSlot}
        rooms={rooms}
        onSave={handleSaveSlotMaintenance}
      />
    </div>
  );
};

export default RoomsPage;