import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextCreate';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user'))
  );
  
  const [role, setRole] = useState('admin');

  useEffect(() => {
    if (user) {
      const typeDesc = user.user_type_desc?.toLowerCase() || '';
      if (typeDesc.includes('aluno')) {
        setRole('student');
      } else if (typeDesc.includes('professor')) {
        setRole('teacher');
      } else {
        setRole('admin');
      }
    }
  }, [user]);

  const login = ({ accessToken, user }) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));

    setToken(accessToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);
    setRole('admin');
  };

  return (
    <AuthContext.Provider value={{ token, user, role, setRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};