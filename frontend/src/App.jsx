import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
/* descomentar para amostrar login e testar autenticação e no main.jsx tambem */
/*
import { AuthProvider } from './context/AuthContext';  //conection to back end  
import ProtectedRoute from './components/ProtectedRoute'; //conection to back end
*/
import { useAuth, AuthProvider } from "./contexts/AuthContext"; // Simulação de autenticação com base em papéis (roles)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import MainLayout from './layout/MainLayout';
import TeachersPage from "./pages/TeachersPage";
import StudentsPage from "./pages/StudentsPage";
import CostumesPage from "./pages/CostumesPage";
import RoomsPage from "./pages/RoomsPage";
import SchedulePage from "./pages/SchedulePage";
import CoachingsPage from "./pages/CoachingsPage";
import ClassTemplatesPage from "./pages/ClassTemplatesPage";
import TeacherSchedulePage from "./pages/TeacherSchedulePage";

const ProtectedRoute = ({ children }) => {
  const { role } = useAuth();
  if (role === 'student') {
    return <Navigate to="/" replace />;
  }
  return children;
};


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route
            element={
                <MainLayout />
            }
          >
            <Route path="/professores" element={<TeachersPage />} />
            <Route path="/alunos" element={<StudentsPage />} />
            <Route path="/figurinos" element={<CostumesPage />} />
            <Route path="/salas" element={<RoomsPage />} />
            <Route path="/coachings" element={<CoachingsPage />} />
            <Route path="/horario" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
            <Route path="/horario-professor" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSchedulePage /></ProtectedRoute>} />
            <Route path="templates-aulas" element={<ProtectedRoute><ClassTemplatesPage /></ProtectedRoute>} />
          </Route>
          
          
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;