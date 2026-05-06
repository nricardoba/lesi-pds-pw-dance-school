import { apiClient } from './apiClient';

export const getScheduleVacancies = async (token) => {
  return apiClient('/schedule-vacancies', { token });
};

export const getScheduleVacancyById = async (id, token) => {
  return apiClient(`/schedule-vacancies/${id}`, { token });
};

export const getScheduleVacanciesByUserId = async (userId, token) => {
  return apiClient(`/schedule-vacancies/user/${userId}`, { token });
};

export const createScheduleVacancy = async (data, token) => {
  return apiClient('/schedule-vacancies', {
    method: 'POST',
    body: data,
    token
  });
};

export const updateScheduleVacancy = async (id, data, token) => {
  return apiClient(`/schedule-vacancies/${id}`, {
    method: 'PUT',
    body: data,
    token
  });
};

export const deleteScheduleVacancy = async (id, token) => {
  return apiClient(`/schedule-vacancies/${id}`, {
    method: 'DELETE',
    token
  });
};
