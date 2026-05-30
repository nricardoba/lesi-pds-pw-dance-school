import { apiClient } from './apiClient';

export const getSchoolYears = async (token) => {
  return apiClient('/school-years', { token });
};

export const createSchoolYear = async (token, payload) => {
  return apiClient('/school-years', {
    method: 'POST',
    token,
    body: payload,
  });
};

export const deleteSchoolYear = async (token, schoolYearId) => {
  return apiClient(`/school-years/${schoolYearId}`, {
    method: 'DELETE',
    token,
  });
};