import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import GamingPage from './components/GamingPage';
import RetroPage from './components/RetroPage';
import TcgPage from './components/TcgPage';
import GoodiesPage from './components/GoodiesPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminDashboard from './components/admin/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Composant de protection pour les routes admin
const ProtectedAdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  
  if (loading) return <div>Chargement...</div>;
  
  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/gaming" element={<GamingPage />} />
            <Route path="/retro" element={<RetroPage />} />
            <Route path="/tcg" element={<TcgPage />} />
            <Route path="/goodies" element={<GoodiesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Route protégée pour l'administration */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } 
            />
            
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;