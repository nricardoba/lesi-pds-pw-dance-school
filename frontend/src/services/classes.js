import { apiClient } from './apiClient';

// Obtém as aulas
export const listClassesRequest = async (token) => {
  return apiClient('/classes', {
    method: 'GET',
    token
  });
};

// Cria uma aula
export const createClassRequest = async (classData, token) => {
  return apiClient('/classes', {
    method: 'POST',
    body: classData,
    token
  });
};

// Atualiza uma aula
export const updateClassRequest = async (classId, classData, token) => {
  return apiClient(`/classes/${classId}`, {
    method: 'PATCH',
    body: classData,
    token
  });
};

// Elimina uma aula
export const deleteClassRequest = async (classId, token) => {
  return apiClient(`/classes/${classId}`, {
    method: 'DELETE',
    token
  });
};

// Pedido de coaching
export const requestCoachingRequest = async (coachingData, token) => {
  return apiClient('/coachings/request', {
    method: 'POST',
    body: coachingData,
    token
  });
};

// Confirmar coaching
export const confirmCoachingRequest = async (classId, studioId, token) => {
  return apiClient(`/coachings/${classId}/confirm`, {
    method: 'PATCH',
    body: { studio_id: studioId },
    token
  });
};