import { apiClient } from './apiClient';

export const loginRequest = async (email, password) => {
  return apiClient('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
};

export const registerRequest = async (email, password) => {
  return apiClient('/auth/setup-credentials', {
    method: 'POST',
    body: {
      email,
      password,
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