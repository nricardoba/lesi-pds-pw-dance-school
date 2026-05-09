import { apiClient } from './apiClient';

export const getItems = async (token) => {
  return apiClient('/items', { token });
};

export const getRentals = async (token) => {
  return apiClient('/rentals', { token });
};

export const createRental = async (rentalData, token) => {
  return apiClient('/rentals', {
    method: 'POST',
    body: rentalData,
    token,
  });
};

export const returnRental = async (rentalId, payload, token) => {
  return apiClient(`/rentals/${rentalId}/return`, {
    method: 'PUT',
    body: payload,
    token,
  });
};

// References endpoints
export const getCategories = async (token) => {
  return apiClient('/inventory-references/categories', { token });
};

export const createCategory = async (data, token) => {
  return apiClient('/inventory-references/categories', {
    method: 'POST',
    body: data,
    token,
  });
};

export const getColors = async (token) => {
  return apiClient('/inventory-references/colors', { token });
};

export const createColor = async (data, token) => {
  return apiClient('/inventory-references/colors', {
    method: 'POST',
    body: data,
    token,
  });
};

export const getSizes = async (token) => {
  return apiClient('/inventory-references/sizes', { token });
};

export const createSize = async (data, token) => {
  return apiClient('/inventory-references/sizes', {
    method: 'POST',
    body: data,
    token,
  });
};

export const getItemConditions = async (token) => {
  return apiClient('/inventory-references/item-conditions', { token });
};

export const createItemCondition = async (data, token) => {
  return apiClient('/inventory-references/item-conditions', {
    method: 'POST',
    body: data,
    token,
  });
};

export const getDanceTypes = async (token) => {
  return apiClient('/inventory-references/dance-types', { token });
};

// Characteristics endpoints
export const createItemCharacteristics = async (data, token) => {
  return apiClient('/characteristics', {
    method: 'POST',
    body: data,
    token,
  });
};

export const updateItemCharacteristics = async (id, data, token) => {
  return apiClient(`/characteristics/${id}`, {
    method: 'PUT',
    body: data,
    token,
  });
};

export const uploadCharacteristicImage = async (id, file, token) => {
  const formData = new FormData();
  formData.append('image', file);
  return apiClient(`/characteristics/${id}/images`, {
    method: 'POST',
    body: formData,
    isFormData: true,
    token,
  });
};

// Items endpoints
export const createItem = async (data, token) => {
  return apiClient('/items', {
    method: 'POST',
    body: data,
    token,
  });
};

export const updateItem = async (id, data, token) => {
  return apiClient(`/items/${id}`, {
    method: 'PUT',
    body: data,
    token,
  });
};

export const deleteItem = async (id, token) => {
  return apiClient(`/items/${id}`, {
    method: 'DELETE',
    token,
  });
};
