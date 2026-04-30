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