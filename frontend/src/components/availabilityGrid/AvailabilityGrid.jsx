import React, { useState, useEffect, useRef } from 'react';
import './AvailabilityGrid.css';

const AvailabilityGrid = ({ rooms, activeDay, displayDate, classes, maintenances, onAddClass, onAddMaintenance }) => {
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  // Estado para saber qual célula tem o menu aberto: { roomId: 1, hour: '09:00' }
  const [activeMenu, setActiveMenu] = useState(null); 
  const gridRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (gridRef.current && !gridRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="availability-section" ref={gridRef}>
      <div className="availability-header">
        <h3>📅 Disponibilidade - {activeDay} {displayDate ? `(${displayDate})` : ''}</h3>
      </div>

      <div className="availability-grid-container">
        {/* Cabeçalho da Grelha */}
        <div className="grid-header-row" style={{ gridTemplateColumns: `80px repeat(${rooms.length}, 1fr)` }}>
          <div className="grid-cell-header">HORA</div>
          {rooms.map(room => (
            <div key={room.id} className="grid-cell-header">{room.name.toUpperCase()}</div>
          ))}
        </div>

        {/* Linhas de Horas */}
        {hours.map(hour => (
          <div key={hour} className="grid-row" style={{ gridTemplateColumns: `80px repeat(${rooms.length}, 1fr)` }}>
            <div className="grid-cell-time">{hour}</div>
            
            {rooms.map(room => {
              // Verifica se existe aula para esta sala, dia e hora
             const classHere = classes?.find(c => c.day === activeDay && c.room === room.name && c.time === hour);
              const maintenanceHere = maintenances?.find(m => m.day === activeDay && m.room === room.name && m.time === hour);
              
              const isMenuOpen = activeMenu?.roomId === room.id && activeMenu?.hour === hour;

              return (
                <div key={`${room.id}-${hour}`} className="grid-cell-content">
                  {classHere ? (
                    <div className="status-box occupied">
                      <span className="class-title">{classHere.className}</span>
                      <span className="class-teacher">{classHere.teacher}</span>
                    </div>
                  ) : maintenanceHere ? (
                    <div className="status-box maintenance">
                      <span className="class-title" style={{ color: '#D97706' }}>🔧 Manutenção</span>
                      <span className="class-teacher">{maintenanceHere.reason}</span>
                    </div>
                    ) : (
                      <div 
                      className={`status-box free ${isMenuOpen ? 'active' : ''}`}
                      onClick={() => setActiveMenu(isMenuOpen ? null : { roomId: room.id, hour })}
                    >
                      Livre
                    </div>
                  )}
                  {/* O MENU SUSPENSO (POPUP) */}
                  {isMenuOpen && !classHere && !maintenanceHere && (
                    <div className="slot-menu">
                      <button onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(null);
                        onAddClass(room, hour);
                      }}>
                        + Adicionar Aula
                      </button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(null);
                        onAddMaintenance(room, hour);
                      }}>
                        🔧 Agendar Manutenção
                      </button>
                      </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityGrid;