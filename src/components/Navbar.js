import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ShoppingCart, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../firebase/auth';
import { getCartItemCount } from '../firebase/cart';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (currentUser) {
        try {
          const result = await getCartItemCount(currentUser.uid);
          if (result.success) {
            setCartCount(result.count);
          }
        } catch (error) {
          console.error('Error fetching cart count:', error);
        }
      } else {
        setCartCount(0);
      }
    };

    fetchCartCount();

    // Rafraîchir le compteur chaque fois que l'utilisateur visite une page
    const interval = setInterval(fetchCartCount, 60000); // Rafraîchir toutes les minutes

    return () => clearInterval(interval);
  }, [currentUser, location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
            TCG
          </Link>
          <Link to="/goodies" className={`nav-item ${location.pathname === '/goodies' ? 'active' : ''}`}>
            Goodies
          </Link>
        </div>
        
        <div className="navbar-account">
          <Link to="/cart" className="account-icon" style={{ marginRight: '12px', position: 'relative' }}>
            <ShoppingCart size={22} color="#6200ea" />
            {cartCount > 0 && (
              <div className="cart-badge">
                {cartCount > 9 ? '9+' : cartCount}
              </div>
            )}
          </Link>
          
          <div className="account-dropdown" style={{ position: 'relative' }}>
            <button 
              className="account-icon"
              onClick={() => currentUser ? setShowDropdown(!showDropdown) : navigate('/login')}
              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <User size={22} color="#6200ea" />
            </button>
            
            {currentUser && showDropdown && (
              <div className="dropdown-menu" style={{
                position: 'absolute',
                top: '45px',
                right: '0',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                padding: '0.5rem',
                minWidth: '180px',
                zIndex: 1000
              }}>
                <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #eee', fontSize: '0.9rem', color: '#666' }}>
                  {currentUser.displayName || currentUser.email}
                </div>
                
                <Link to="/profile" style={{
                  display: 'block',
                  padding: '0.7rem 1rem',
                  textDecoration: 'none',
                  color: 'var(--text-color)',
                  transition: 'all 0.2s ease',
                  borderRadius: '4px'
                }}>
                  Mon profil
                </Link>
                
                <Link to="/cart" style={{
                  display: 'block',
                  padding: '0.7rem 1rem',
                  textDecoration: 'none',
                  color: 'var(--text-color)',
                  transition: 'all 0.2s ease',
                  borderRadius: '4px'
                }}>
                  Mon panier
                </Link>
                
                {isAdmin && (
                  <Link to="/admin" style={{
                    display: 'block',
                    padding: '0.7rem 1rem',
                    textDecoration: 'none',
                    color: 'var(--text-color)',
                    transition: 'all 0.2s ease',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Settings size={16} style={{ marginRight: '0.5rem' }} />
                    Administration
                  </Link>
                )}
                
                <button onClick={handleLogout} style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.7rem 1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#f44336',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <LogOut size={16} style={{ marginRight: '0.5rem' }} />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;