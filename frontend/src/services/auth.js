import { apiClient } from './apiClient';

export const loginRequest = async (email, password) => {
  return apiClient('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
};

export const registerRequest = async (userName, email, password) => {
  return apiClient('/auth/register', {
    method: 'POST',
    body: {
      userName,
      email,
      password,
      userTypeId: 3, //TODO: futuramente implementar a possibilidade de escolher o tipo de utilizador
      userIsActive: true,
    }
  });
};

export const forgotPasswordRequest = async (email) => {
  return apiClient('/auth/forgot-password', {
    method: 'POST',
    body: { email }
  });
};

/* export const resetPasswordRequest = async (token, password) => {
  return apiClient('/auth/reset-password', {
    method: 'POST',
    body: { token, password }
  });
};
*/ /* Futuramente implementar estas funcionalidades de forgot password e reset password */