import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingCart } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <h1>GameCash</h1>
          </Link>
        </div>
        
        <div className="navbar-links">
          <Link to="/gaming" className={`nav-item ${location.pathname === '/gaming' ? 'active' : ''}`}>
            Gaming
          </Link>
          <Link to="/retro" className={`nav-item ${location.pathname === '/retro' ? 'active' : ''}`}>
            Retro
          </Link>
          <Link to="/tcg" className={`nav-item ${location.pathname === '/tcg' ? 'active' : ''}`}>
            Tcg
          </Link>
          <Link to="/goodies" className={`nav-item ${location.pathname === '/goodies' ? 'active' : ''}`}>
            Goodies
          </Link>
        </div>
        
        <div className="navbar-account">
          <Link to="/cart" className="account-icon" style={{ marginRight: '12px' }}>
            <ShoppingCart size={22} color="#6200ea" />
          </Link>
          <Link to="/account" className="account-icon">
            <User size={22} color="#6200ea" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;