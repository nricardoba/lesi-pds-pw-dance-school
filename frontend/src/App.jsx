import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
/* descomentar para amostrar login e testar autenticação e no main.jsx tambem */

import { AuthProvider } from './context/AuthContext';  //conection to back end  
import ProtectedRoute from './components/ProtectedRoute'; //conection to back end

//import { useAuth, AuthProvider } from "./contexts/AuthContext"; // Simulação de autenticação com base em papéis (roles)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import MainLayout from './layout/MainLayout';
import HomePage from "./pages/HomePage";
import TeachersPage from "./pages/TeachersPage";
import StudentsPage from "./pages/StudentsPage";
import CostumesPage from "./pages/CostumesPage";
import StudiosPage from "./pages/StudiosPage";
import SchedulePage from "./pages/SchedulePage";
import CoachingsPage from "./pages/CoachingsPage";
import ClassTemplatesPage from "./pages/ClassTemplatesPage";
import TeacherSchedulePage from "./pages/TeacherSchedulePage";
import ScheduleApprovalsPage from "./pages/ScheduleApprovalsPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/teacher-dashboard" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student-dashboard" element={
            <ProtectedRoute allowedRoles={['student', 'parent']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route
            element={
                <MainLayout />
            }
          >
            <Route path="/dashboard" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/professores" element={<ProtectedRoute><TeachersPage /></ProtectedRoute>} />
            <Route path="/alunos" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
            <Route path="/figurinos" element={<ProtectedRoute><CostumesPage /></ProtectedRoute>} />
            <Route path="/estudios" element={<ProtectedRoute><StudiosPage /></ProtectedRoute>} />
            <Route path="/coachings" element={<ProtectedRoute><CoachingsPage /></ProtectedRoute>} />
            <Route path="/horario" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
             <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/horario-professor" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSchedulePage /></ProtectedRoute>} />
            <Route path="/aprovacao-horarios" element={<ProtectedRoute allowedRoles={['admin']}><ScheduleApprovalsPage /></ProtectedRoute>} />
            <Route path="templates-aulas" element={<ProtectedRoute><ClassTemplatesPage /></ProtectedRoute>} />
          </Route>
          
          
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;