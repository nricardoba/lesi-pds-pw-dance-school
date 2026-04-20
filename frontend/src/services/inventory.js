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
    token
  });
};

export const returnRental = async (rentalId, token) => {
  return apiClient(`/rentals/${rentalId}/return`, {
    method: 'PUT',
    token
  });
};
