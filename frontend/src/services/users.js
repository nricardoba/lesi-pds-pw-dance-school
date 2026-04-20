import { apiClient } from './apiClient';

export const getUsers = async (token) => {
  return apiClient('/users', { token });
};

export const getUserById = async (id, token) => {
  return apiClient(`/users/${id}`, { token });
};

export const createUser = async (data, token) => {
  return apiClient('/users', {
    method: 'POST',
    body: data,
    token
  });
};

export const updateUser = async (id, data, token) => {
  return apiClient(`/users/${id}`, {
    method: 'PUT',
    body: data,
    token
  });
};

export const deleteUser = async (id, token) => {
  return apiClient(`/users/${id}`, {
    method: 'DELETE',
    token
  });
};
