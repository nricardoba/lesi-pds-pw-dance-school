import React from 'react';
import './WeeklyCalendar.css';
import { toHourDecimal } from '../../utils/scheduleUtils';

const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

const WeeklyCalendar = ({
  role,
  daysToRender,
  classesInCurrentWeek,
  getDayLayoutMap,
  calculatePosition,
  activeSlotMenu,
  setActiveSlotMenu,
  activeClassMenu,
  setActiveClassMenu,
  openNewClassFromSlot,
  openTemplatePickerFromSlot,
  getIsoDateForDay,
  handleEditClass,
  handleAskDeleteClass,
  onGoToDailyView
}) => {
  return (
    <div className="mt-2 calendar-container" onClick={() => { setActiveSlotMenu(null); setActiveClassMenu(null); }}>
      <div className="calendar-header">
        <div className="time-column-header">HORA</div>
        {daysToRender.map(day => (
          <div key={day} className="day-column-header">{day}</div>
        ))}
      </div>

      <div className="calendar-body">
        <div className="time-column">
          {hours.map(hour => (
            <div key={hour} className="time-slot">{hour}</div>
          ))}
        </div>

        <div className="days-grid">
          <div className="grid-lines">
            {hours.map(hour => <div key={`line-${hour}`} className="grid-line"></div>)}
          </div>

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

                    const isMenuOpen = activeSlotMenu?.day === day && activeSlotMenu?.hour === hour;
                    const slotInfo = { day, hour, classDate: getIsoDateForDay(day) };

                    return (
                      <div key={`${day}-${hour}`} className="calendar-slot-row">
                        {role === 'admin' || role === 'teacher' && !hasClassInSlot && (
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

                        {role === 'admin' || role === 'teacher' && isMenuOpen && !hasClassInSlot && (
                          <div className="slot-menu-schedule" onClick={(e) => e.stopPropagation()}>
                            <button type="button" onClick={() => openNewClassFromSlot(slotInfo)}>+ Nova Aula</button>
{/*                             <button type="button" onClick={() => openTemplatePickerFromSlot(slotInfo)}>▶ Usar Template</button>
 */}                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {(() => {
                  // O nosso algoritmo de grouping para vistas com overlap_
                  const clusters = [];
                  [...dayClasses].sort((a,b) => a.start - b.start).forEach(c => {
                    if (clusters.length === 0) {
                      clusters.push([c]);
                    } else {
                      const lastCluster = clusters[clusters.length - 1];
                      const clusterEnd = Math.max(...lastCluster.map(item => Number(item.start) + Number(item.duration)));
                      if (Number(c.start) < clusterEnd) {
                        lastCluster.push(c);
                      } else {
                        clusters.push([c]);
                      }
                    }
                  });

                  return clusters.flatMap((cluster, i) => {
                    // Se houver mais de 2 aulas sobrepostas, agregamos num "bloco caótico"
                    if (cluster.length > 2) {
                      const minStart = Math.min(...cluster.map(c => Number(c.start)));
                      const maxEnd = Math.max(...cluster.map(c => Number(c.start) + Number(c.duration)));
                      const pos = calculatePosition(minStart, maxEnd - minStart, { column: 0, columns: 1 });
                      return [
                        <div
                          key={`cluster-${day}-${i}`}
                          className="class-card_schedule multiple-classes"
                          style={{
                            ...pos, 
                            backgroundColor: '#F8FAFC', 
                            border: '1px dashed #94A3B8', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (typeof onGoToDailyView === 'function') onGoToDailyView(day);
                          }}
                        >
                          <h4 style={{ margin: 0, color: '#475569', fontSize: '13px', fontWeight: 600 }}>{cluster.length} Aulas neste momento</h4>
                          <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '12px' }}>Clica para ver o dia</p>
                        </div>
                      ];
                    }

                    // Se não (apenas 1 ou 2), desenhamos os cartões individualmente usando o Layout Calculado
                    return cluster.map((classItem) => {
                      const overlapLayout = dayLayoutMap[classItem.id] || { column: 0, columns: 1 };
                      const pos = calculatePosition(classItem.start, classItem.duration, overlapLayout);

                      return (
                    <div
                      key={classItem.id}
                      className={`class-card_schedule class-card-hover-expand ${activeClassMenu === classItem.id ? 'active' : ''}`}
                      style={pos}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Se estão sobrepostas na mesma coluna (overlapLayout.columns > 1) 
                        // e se eu estiver a clicar por fora do menu, mudo para a daily view do dia correspondente
                        if(overlapLayout.columns > 1 && !activeClassMenu && typeof onGoToDailyView === 'function') {
                          onGoToDailyView(classItem.day);
                          return;
                        }

                        if (role === 'admin') {
                          setActiveClassMenu(activeClassMenu === classItem.id ? null : classItem.id);
                        }
                        setActiveSlotMenu(null);
                      }}
                    >
                      {activeClassMenu === classItem.id && role === 'admin' && (
                        <div className="class-card_menu" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveClassMenu(null);
                              onGoToDailyView(classItem.day);
                            }}
                          >
                            👁️ Ver dia completo
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveClassMenu(null);
                              handleEditClass(classItem);
                            }}
                          >
                            ✏️ Editar aula
                          </button>
                          <button
                            type="button"
                            className="delete"
                            onClick={() => {
                              setActiveClassMenu(null);
                              handleAskDeleteClass(classItem);
                            }}
                          >
                            🗑️ Eliminar aula
                          </button>
                        </div>
                      )}
                      <h4 className="class-card_schedule__title">{classItem.categoryName || classItem.name || 'Aula'}</h4>
                      <p className="class-card_schedule__details">Professor: {classItem.instructorName || classItem.instructor || 'Sem professor'}</p>
                      <p className="class-card_schedule__details">Sala: {classItem.roomName || classItem.room || 'Sem sala'}</p>
                      <div className="class-card_schedule__footer">
                        <span className="class-occupancy">👥 {classItem.occupancy}</span>
                      </div>
                    </div>
                    );
                  });
                })})()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;