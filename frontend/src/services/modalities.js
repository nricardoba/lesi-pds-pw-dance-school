import { apiClient } from './apiClient';

export const getModalities = async (token) => {
  return apiClient('/modalities', { token });
};

export const getModalityById = async (id, token) => {
  return apiClient(`/modalities/${id}`, { token });
};

export const createModality = async (data, token) => {
  return apiClient('/modalities', {
    method: 'POST',
    body: data,
    token
  });
};

export const updateModality = async (id, data, token) => {
  return apiClient(`/modalities/${id}`, {
    method: 'PUT',
    body: data,
    token
  });
};

export const deleteModality = async (id, token) => {
  return apiClient(`/modalities/${id}`, {
    method: 'DELETE',
    token
  });
};
