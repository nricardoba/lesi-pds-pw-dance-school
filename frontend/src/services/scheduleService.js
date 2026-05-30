import { apiClient } from './apiClient';

const getScheduleVacanciesByUserId = (userId, token) => {
  return apiClient(`/schedule-vacancies/user/${userId}`, { token });
};

const getMyScheduleVacancies = (token) => {
  return apiClient('/schedule-vacancies/me', { token });
};

const getScheduleSubmissions = (userId, token) => {
  return apiClient(`/schedule-vacancies/user/${userId}/submissions`, { token });
};

const getMyScheduleSubmissions = (token) => {
  return apiClient('/schedule-vacancies/me/submissions', { token });
};

const getAllScheduleSubmissions = (token) => {
  return apiClient(`/schedule-vacancies/all`, { token });
};

const getLatestSubmissionStatus = (userId, token) => {
  return apiClient(`/schedule-vacancies/user/${userId}/latest`, { token });
};

const getMyLatestSubmissionStatus = (token) => {
  return apiClient('/schedule-vacancies/me/latest', { token });
};

const submitSchedule = (submissionData, token) => {
  return apiClient('/schedule-vacancies/submit', { 
    method: 'POST', 
    body: submissionData,
    token
  });
};

const reviewScheduleSubmission = (submissionId, reviewData, token) => {
  return apiClient(`/schedule-vacancies/${submissionId}/review`, { 
    method: 'PUT', 
    body: reviewData,
    token
  });
};

const reviewScheduleVacancies = (vacancyIds, reviewData, token) => {
  return apiClient('/schedule-vacancies/review', {
    method: 'PUT',
    body: { ...reviewData, vacancyIds },
    token
  });
};

export const scheduleService = {
  getScheduleVacanciesByUserId,
  getMyScheduleVacancies,
  getScheduleSubmissions,
  getMyScheduleSubmissions,
  getAllScheduleSubmissions,
  getLatestSubmissionStatus,
  getMyLatestSubmissionStatus,
  submitSchedule,
  reviewScheduleSubmission,
  reviewScheduleVacancies,
};