import { useState } from 'react';
import { AuthContext } from './AuthContextCreate';
import { useAuth } from "../contexts/AuthContext";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user'))
  );

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
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};