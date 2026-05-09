const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

const handleResponse = async (res) => {
  if (res.status === 204) {
    return null;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (res.status === 401) {
    window.dispatchEvent(new Event("auth:unauthorized"));
  }

  // Se a resposta não for ok, lança um erro
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