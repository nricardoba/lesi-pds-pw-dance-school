import { useMemo, useState } from 'react';
import { AuthContext } from './AuthContextCreate';

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

  return (
    <AuthContext.Provider value={{ token, user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};