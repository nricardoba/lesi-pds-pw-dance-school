import { apiClient } from './apiClient';

const getScheduleVacanciesByUserId = (userId, token) => {
  return apiClient(`/schedule-vacancies/user/${userId}`, { token });
};

const getScheduleSubmissions = (userId, token) => {
  return apiClient(`/schedule/user/${userId}`, { token });
};

const getAllScheduleSubmissions = (token) => {
  return apiClient(`/schedule/all`, { token });
};

const getLatestSubmissionStatus = (userId, token) => {
  return apiClient(`/schedule/user/${userId}/latest`, { token });
};

const submitSchedule = (submissionData, token) => {
  return apiClient('/schedule/submit', { 
    method: 'POST', 
    body: submissionData,
    token
  });
};

const reviewScheduleSubmission = (submissionId, reviewData, token) => {
  return apiClient(`/schedule/${submissionId}/review`, { 
    method: 'PUT', 
    body: reviewData,
    token
  });
};

export const scheduleService = {
  getScheduleVacanciesByUserId,
  getScheduleSubmissions,
  getAllScheduleSubmissions,
  getLatestSubmissionStatus,
  submitSchedule,
  reviewScheduleSubmission,
};