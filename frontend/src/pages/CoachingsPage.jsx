import React, { useState, useEffect } from 'react';
import '../pagesCss/CoachingsPage.css';
import CoachingCard from '../components/coachingCard/CoachingCard';
import CoachingModal from '../components/coachingModal/CoachingModal';
import { useAuth } from '../context/useAuth';
import { apiClient } from '../services/apiClient';
import { listClassesRequest, confirmCoachingRequest } from '../services/classes';

const CoachingsPage = () => {
  const { role, user, token } = useAuth();

  // Estrutura das colunas do Kanban
  const columns = [
    { id: 'agendada', title: 'Pendente', status: 'Agendada', dotColor: '#F59E0B' },
    { id: 'aceite', title: 'Aceite', status: 'A Decorrer', dotColor: '#3B82F6' },
    { id: 'confirmado', title: 'Concluída', status: 'Concluída', dotColor: '#10B981' },
    { id: 'rejeitado', title: 'Cancelada', status: 'Cancelada', dotColor: '#EF4444' }
  ];

  const [coachings, setCoachings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função reutilizável para carregar coachings (usada inicialmente e após ações)
  const fetchCoachings = async () => {
    try {
      const data = await listClassesRequest(token);
      const formatted = data.map(c => ({
        id: c.classId,
        student: c.userClass.find(uc => uc.userClassRole?.userClassRoleDesc === "Aluno")?.user.userName || "N/A",
        teacher: c.userClass.find(uc => uc.userClassRole?.userClassRoleDesc.includes("Professor"))?.user.userName || "N/A",
        status: c.classStatus.classStatusDesc,
        date: new Date(c.classDateStart).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }),
        duration: `${(new Date(c.classDateEnd) - new Date(c.classDateStart)) / 60000} min`
      }));
      setCoachings(formatted);
    } catch (err) {
      console.error("Erro ao carregar coachings:", err);
    }
  };
  useEffect(() => {
    if (token) fetchCoachings();
  }, [token]);

  const [studios, setStudios] = useState([]);

  useEffect(() => {
    if (token && role === 'admin') {
      apiClient('/studios', { token }) // Usa o listStudiosController[cite: 18].
        .then(setStudios)
        .catch(console.error);
    }
  }, [token, role]);

  // States para os modais de ação (Aprovar/Rejeitar)
  const [actionModal, setActionModal] = useState({ isOpen: false, type: null, coachingId: null });
  const [selectedRoom, setSelectedRoom] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const handleSaveCoaching = (newCoaching) => {
    const coaching = {
      id: Date.now(),
      student: newCoaching.student,
      teacher: newCoaching.teacher,
      status: 'Agendada',
      date: `${newCoaching.date} às ${newCoaching.time}`,
      rawDate: newCoaching.date,
      rawTime: newCoaching.time,
      duration: newCoaching.duration,
      note: newCoaching.note,
      schoolYear: newCoaching.schoolYear,
      coachingType: newCoaching.coachingType,
      danceType: newCoaching.danceType
    };
    setCoachings(prev => [...prev, coaching]);
  };

  const openActionModal = (type, id) => {
    setActionModal({ isOpen: true, type, coachingId: id });
    setSelectedRoom('');
    setRejectReason('');
  };

  const closeActionModal = () => {
    setActionModal({ isOpen: false, type: null, coachingId: null });
  };

  const confirmAction = async () => {
    if (actionModal.type === 'accept' && !selectedRoom) {
      alert("Por favor, selecione uma sala para confirmar.");
      return;
    }

    /**const targetCoaching = coachings.find(c => c.id === actionModal.coachingId);
    if (!targetCoaching) return;

    if (actionModal.type === 'accept') {
      /**const scheduleClasses = readScheduleClassesFromStorage();
      const rawDate = targetCoaching.rawDate;
      const rawTime = targetCoaching.rawTime;
      
      // Se for mock data antigo, tentamos adivinhar a data pelo que estÃ¡ lÃ¡
      const dateVal = rawDate || new Date().toISOString().split('T')[0];
      const timeVal = rawTime || "12:00";

      const durationStr = targetCoaching.duration || '60 min';
      const durationMin = parseInt(durationStr);
      const durationDec = durationMin / 60;
      
      const toHourDecimal = (hourString) => {
        const [h = '0', m = '0'] = String(hourString || '08:00').split(':');
        return parseInt(h, 10) + parseInt(m, 10) / 60;
      };

      const startDec = toHourDecimal(timeVal);
      const endDec = startDec + durationDec;

      const isConflict = scheduleClasses.some(c => {
         if (c.classDate !== dateVal) return false;
         
         const cStart = Number(c.start);
         const cEnd = cStart + Number(c.duration);
         
         const overlapping = (startDec < cEnd && endDec > cStart);
         
         if (overlapping) {
           return c.instructor === targetCoaching.teacher || c.room === selectedRoom;
         }
         return false
      });

      if (isConflict) {
        alert("Erro: O professor ou a sala já estão ocupados neste horário para a duração pretendida. Por favor, rejeite ou verifique o horário.");
        return;**/

    try {
      if (actionModal.type === 'accept') {
        // Chamada real ao Backend para mudar o estado para 'A Decorrer'[cite: 16]
        await confirmCoachingRequest(actionModal.coachingId, selectedRoom, token);
      } else {
        // Chamada para cancelar/rejeitar[cite: 16]
        await apiClient(`/coaching/${actionModal.coachingId}/close`, {
          method: 'POST',
          body: { finalStatus: 'Cancelada' },
          token
        });
      }

      // Recarrega os dados da API para atualizar o Kanban visualmente
      fetchCoachings();
      closeActionModal();
    } catch (err) {
      alert("Erro ao processar ação: " + err.message);
    }
  };

  return (
    <div className="coachings-page">
      <header className="coachings-page__header">
        <div>
          <h1 className="coachings-page__title">Coachings</h1>
          <p className="coachings-page__subtitle">Gestão de sessões individuais</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Novo Pedido
        </button>
      </header>

      <div className="kanban-board">
        {columns.map(col => {
          // Se for estudante só vê os seus próprios pedidos, caso contrário vê todos
          const visibleCoachings = role === 'student'
            ? coachings.filter(c => c.student === user?.user_name)
            : coachings;

          // Filtra os cartões para a coluna atual
          const colItems = visibleCoachings.filter(item => item.status === col.status);

          return (
            <div key={col.id} className="kanban-column">
              <div className="kanban-column__header">
                <span
                  className="status-dot"
                  style={{ backgroundColor: col.dotColor }}
                ></span>
                <h3 className="kanban-column__title">
                  {col.title} ({colItems.length})
                </h3>
              </div>

              <div className="kanban-column__content">
                {colItems.length > 0 ? (
                  colItems.map(item => (
                    <CoachingCard
                      key={item.id}
                      data={item}
                      onAccept={() => openActionModal('accept', item.id)}
                      onReject={() => openActionModal('reject', item.id)}
                      hideActions={role === 'student'}
                    />
                  ))
                ) : (
                  <p className="empty-state">Sem coachings {col.title.toLowerCase()}s</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <CoachingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCoaching}
      />

      {/* Action Modals */}
      {actionModal.isOpen && (
        <div className="modal-overlay" onClick={closeActionModal} style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            {actionModal.type === 'accept' ? (
              <>
                <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.25rem', color: '#111827' }}>Confirmar Sala</h3>
                <p style={{ marginBottom: '16px', color: '#4B5563', fontSize: '0.875rem' }}>Para confirmar este coaching, escolha a sala.</p>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Sala</label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
                  >
                    <option value="" disabled>Selecione uma sala</option>
                    {studios.map(s => (
                      <option key={s.studioId} value={s.studioId}>{s.studioName}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.25rem', color: '#EF4444' }}>Rejeitar Pedido</h3>
                <p style={{ marginBottom: '16px', color: '#4B5563', fontSize: '0.875rem' }}>Indique o motivo da rejeição (será enviado ao aluno).</p>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Motivo (Opcional - será enviado ao aluno)</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', marginBottom: '12px' }}
                  >
                    <option value="">Selecione um motivo rápido... (ou deixe vazio)</option>
                    <option value="Professor indisponível">Professor indisponível</option>
                    <option value="Horário sobreposto">Horário sobreposto</option>
                    <option value="Falta de vagas físicas">Falta de vagas físicas</option>
                  </select>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={closeActionModal}
                style={{ padding: '8px 16px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                style={{
                  padding: '8px 16px',
                  backgroundColor: actionModal.type === 'accept' ? '#10B981' : '#EF4444',
                  color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500
                }}
              >
                {actionModal.type === 'accept' ? 'Confirmar' : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachingsPage;