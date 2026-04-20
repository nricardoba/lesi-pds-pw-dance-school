import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useAuth();

  // Verifica se o utilizador está logado, se não estiver, reencaminha para o login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Verifica se a rota precisa de permissões especiais e se o utilizador as tem
  // No back-end, o tipo de utilizador é guardado em user.user_type_desc (ex: "Admin", "Teacher", "Student")
  if (allowedRoles && user && !allowedRoles.includes(user.user_type_desc)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;