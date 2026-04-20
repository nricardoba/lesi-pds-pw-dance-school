import React, { useMemo, useState } from 'react';
import '../pagesCss/ScheduleApprovalsPage.css';
import ScheduleApprovalsStats from '../components/ScheduleApprovals/ScheduleApprovalsStats';
import ScheduleApprovalsControls from '../components/ScheduleApprovals/ScheduleApprovalsControls';
import ScheduleApprovalsTable from '../components/ScheduleApprovals/ScheduleApprovalsTable';
import ScheduleApprovalModal from '../components/ScheduleApprovals/ScheduleApprovalModal';

const REQUESTS_SEED = [
  {
    id: 1001,
    teacherName: 'Ana Ribeiro',
    submittedAt: '18/04/2026',
    status: 'Pendente',
    note: 'Disponibilidade para o próximo mês letivo.',
    slots: [
      { day: 'Segunda-feira', time: '09:00 - 13:00' },
      { day: 'Quarta-feira', time: '14:00 - 18:00' },
      { day: 'Sexta-feira', time: '10:00 - 13:00' }
    ]
  },
  {
    id: 1002,
    teacherName: 'Ricardo Santos',
    submittedAt: '17/04/2026',
    status: 'Pendente',
    note: 'Ajuste de disponibilidade por conflito com formação externa.',
    slots: [
      { day: 'Terça-feira', time: '08:00 - 12:00' },
      { day: 'Quinta-feira', time: '15:00 - 19:00' }
    ]
  },
  {
    id: 1003,
    teacherName: 'Sofia Martins',
    submittedAt: '12/04/2026',
    status: 'Aprovado',
    decisionDate: '13/04/2026',
    note: 'Aprovado sem alterações.',
    slots: [{ day: 'Segunda-feira', time: '08:00 - 12:00' }]
  }
];

const ScheduleApprovalsPage = () => {
  const [requests, setRequests] = useState(REQUESTS_SEED);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const selectedRequest = requests.find((request) => request.id === selectedRequestId) || null;

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const bySearch = request.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
      const byStatus = selectedStatus === 'Todos' || request.status === selectedStatus;
      return bySearch && byStatus;
    });
  }, [requests, searchTerm, selectedStatus]);

  const pendingCount = requests.filter((request) => request.status === 'Pendente').length;
  const approvedCount = requests.filter((request) => request.status === 'Aprovado').length;
  const rejectedCount = requests.filter((request) => request.status === 'Rejeitado').length;

  const markRequest = (requestId, nextStatus) => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const decisionDate = `${day}/${month}/${year}`;

    setRequests((previous) =>
      previous.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: nextStatus,
              decisionDate,
              note:
                nextStatus === 'Aprovado'
                  ? 'Pedido aprovado pela direção.'
                  : 'Pedido rejeitado pela direção. Solicitar novo envio ajustado.'
            }
          : request
      )
    );

    setSelectedRequestId(null);
  };

  return (
    <div className="schedule-approvals-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Pedidos de Horário</h1>
          <p className="page-subtitle">Aprovação de disponibilidades enviadas pelos professores</p>
        </div>
      </header>

      <ScheduleApprovalsStats 
        pendingCount={pendingCount} 
        approvedCount={approvedCount} 
        rejectedCount={rejectedCount} 
      />

      <ScheduleApprovalsControls 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

      <ScheduleApprovalsTable 
        filteredRequests={filteredRequests}
        onSelectRequest={setSelectedRequestId}
        markRequest={markRequest}
      />

      <ScheduleApprovalModal 
        selectedRequest={selectedRequest}
        onClose={() => setSelectedRequestId(null)}
        markRequest={markRequest}
      />
    </div>
  );
};

export default ScheduleApprovalsPage;
