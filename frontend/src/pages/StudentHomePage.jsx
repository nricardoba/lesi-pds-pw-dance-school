import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { listClassesRequest } from '../services/classes';
import { formatDateForInput, getMondayOfWeek, pad2 } from '../utils/scheduleUtils';
import '../pagesCss/StudentDashboard.css';

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

const mapStudentSessions = (backendClasses, studentId) => {
  return (backendClasses || [])
    .filter((backendClass) => {
      const studentLink = backendClass.userClass?.find(
        (userClass) =>
          String(userClass.userId) === String(studentId) &&
          String(userClass.userClassRole?.userClassRoleDesc || '').toLowerCase() === 'aluno'
      );

      return Boolean(studentLink);
    })
    .map((backendClass) => {
      const startDate = new Date(backendClass.classDateStart);
      const endDate = new Date(backendClass.classDateEnd);
      const dateIso = formatDateForInput(startDate);
      const teacher = backendClass.userClass?.find((userClass) =>
        String(userClass.userClassRole?.userClassRoleDesc || '').toLowerCase().includes('professor')
      );
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
        title:
          backendClass.studioModality?.modality?.modalityName || `Sessão ${backendClass.classId}`,
        room: backendClass.studioModality?.studio?.studioName || 'Estúdio',
        teacher: teacher?.user?.userName || 'Professor',
        status: backendClass.classStatus?.classStatusDesc || 'Sem estado',
        studentsCount,
        classType: backendClass.classRecurrence === true ? 'Aula' : 'Coaching'
      };
    })
    .sort((left, right) => left.startDate - right.startDate);
};

const StudentHomePage = () => {
  const { user, token, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [loadError, setLoadError] = useState('');

  const studentId = user?.user_id || user?.userId || user?.id || '';
  const displayName = user?.user_name || user?.userName || 'Aluno';

  useEffect(() => {
    const fetchStudentSessions = async () => {
      if (!token || !studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError('');

        const data = await listClassesRequest(token);
        const mappedSessions = mapStudentSessions(data, studentId);
        setSessions(mappedSessions);
      } catch (error) {
        console.error('Erro ao carregar sessões do aluno', error);
        setLoadError('Não foi possível carregar as tuas aulas e coachings.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentSessions();
  }, [studentId, token]);

  const weekStart = useMemo(() => getMondayOfWeek(new Date()), []);
  const weekEnd = useMemo(() => {
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    return nextWeekStart;
  }, [weekStart]);

  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((session) => isFutureOrToday(session.startDate, now));
  }, [sessions]);

  const weekSessions = useMemo(
    () =>
      sessions.filter(
        (session) => session.startDate >= weekStart && session.startDate < weekEnd
      ),
    [sessions, weekStart, weekEnd]
  );

  const nextSession = upcomingSessions[0] || null;

  const upcomingGroups = useMemo(() => {
    const groups = new Map();

    upcomingSessions.forEach((session) => {
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
  }, [upcomingSessions]);

  const upcomingSessionCard = (session) => (
    <article key={session.id} className="student-upcoming-card">
      <div className="student-upcoming-card__topline">
        <span
          className={`student-session-card__badge student-session-card__badge--${normalizeStatusClass(session.status)}`}
        >
          {session.status}
        </span>
        <span className="student-upcoming-card__date">{session.dateLabel}</span>
      </div>

      <h3 className="student-upcoming-card__title">{session.title}</h3>
      <p className="student-upcoming-card__time">{session.timeRange}</p>
      <p className="student-upcoming-card__meta">{session.room}</p>
      <p className="student-upcoming-card__meta">Professor: {session.teacher}</p>
    </article>
  );

  const renderUpcomingGroup = (group) => (
    <section key={group.dateIso} className="student-upcoming-group">
      <div className="student-upcoming-group__header">
        <h3>{formatDateLabel(group.date)}</h3>
        <span>{group.items.length}</span>
      </div>

      <div className="student-upcoming-group__list">{group.items.map(upcomingSessionCard)}</div>
    </section>
  );

  return (
    <div className="student-home-page">
      <header className="student-home-hero">
        <div className="student-home-hero__copy">
          <p className="student-home-hero__eyebrow">Dashboard do Aluno</p>
          <h1>Olá, {displayName}!</h1>
          <p>
            Consulta as tuas próximas aulas, coachings e acessos rápidos no mesmo painel.
          </p>
        </div>

        <div className="student-home-hero__highlights">
          <article className="student-highlight-card">
            <span>Próxima sessão</span>
            <strong>{nextSession ? nextSession.timeRange : 'Sem sessões'}</strong>
            <p>
              {nextSession
                ? `${nextSession.title} · ${nextSession.room}`
                : 'Ainda não tens sessões atribuídas.'}
            </p>
          </article>

          <article className="student-highlight-card">
            <span>Esta semana</span>
            <strong>{weekSessions.length}</strong>
            <p>Sessões visíveis entre {formatDateLabel(weekStart)} e {formatDateLabel(weekEnd)}.</p>
          </article>

          <article className="student-highlight-card">
            <span>Total</span>
            <strong>{sessions.length}</strong>
            <p>Aulas e coachings ligados ao teu perfil.</p>
          </article>
        </div>
      </header>

      {loadError ? <section className="student-error-state">{loadError}</section> : null}

      <section className="student-upcoming-layout">
        <div className="student-upcoming-list-card">
          <div className="student-upcoming-list-card__header">
            <div>
              <h2>Sessões</h2>
              <p>Aulas e coachings atribuídos ao teu perfil.</p>
            </div>
            <span className="student-upcoming-list-card__count">{sessions.length}</span>
          </div>

          <div className="student-upcoming-list-card__content">
            {loading ? (
              <div className="student-loading-state">A carregar sessões...</div>
            ) : upcomingGroups.length > 0 ? (
              upcomingGroups.map(renderUpcomingGroup)
            ) : (
              <div className="student-empty-state">
                {role === 'parent'
                  ? 'Ainda não existem sessões associadas ao teu perfil.'
                  : 'Ainda não tens sessões atribuídas.'}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="quick-actions student-quick-actions">
        <h2>Acesso rápido</h2>

        <div className="quick-actions-grid student-quick-actions-grid">
          <Link to="/horario" className="quick-action-card">
            <span>📅</span>
            <div>
              <h3>Horário</h3>
              <p>Consulta o teu horário de aulas.</p>
            </div>
          </Link>

          <Link to="/perfil" className="quick-action-card">
            <span>👤</span>
            <div>
              <h3>Perfil</h3>
              <p>Consulta e atualiza os teus dados pessoais.</p>
            </div>
          </Link>

          <Link to="/coachings" className="quick-action-card">
            <span>✨</span>
            <div>
              <h3>Coachings</h3>
              <p>Consulta e pede coachings associados às tuas aulas.</p>
            </div>
          </Link>

          <Link to="/figurinos-catalogo" className="quick-action-card">
            <span>🏫</span>
            <div>
              <h3>Catálogo da Escola</h3>
              <p>Consulta o catálogo e os registos ligados ao teu perfil.</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default StudentHomePage;