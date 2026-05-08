import { apiClient } from './apiClient';

export const getStudios = async (token) => {
  return apiClient('/studios', { token });
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
