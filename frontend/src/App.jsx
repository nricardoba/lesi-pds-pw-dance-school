import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import MainLayout from './layout/MainLayout';
import TeachersPage from "./pages/TeachersPage";
import StudentsPage from "./pages/StudentsPage";
import CostumesPage from "./pages/CostumesPage";

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
          </Route>
          
          
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;