import "../pagesCss/HomePage.css";
import { useEffect, useMemo, useState } from "react";
import TeacherHomePage from "./TeacherHomePage";
import StudentHomePage from "./StudentHomePage";
import { useAuth } from "../context/useAuth";
import { useScheduleData } from "../Schedule/useScheduleData";
import { getStudios } from "../services/studios";
import {
  decimalToHourString,
  formatDateForInput,
  toHourDecimal,
} from "../utils/scheduleUtils";

const HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

const HomePage = () => {
  const { role, token } = useAuth();
  const isAdminDashboard = role !== "teacher" && role !== "student";
  const { classesData } = useScheduleData(isAdminDashboard ? token : null);
  const [studios, setStudios] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() =>
    formatDateForInput(new Date()),
  );

  useEffect(() => {
    if (!token || !isAdminDashboard) return;

    let mounted = true;

    const fetchStudios = async () => {
      try {
        const studiosData = await getStudios(token);
        if (!mounted) return;
        setStudios(studiosData || []);
      } catch (error) {
        console.error("Failed to load studios", error);
      }
    };

    fetchStudios();

    return () => {
      mounted = false;
    };
  }, [token, isAdminDashboard]);

  const classesForDay = useMemo(() => {
    return (classesData || []).filter(
      (classItem) => classItem.classDate === selectedDate,
    );
  }, [classesData, selectedDate]);

  const classesByStudio = useMemo(() => {
    const map = new Map();

    classesForDay.forEach((classItem) => {
      const studioKey = classItem.room ? String(classItem.room) : "unknown";
      const list = map.get(studioKey) || [];
      list.push(classItem);
      map.set(studioKey, list);
    });

    map.forEach((list) => list.sort((a, b) => a.start - b.start));

    return map;
  }, [classesForDay]);

  const studiosToRender = useMemo(() => {
    const map = new Map();

    [...studios]
      .sort((a, b) =>
        String(a.studioName || "").localeCompare(String(b.studioName || "")),
      )
      .forEach((studio) => {
        const studioId = String(studio.studioId || studio.id || "");
        if (!studioId) return;
        map.set(studioId, {
          studioId,
          studioName: studio.studioName || studio.name || `Estúdio ${studioId}`,
        });
      });

    classesByStudio.forEach((studioClasses, studioId) => {
      if (map.has(studioId)) return;
      const fallbackName =
        studioId === "unknown"
          ? "Estúdio não definido"
          : studioClasses[0]?.roomName || `Estúdio ${studioId}`;
      map.set(studioId, {
        studioId,
        studioName: fallbackName,
      });
    });

    return Array.from(map.values());
  }, [studios, classesByStudio]);

  const getClassBounds = (classItem) => {
    const startHour = Number(
      classItem.class_time_start
        ? toHourDecimal(classItem.class_time_start)
        : classItem.start,
    );
    const duration = Number(classItem.duration || 1);
    const endHour = Number(
      classItem.class_time_end
        ? toHourDecimal(classItem.class_time_end)
        : startHour + duration,
    );

    return { startHour, endHour };
  };

  const getClassTimeRange = (classItem) => {
    const { startHour, endHour } = getClassBounds(classItem);
    return `${decimalToHourString(startHour)} - ${decimalToHourString(endHour)}`;
  };

  if (role === "teacher") {
    return <TeacherHomePage />;
  }

  if (role === "student") {
    return <StudentHomePage />;
  }

  return (
    <div className="dashboard-page">
      <h1>Dashboard, Seja bem vindo {role}</h1>
      <div className="dashboard-grid">
        <div className="primary-column">
          <div className="quick-actions">
            <h2>Ações rápidas</h2>

            <div className="quick-actions-grid">
              <a href="/horario" className="quick-action-card">
                <span>📅</span>
                <div>
                  <h3>Gerir aulas</h3>
                  <p>Criar, editar e consultar aulas.</p>
                </div>
              </a>

              <a href="/alunos" className="quick-action-card">
                <span>👥</span>
                <div>
                  <h3>Gerir utilizadores</h3>
                  <p>Consultar alunos</p>
                </div>
              </a>

              <a href="/figurinos-venda" className="quick-action-card">
                <span>💸</span>
                <div>
                  <h3>Venda de Figurinos</h3>
                  <p>Figurinos de alunos e professores.</p>
                </div>
              </a>

              <a href="/figurinos-catalogo" className="quick-action-card">
                <span>🏫</span>
                <div>
                  <h3>Catálogo da Escola</h3>
                  <p>Aluguer e histórico de figurinos alugados.</p>
                </div>
              </a>

              <a href="/estudios" className="quick-action-card">
                <span>🏫</span>
                <div>
                  <h3>Estúdios</h3>
                  <p>Gerir salas e modalidades associadas.</p>
                </div>
              </a>
            </div>
          </div>

          <section className="dashboard-schedule">
            <div className="dashboard-schedule__header">
              <div>
                <h2>Aulas por estúdio</h2>
                <p>
                  Seleciona um dia para ver as aulas marcadas em cada estúdio.
                </p>
              </div>
              <div className="dashboard-schedule__controls">
                <label>
                  Dia
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="dashboard-schedule__table">
              <table className="dashboard-schedule__matrix">
                <thead>
                  <tr>
                    <th className="dashboard-schedule__hour-header">Hora</th>
                    {studiosToRender.map((studio) => (
                      <th key={studio.studioId}>{studio.studioName}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studiosToRender.length > 0 ? (
                    HOURS.map((hour) => {
                      const slotStart = toHourDecimal(hour);

                      return (
                        <tr key={hour}>
                          <td className="dashboard-schedule__hour">{hour}</td>
                          {studiosToRender.map((studio) => {
                            const studioClasses =
                              classesByStudio.get(String(studio.studioId)) ||
                              [];
                            const slotClasses = studioClasses.filter(
                              (classItem) => {
                                const { startHour, endHour } =
                                  getClassBounds(classItem);
                                return (
                                  startHour < slotStart + 1 &&
                                  endHour > slotStart
                                );
                              },
                            );

                            return (
                              <td
                                key={`${hour}-${studio.studioId}`}
                                className={
                                  slotClasses.length
                                    ? "dashboard-schedule__cell dashboard-schedule__cell--active"
                                    : "dashboard-schedule__cell"
                                }
                              >
                                {slotClasses.length > 0 ? (
                                  <div className="dashboard-schedule__slot-classes">
                                    {slotClasses.map((classItem) => {
                                      const instructorLabel =
                                        classItem.instructorName ||
                                        classItem.instructor;

                                      return (
                                        <div
                                          key={classItem.id}
                                          className="dashboard-schedule__slot-class"
                                        >
                                          <div className="dashboard-schedule__slot-title">
                                            {classItem.categoryName ||
                                              classItem.name}
                                          </div>
                                          <div className="dashboard-schedule__slot-meta">
                                            {getClassTimeRange(classItem)}
                                            {instructorLabel
                                              ? ` • ${instructorLabel}`
                                              : ""}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="dashboard-schedule__muted">
                                    —
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={Math.max(1, studiosToRender.length + 1)}
                        className="dashboard-schedule__empty"
                      >
                        Sem estúdios registados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="secondary-column" />
      </div>
    </div>
  );
};

export default HomePage;
