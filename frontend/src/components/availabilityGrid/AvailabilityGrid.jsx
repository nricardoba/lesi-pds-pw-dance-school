import React, { useState, useEffect, useRef } from 'react';
import './AvailabilityGrid.css';

const AvailabilityGrid = ({ studios, activeDay, activeDate, displayDate, classes, maintenances, onAddClass, onAddMaintenance }) => {
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  // Estado para saber qual célula tem o menu aberto: { studioId: 1, hour: '09:00' }
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
        <div className="grid-header-row" style={{ gridTemplateColumns: `80px repeat(${studios.length}, 1fr)` }}>
          <div className="grid-cell-header">HORA</div>
          {studios.map(studio => (
            <div key={studio.id} className="grid-cell-header">{studio.name.toUpperCase()}</div>
          ))}
        </div>

        {/* Linhas de Horas */}
        {hours.map(hour => (
          <div key={hour} className="grid-row" style={{ gridTemplateColumns: `80px repeat(${studios.length}, 1fr)` }}>
            <div className="grid-cell-time">{hour}</div>
            
            {studios.map(studio => {
              // Verifica se existe aula para este estúdio (preferência por studioId), dia e hora
              const classHere = classes?.find((c) => {
                const sameStudio = (c.studioId && Number(c.studioId) === Number(studio.id)) || c.studio === studio.name;
                const sameTime = c.time === hour;
                const sameDate = c.classDate ? c.classDate === activeDate : c.day === activeDay;

                return sameStudio && sameTime && sameDate;
              });
              const maintenanceHere = maintenances?.find((m) => {
                const sameStudio = (m.studioId && Number(m.studioId) === Number(studio.id)) || m.studio === studio.name;
                const sameTime = m.time === hour;
                const sameDate = m.classDate ? m.classDate === activeDate : m.day === activeDay;

                return sameStudio && sameTime && sameDate;
              });

              const isMenuOpen = activeMenu?.studioId === studio.id && activeMenu?.hour === hour;

              return (
                <div key={`${studio.id}-${hour}`} className="grid-cell-content">
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
                      onClick={() => setActiveMenu(isMenuOpen ? null : { studioId: studio.id, hour })}
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
                        onAddClass(studio, hour);
                      }}>
                        + Adicionar Aula
                      </button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(null);
                        onAddMaintenance(studio, hour);
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