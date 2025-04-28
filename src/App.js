import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import GamingPage from './components/GamingPage';
import RetroPage from './components/RetroPage';
import TcgPage from './components/TcgPage';
import GoodiesPage from './components/GoodiesPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import UserSettings from './components/UserSettings';
import OrderHistory from './components/OrderHistory';
import CartPage from './components/CartPage';
import ProductDetailPage from './components/ProductDetailPage';
import SearchResultsPage from './components/SearchResultsPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUserProfile from './components/admin/AdminUserProfile';
import AdminUsersList from './components/admin/AdminUsersList';
import AllReviewsPage from './components/AllReviewsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import CategoryPage from './components/CategoryPage';
import './App.css';

// Composant de protection pour les routes qui nécessitent une authentification
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div>Chargement...</div>;
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

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
            
            {/* Catégorie Gaming */}
            <Route path="/gaming" element={<GamingPage />} />
            <Route path="/gaming/:subcategoryId" element={<CategoryPage categoryType="gaming" />} />
            
            {/* Catégorie Retro */}
            <Route path="/retro" element={<RetroPage />} />
            <Route path="/retro/:subcategoryId" element={<CategoryPage categoryType="retro" />} />
            
            {/* Catégorie TCG */}
            <Route path="/tcg" element={<TcgPage />} />
            <Route path="/tcg/:subcategoryId" element={<CategoryPage categoryType="tcg" />} />
            
            {/* Catégorie Goodies */}
            <Route path="/goodies" element={<GoodiesPage />} />
            <Route path="/goodies/:subcategoryId" element={<CategoryPage categoryType="goodies" />} />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />

            <Route path="/reviews" element={<AllReviewsPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            
            {/* Routes protégées pour l'utilisateur */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <UserSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              } 
            />
            
            {/* Routes protégées pour l'administration */}
            <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/products" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/add-product" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/edit-product/:id" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            
            {/* Nouvelles routes admin pour la gestion des utilisateurs */}
            <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsersList /></ProtectedAdminRoute>} />
            <Route path="/admin/users/:userId" element={<ProtectedAdminRoute><AdminUserProfile /></ProtectedAdminRoute>} />
            
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;