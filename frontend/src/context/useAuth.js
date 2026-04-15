import { useContext } from 'react';
import { AuthContext } from './AuthContextCreate';

export const useAuth = () => useContext(AuthContext);