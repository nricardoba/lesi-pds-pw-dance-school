import React, { useMemo, useState, useEffect } from 'react';
import { scheduleService } from '../services/scheduleService';
import { useAuth } from '../context/useAuth';
import '../pagesCss/ScheduleApprovalsPage.css';
import ScheduleApprovalsStats from '../components/scheduleApprovals/ScheduleApprovalsStats';
import ScheduleApprovalsControls from '../components/scheduleApprovals/ScheduleApprovalsControls';
import ScheduleApprovalsTable from '../components/scheduleApprovals/ScheduleApprovalsTable';
import ScheduleApprovalModal from '../components/scheduleApprovals/ScheduleApprovalModal';

const ScheduleApprovalsPage = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    if (!token) return;
    scheduleService.getAllScheduleSubmissions(token)
    .then(res => {
      const allSubmissions = res;
      const formattedRequests = allSubmissions.map(req => ({
        id: req.scheduleSubmissionId, // This is acting as userId underneath based on our mock logic
        teacherName: req.user.userName,
        submittedAt: new Date(req.submissionDate).toLocaleDateString(),
        status: req.status.scheduleSubmissionStatusDesc,
        note: req.rejectionReason || '',
        slots: req.scheduleVacancies.map(v => ({
          day: v.day_of_week,
          time: `${v.start_time} - ${v.end_time}`
        })),
        decisionDate: req.reviewDate ? new Date(req.reviewDate).toLocaleDateString() : null
      }));
      setRequests(formattedRequests);
    })
    .catch(error => console.error('Error fetching schedule requests:', error));
  }, []);

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

  const markRequest = (requestId, nextStatus, rejectionReason = '') => {
    scheduleService.reviewScheduleSubmission(requestId, { status: nextStatus, rejectionReason }, token)
      .then(() => {
        setRequests(prev =>
          prev.map(req =>
            req.id === requestId
              ? { ...req, status: nextStatus, decisionDate: new Date().toLocaleDateString(), note: rejectionReason }
              : req
          )
        );
        setSelectedRequestId(null);
      })
      .catch(error => console.error(`Error ${nextStatus === 'Aprovado' ? 'approving' : 'rejecting'} schedule:`, error));
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
