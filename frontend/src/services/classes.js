import { apiClient } from './apiClient';

// Obtém as aulas e templates criados
export const listClassesRequest = async (token) => {
  return apiClient('/classes', {
    method: 'GET',
    token
  });
};

// Cria uma aula (apenas Admin e Teachers)
export const createClassRequest = async (classData, token) => {
  return apiClient('/classes', {
    method: 'POST',
    body: classData,
    token
  });
};

export const requestCoachingRequest = async (coachingData, token) => {
  return apiClient('/coachings/request', {
    method: 'POST',
    body: coachingData,
    token
  });
};

export const confirmCoachingRequest = async (classId, studioId, token) => {
  return apiClient(`/coachings/${classId}/confirm`, {
    method: 'PATCH',
    body: { studio_id: studioId },
    token
  });
};