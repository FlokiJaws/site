import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Settings, ShoppingBag, Users, PlusCircle, LogOut, BarChart } from 'lucide-react';
import { logoutUser } from '../../firebase/auth';
import AdminProductList from './AdminProductList';
import AdminProductForm from './AdminProductForm';
import AdminOrderList from './AdminOrderList';
import AdminStats from './AdminStats';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('products');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>GameCash</h2>
          <p>Administration</p>
        </div>
        <div className="admin-menu">
          <Link 
            to="/admin"
            className={`admin-menu-item ${activePage === 'stats' ? 'active' : ''}`}
            onClick={() => setActivePage('stats')}
          >
            <BarChart size={20} />
            <span>Statistiques</span>
          </Link>
          <Link 
            to="/admin/products"
            className={`admin-menu-item ${activePage === 'products' ? 'active' : ''}`}
            onClick={() => setActivePage('products')}
          >
            <ShoppingBag size={20} />
            <span>Produits</span>
          </Link>
          <Link 
            to="/admin/add-product"
            className={`admin-menu-item ${activePage === 'add-product' ? 'active' : ''}`}
            onClick={() => setActivePage('add-product')}
          >
            <PlusCircle size={20} />
            <span>Ajouter un produit</span>
          </Link>
          <Link 
            to="/admin/orders"
            className={`admin-menu-item ${activePage === 'orders' ? 'active' : ''}`}
            onClick={() => setActivePage('orders')}
          >
            <Users size={20} />
            <span>Commandes</span>
          </Link>
          <Link 
            to="/admin/settings"
            className={`admin-menu-item ${activePage === 'settings' ? 'active' : ''}`}
            onClick={() => setActivePage('settings')}
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
        <Routes>
          <Route path="/" element={<AdminStats />} />
          <Route path="/products" element={<AdminProductList />} />
          <Route path="/add-product" element={<AdminProductForm />} />
          <Route path="/edit-product/:id" element={<AdminProductForm />} />
          <Route path="/orders" element={<AdminOrderList />} />
          <Route path="/settings" element={<div>Paramètres</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;