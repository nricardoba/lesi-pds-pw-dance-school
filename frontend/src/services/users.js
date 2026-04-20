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

export const updateUserNif = async (id, data, token) => {
  return apiClient(`/users/${id}/nif`, {
    method: 'PUT',
    body: data,
    token
  });
};

export const updateStudentNumber = async (id, data, token) => {
  return apiClient(`/users/${id}/student-number`, {
    method: 'PUT',
    body: data,
    token
  });
};

export const addUserContact = async (id, data, token) => {
  return apiClient(`/users/${id}/contacts`, {
    method: 'POST',
    body: data,
    token
  });
};

export const addUserAddress = async (id, data, token) => {
  return apiClient(`/users/${id}/addresses`, {
    method: 'POST',
    body: data,
    token
  });
};
