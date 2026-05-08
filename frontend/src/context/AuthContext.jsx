import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContextCreate';
import { apiClient } from '../services/apiClient';

const getStoredJson = (key) => {

  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const normalizeRole = (user) => {
  const typeDesc = user?.user_type_desc?.toLowerCase() || '';

  if (typeDesc.includes('aluno') || typeDesc.includes('student')) {
    return 'student';
  }

  if (typeDesc.includes('professor') || typeDesc.includes('teacher')) {
    return 'teacher';
  }

  if (typeDesc.includes('encarregado') || typeDesc.includes('parent')) {
    return 'parent';
  }

  if (typeDesc.includes('admin') || typeDesc.includes('dire') || typeDesc.includes('coord')) {
    return 'admin';
  }

  return null;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => getStoredJson('user'));

  const role = useMemo(() => normalizeRole(user), [user]);

  const login = ({ accessToken, user: loggedUser }) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(loggedUser));

    setToken(accessToken);
    setUser(loggedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);
  };

  const updateStoredUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };
useEffect(() => {
  const handleUnauthorized = () => {
    logout();
  };

  window.addEventListener("auth:unauthorized", handleUnauthorized);

  return () => {
    window.removeEventListener("auth:unauthorized", handleUnauthorized);
  };
}, []);

useEffect(() => {
  if (token) {
    apiClient('/auth/verify', { token }).catch(() => {
    });
  }
}, [token]);

useEffect(() => {
  if (!token) return;

  const interval = setInterval(() => {
    apiClient('/auth/verify', { token }).catch(() => {
    });
  }, 10000);

  return () => clearInterval(interval);
}, [token]);
  return (
    <AuthContext.Provider value={{ token, user, role, login, logout, updateStoredUser }}>
      {children}
    </AuthContext.Provider>
  );
};