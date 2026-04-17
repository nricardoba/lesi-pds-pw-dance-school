const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

const handleResponse = async (res) => {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Erro na API");
  }

  return data;
};

export const loginRequest = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(res);
};

export const registerRequest = async (userName, email, password) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userName,
      email,
      password,
      userTypeId: 2, //TODO: futuramente implementar a possibilidade de escolher o tipo de utilizador
      userIsActive: true,
    }),
  });

  return handleResponse(res);
};

 export const forgotPasswordRequest = async (email) => {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}; 

/* export const resetPasswordRequest = async (token, password) => {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  return handleResponse(res);
};
 */ /* Futuramente implementar estas funcionalidades de forgot password e reset password */
