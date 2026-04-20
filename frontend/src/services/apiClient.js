const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

const handleResponse = async (res) => {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Erro na API");
  }

  return data;
};

// Cliente genérico para evitar a repetição de código em todas as páginas
export const apiClient = async (endpoint, { method = 'GET', body, token, customHeaders = {} } = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  // Se for passado um token, adiciona aos cabeçalhos automaticamente
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${endpoint}`, config);
  return handleResponse(res);
};
