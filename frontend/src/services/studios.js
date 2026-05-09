import { apiClient } from './apiClient';

export const getStudios = async (token) => {
  return apiClient('/studios', { token });
};

export const getStudioModalities = async (token) => {
  return apiClient('/studio-modalities', { token });
};

export const createStudioModality = async (data, token) => {
  return apiClient('/studio-modalities', { method: 'POST', body: data, token });
};

export const deleteStudioModality = async (id, token) => {
  return apiClient(`/studio-modalities/${id}`, { method: 'DELETE', token });
};

export const getStudioById = async (id, token) => {
  return apiClient(`/studios/${id}`, { token });
};

export const createStudio = async (data, token) => {
  return apiClient('/studios', {
    method: 'POST',
    body: data,
    token
  });
};

export const updateStudio = async (id, data, token) => {
  return apiClient(`/studios/${id}`, {
    method: 'PUT',
    body: data,
    token
  });
};

export const deleteStudio = async (id, token) => {
  return apiClient(`/studios/${id}`, {
    method: 'DELETE',
    token
  });
};
