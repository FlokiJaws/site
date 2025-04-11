import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Settings, ShoppingBag, Users, PlusCircle, LogOut, BarChart, Home } from 'lucide-react';
import { logoutUser } from '../../firebase/auth';
import AdminProductList from './AdminProductList';
import AdminProductForm from './AdminProductForm';
import AdminOrderList from './AdminOrderList';
import AdminStats from './AdminStats';
import AdminSettings from './AdminSettings';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  
  // Déterminer le contenu à afficher en fonction de l'URL
  const renderContent = () => {
    if (path.includes('/admin/products')) return <AdminProductList />;
    if (path.includes('/admin/add-product')) return <AdminProductForm />;
    if (path.includes('/admin/edit-product/')) return <AdminProductForm />;
    if (path.includes('/admin/orders')) return <AdminOrderList />;
    if (path.includes('/admin/settings')) return <AdminSettings />;
    // Par défaut, afficher les statistiques
    return <AdminStats />;
  }
  
  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <Link to="/" className="admin-home-link">
            <h2>GameCash</h2>
            <p>Administration</p>
            <div className="back-to-site">
              <Home size={16} />
              <span>Retour au site</span>
            </div>
          </Link>
        </div>
        <div className="admin-menu">
          <Link 
            to="/admin"
            className={`admin-menu-item ${path === '/admin' ? 'active' : ''}`}
          >
            <BarChart size={20} />
            <span>Statistiques</span>
          </Link>
          <Link 
            to="/admin/products"
            className={`admin-menu-item ${path === '/admin/products' ? 'active' : ''}`}
          >
            <ShoppingBag size={20} />
            <span>Produits</span>
          </Link>
          <Link 
            to="/admin/add-product"
            className={`admin-menu-item ${path === '/admin/add-product' ? 'active' : ''}`}
          >
            <PlusCircle size={20} />
            <span>Ajouter un produit</span>
          </Link>
          <Link 
            to="/admin/orders"
            className={`admin-menu-item ${path === '/admin/orders' ? 'active' : ''}`}
          >
            <Users size={20} />
            <span>Commandes</span>
          </Link>
          <Link 
            to="/admin/settings"
            className={`admin-menu-item ${path === '/admin/settings' ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>Paramètres</span>
          </Link>
          <button 
            className="admin-menu-item logout"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;