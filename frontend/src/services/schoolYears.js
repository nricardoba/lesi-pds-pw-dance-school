import { apiClient } from './apiClient';

export const getSchoolYears = async (token) => {
  return apiClient('/school-years', { token });
};