
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Clients from './pages/clients/Clients';
import ClientDetail from './pages/clients/ClientDetail';
import Services from './pages/services/Services';
import ServiceDetail from './pages/services/ServiceDetail';
import Projects from './pages/projects/Projects';
import ProjectDetail from './pages/projects/ProjectDetail';
import Finances from './pages/finances/Finances';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

// Import the admin pages
import UserManagement from './pages/admin/UserManagement';
import RequestsManagement from './pages/admin/RequestsManagement';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/:id" element={<ClientDetail />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/finances" element={<Finances />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/requests" element={<RequestsManagement />} /> {/* New route */}
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          
        </AuthProvider>
      </Router>
      <Toaster />
    </div>
  );
}

export default App;
