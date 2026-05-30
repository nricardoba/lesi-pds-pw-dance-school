import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { listClassesRequest } from '../services/classes';
import { formatDateForInput, pad2 } from '../utils/scheduleUtils';
import '../pagesCss/HomePage.css';
import '../pagesCss/TeacherHomePage.css';

const PROFESSOR_ROLES = ['Professor', 'Professor Responsável', 'Professor Assistente'];

const getRoleDesc = (userClass) =>
  userClass.userClassRole?.userClassRoleDesc ||
  userClass.userClassRole?.userClassRoleName ||
  '';

const isProfessorRole = (userClass) => PROFESSOR_ROLES.includes(getRoleDesc(userClass));

const formatDateLabel = (date) => {
  if (!date) return '-';

  return new Intl.DateTimeFormat('pt-PT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  }).format(date);
};

const formatTimeRange = (startDate, endDate) => {
  const startLabel = `${pad2(startDate.getHours())}:${pad2(startDate.getMinutes())}`;
  const endLabel = `${pad2(endDate.getHours())}:${pad2(endDate.getMinutes())}`;
  return `${startLabel} - ${endLabel}`;
};

const normalizeStatusClass = (status) =>
  String(status || 'sem-estado')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');

const isFutureOrToday = (sessionDate, now) => {
  const sessionDay = new Date(sessionDate);
  return sessionDay.getTime() >= new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

const mapAssignedSessions = (backendClasses, teacherId) => {
  return (backendClasses || [])
    .filter((backendClass) => {
      const professorLink = backendClass.userClass?.find(
        (userClass) =>
          isProfessorRole(userClass) && String(userClass.userId) === String(teacherId)
      );

      return Boolean(professorLink);
    })
    .map((backendClass) => {
      const startDate = new Date(backendClass.classDateStart);
      const endDate = new Date(backendClass.classDateEnd);
      const dateIso = formatDateForInput(startDate);
      const studentsCount =
        backendClass.userClass?.filter(
          (userClass) => userClass.userClassRole?.userClassRoleDesc === 'Aluno'
        ).length || 0;

      return {
        id: backendClass.classId,
        dateIso,
        day: startDate.toLocaleDateString('pt-PT', { weekday: 'long' }).toUpperCase(),
        dateLabel: formatDateLabel(startDate),
        timeRange: formatTimeRange(startDate, endDate),
        startDate,
        endDate,
        start: startDate.getHours() + startDate.getMinutes() / 60,
        duration: Math.max((endDate - startDate) / 60000 / 60, 0.5),
        isRecurring: backendClass.classRecurrence === true,
        title:
          backendClass.studioModality?.modality?.modalityName ||
          `Sessão ${backendClass.classId}`,
        room: backendClass.studioModality?.studio?.studioName || 'Estúdio',
        status: backendClass.classStatus?.classStatusDesc || 'Sem estado',
        studentsCount,
        classId: backendClass.classId
      };
    })
    .sort((left, right) => left.startDate - right.startDate);
};

const TeacherHomePage = () => {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [loadError, setLoadError] = useState('');

  const teacherId = user?.user_id || user?.userId || user?.id || '';

  useEffect(() => {
    const fetchTeacherSessions = async () => {
      if (!token || !teacherId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError('');

        const data = await listClassesRequest(token);
        const mappedSessions = mapAssignedSessions(data, teacherId);
        setSessions(mappedSessions);
      } catch (error) {
        console.error('Erro ao carregar sessões do professor', error);
        setLoadError('Não foi possível carregar as aulas e coachings atribuídos.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherSessions();
  }, [teacherId, token]);

  const sessionsInCurrentWeek = useMemo(
    () => sessions.filter((session) => formatDateForInput(session.startDate) === session.dateIso),
    [sessions]
  );
  const futureSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((session) => isFutureOrToday(session.startDate, now));
  }, [sessions]);
  const futureClasses = useMemo(
    () => futureSessions.filter((session) => session.isRecurring),
    [futureSessions]
  );
  const futureCoachings = useMemo(
    () => futureSessions.filter((session) => !session.isRecurring),
    [futureSessions]
  );
  const nextClass = futureClasses[0] || null;
  const nextCoaching = futureCoachings[0] || null;

  const upcomingGroups = useMemo(() => {
    const groups = new Map();

    futureSessions.forEach((session) => {
      if (!groups.has(session.dateIso)) {
        groups.set(session.dateIso, {
          dateIso: session.dateIso,
          date: new Date(`${session.dateIso}T12:00:00`),
          items: []
        });
      }

      groups.get(session.dateIso).items.push(session);
    });

    return [...groups.values()].sort((left, right) => left.date - right.date);
  }, [futureSessions]);

  const upcomingSessionCard = (session) => (
    <article key={session.id} className="teacher-upcoming-card">
      <div className="teacher-upcoming-card__topline">
        <span className={`teacher-session-card__badge teacher-session-card__badge--${normalizeStatusClass(session.status)}`}>
          {session.status}
        </span>
        <span className="teacher-upcoming-card__date">{formatDateLabel(session.startDate)}</span>
      </div>

      <h3 className="teacher-upcoming-card__title">{session.title}</h3>
      <p className="teacher-upcoming-card__time">{session.timeRange}</p>
      <p className="teacher-upcoming-card__meta">{session.room}</p>
    </article>
  );

  const renderUpcomingGroup = (group) => (
    <section key={group.dateIso} className="teacher-upcoming-group">
      <div className="teacher-upcoming-group__header">
        <h3>{formatDateLabel(group.date)}</h3>
        <span>{group.items.length}</span>
      </div>

      <div className="teacher-upcoming-group__list">
        {group.items.map(upcomingSessionCard)}
      </div>
    </section>
  );

  return (
    <div className="teacher-home-page">
      <header className="teacher-home-hero">
        <div className="teacher-home-hero__copy">
          <p className="teacher-home-hero__eyebrow">Dashboard do Professor</p>
          <h1>Olá, {user?.user_name || user?.userName || 'Professor'}!</h1>
          <p>Consulta todas as aulas e coachings atribuídos, ordenados por data.</p>
        </div>
      </header>

      <section className="teacher-upcoming-layout">
        <div className="teacher-upcoming-list-card">
          <div className="teacher-upcoming-list-card__header">
            <div>
              <h2>Sessões</h2>
              <p>Aulas e coachings atribuídos ao professor.</p>
            </div>
            <span className="teacher-upcoming-list-card__count">{sessions.length}</span>
          </div>

          <div className="teacher-upcoming-list-card__content">
            {upcomingGroups.length > 0 ? (
              upcomingGroups.map(renderUpcomingGroup)
            ) : (
              <div className="teacher-calendar-empty">Ainda não tens sessões atribuídas.</div>
            )}
          </div>
        </div>
      </section>

      <section className="quick-actions teacher-quick-actions">
        <h2>Ações rápidas</h2>

        <div className="quick-actions-grid">
          <a href="/horario-professor" className="quick-action-card">
            <span>📚</span>
            <div>
              <h3>O meu horário</h3>
              <p>Consulta o teu horário e disponibilidade.</p>
            </div>
          </a>

          <a href="/coachings" className="quick-action-card">
            <span>✨</span>
            <div>
              <h3>Coachings</h3>
              <p>Consulta e confirma pedidos pendentes.</p>
            </div>
          </a>

          <a href="/perfil" className="quick-action-card">
            <span>👤</span>
            <div>
              <h3>Perfil</h3>
              <p>Consulta os teus dados pessoais.</p>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
};

export default TeacherHomePage;
