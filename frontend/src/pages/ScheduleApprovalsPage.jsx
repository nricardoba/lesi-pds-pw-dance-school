import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { scheduleService } from '../services/scheduleService';
import { useAuth } from '../context/useAuth';
import '../pagesCss/ScheduleApprovalsPage.css';
import ScheduleApprovalsStats from '../components/scheduleApprovals/ScheduleApprovalsStats';
import ScheduleApprovalsControls from '../components/scheduleApprovals/ScheduleApprovalsControls';
import ScheduleApprovalsTable from '../components/scheduleApprovals/ScheduleApprovalsTable';
import ScheduleApprovalModal from '../components/scheduleApprovals/ScheduleApprovalModal';

const ScheduleApprovalsPage = () => {
  const { token, role } = useAuth();
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const canReview = role === 'admin';

  const loadRequests = useCallback(() => {
    if (!token) return Promise.resolve();

    const requestLoader = role === 'teacher'
      ? scheduleService.getMyScheduleSubmissions(token)
      : scheduleService.getAllScheduleSubmissions(token);

    return requestLoader
      .then(res => {
        const allSubmissions = res;
        const formattedRequests = allSubmissions.map(req => ({
          id: req.scheduleSubmissionId,
          reviewTargetUserId: req.user?.userId ?? null,
          teacherName: req.user.userName,
          submittedAt: new Date(req.submissionDate).toLocaleDateString(),
          status: req.status.scheduleSubmissionStatusDesc,
          note: req.rejectionReason || '',
          vacancyIds: req.scheduleVacancies.map(v => v.scheduleVacancyId),
          vacancies: req.scheduleVacancies.map(v => ({
            id: v.scheduleVacancyId,
            day: v.day_of_week,
            time: `${v.start_time} - ${v.end_time}`,
            status: v.scheduleVacancyApproved
          })),
          slots: req.scheduleVacancies.map(v => ({
            day: v.day_of_week,
            time: `${v.start_time} - ${v.end_time}`
          })),
          decisionDate: req.reviewDate ? new Date(req.reviewDate).toLocaleDateString() : null
        }));
        setRequests(formattedRequests);
      })
      .catch(error => console.error('Error fetching schedule requests:', error));
  }, [token, role]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const selectedRequest = requests.find((request) => request.id === selectedRequestId) || null;

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const bySearch = request.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
      const byStatus = selectedStatus === 'Todos' || request.status === selectedStatus;
      return bySearch && byStatus;
    });
  }, [requests, searchTerm, selectedStatus]);

  const vacancyCounts = useMemo(() => {
    const counts = {
      Pendente: 0,
      Aprovado: 0,
      Rejeitado: 0,
    };

    const seenIdsByStatus = {
      Pendente: new Set(),
      Aprovado: new Set(),
      Rejeitado: new Set(),
    };

    requests.forEach((request) => {
      const statusKey = request.status;
      if (!(statusKey in seenIdsByStatus)) {
        return;
      }

      request.vacancyIds.forEach((vacancyId) => {
        const normalizedId = String(vacancyId);
        if (seenIdsByStatus[statusKey].has(normalizedId)) {
          return;
        }

        seenIdsByStatus[statusKey].add(normalizedId);
        counts[statusKey] += 1;
      });
    });

    return counts;
  }, [requests]);

  const pendingCount = vacancyCounts.Pendente;
  const approvedCount = vacancyCounts.Aprovado;
  const rejectedCount = vacancyCounts.Rejeitado;

  const reviewVacancies = (vacancyIds, nextStatus, rejectionReason = '') => {
    if (!canReview) return;

    scheduleService.reviewScheduleVacancies(vacancyIds, { status: nextStatus, rejectionReason }, token)
      .then(() => {
        return loadRequests();
      })
      .then(() => {
        setSelectedRequestId(null);
      })
      .catch(error => console.error(`Error ${nextStatus === 'Aprovado' ? 'approving' : 'rejecting'} schedule:`, error));
  };

  return (
    <div className="schedule-approvals-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Pedidos de Horário</h1>
          <p className="page-subtitle">
            {canReview
              ? 'Aprovação de disponibilidades enviadas pelos professores'
              : 'Consulta das disponibilidades que enviaste'}
          </p>
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
        reviewVacancies={reviewVacancies}
        canReview={canReview}
      />

      <ScheduleApprovalModal 
        selectedRequest={selectedRequest}
        onClose={() => setSelectedRequestId(null)}
        reviewVacancies={reviewVacancies}
        canReview={canReview}
      />
    </div>
  );
};

export default ScheduleApprovalsPage;
