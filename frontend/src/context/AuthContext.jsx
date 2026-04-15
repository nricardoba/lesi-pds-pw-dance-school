import { useState } from 'react';
import { AuthContext } from './AuthContextCreate';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = (novoToken) => {
    localStorage.setItem('token', novoToken);
    setToken(novoToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};