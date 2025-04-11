import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ShoppingCart, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../firebase/auth';
import { getCartItemCount } from '../firebase/cart';
import './Navbar.css';

// Structure des sous-catégories
const SUBCATEGORIES = {
  gaming: [
    { id: 'xbox-series-x', name: 'XBOX séries X' },
    { id: 'playstation-5', name: 'Playstation 5' },
    { id: 'playstation-4', name: 'Playstation 4' },
    { id: 'switch', name: 'Switch' },
    { id: 'xbox-one', name: 'Xbox One' },
    { id: 'playstation-3', name: 'Playstation 3' },
    { id: 'xbox-360', name: 'Xbox 360' },
    { id: 'wii-u', name: 'Wii U' },
    { id: '3ds', name: '3DS' },
    { id: 'ds', name: 'DS' },
    { id: 'playstation-vita', name: 'Playstation Vita' },
    { id: 'playstation-portable', name: 'Playstation Portable' },
    { id: 'wii', name: 'Wii' },
    { id: 'other-gaming', name: 'Autres' },
  ],
  retro: [
    { id: 'super-nintendo', name: 'Super Nintendo' },
    { id: 'megadrive', name: 'Megadrive' },
    { id: 'game-boy', name: 'Game Boy' },
    { id: 'playstation-one', name: 'Playstation One' },
    { id: 'nes', name: 'NES' },
    { id: 'playstation-2', name: 'Playstation 2' },
    { id: 'dreamcast', name: 'Dreamcast' },
    { id: 'nintendo-64', name: 'Nintendo 64' },
    { id: 'master-system', name: 'Master System' },
    { id: 'game-boy-advance', name: 'Game Boy Advance' },
    { id: 'saturn', name: 'Saturn' },
    { id: 'neo-geo', name: 'Neo Geo' },
    { id: 'xbox-original', name: 'Xbox' },
    { id: 'other-retro', name: 'Autres' },
  ],
  tcg: [
    { id: 'ecarlate-violet', name: 'Série Ecarlate et Violet' },
    { id: 'epee-bouclier', name: 'Série Epée et Bouclier' },
    { id: 'soleil-lune', name: 'Série Soleil et Lune' },
    { id: 'xy', name: 'Série XY' },
    { id: 'noir-blanc', name: 'Série Noir et Blanc' },
    { id: 'appel-legendes', name: 'Série L\'appel des légendes' },
    { id: 'heartgold-soulsilver', name: 'Série HeartGold SoulSilver' },
    { id: 'platine', name: 'Série Platine' },
    { id: 'diamant-perle', name: 'Série Diamant et Perle' },
    { id: 'ex', name: 'Série EX' },
    { id: 'wizards', name: 'Wizards' },
    { id: 'other-tcg', name: 'Autres' },
  ],
  goodies: [
    { id: 'funko-pop', name: 'Funko Pop' },
    { id: 'figurines', name: 'Figurines' },
    { id: 'other-goodies', name: 'Autres' },
  ]
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const dropdownTimeoutRef = useRef(null);

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

  const handleMouseEnter = (category) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(category);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
  };

  // Vérifier si la route actuelle fait partie d'une sous-catégorie
  const isActiveCategory = (category) => {
    const path = location.pathname;
    if (path === `/${category}`) return true;
    
    // Vérifier si c'est une sous-catégorie
    const subcategoryMatch = path.match(new RegExp(`/${category}/(.*)`));
    return !!subcategoryMatch;
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
          {/* Gaming avec sous-catégories */}
          <div 
            className={`nav-item-dropdown ${isActiveCategory('gaming') ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter('gaming')}
            onMouseLeave={handleMouseLeave}
          >
            <Link to="/gaming" className="nav-item">
              Gaming <ChevronDown size={16} className="dropdown-icon" />
            </Link>
            {activeDropdown === 'gaming' && (
              <div className="dropdown-menu">
                {SUBCATEGORIES.gaming.map(sub => (
                  <Link 
                    key={sub.id} 
                    to={`/gaming/${sub.id}`}
                    className="dropdown-item"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Retro avec sous-catégories */}
          <div 
            className={`nav-item-dropdown ${isActiveCategory('retro') ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter('retro')}
            onMouseLeave={handleMouseLeave}
          >
            <Link to="/retro" className="nav-item">
              Retro <ChevronDown size={16} className="dropdown-icon" />
            </Link>
            {activeDropdown === 'retro' && (
              <div className="dropdown-menu">
                {SUBCATEGORIES.retro.map(sub => (
                  <Link 
                    key={sub.id} 
                    to={`/retro/${sub.id}`}
                    className="dropdown-item"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* TCG avec sous-catégories */}
          <div 
            className={`nav-item-dropdown ${isActiveCategory('tcg') ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter('tcg')}
            onMouseLeave={handleMouseLeave}
          >
            <Link to="/tcg" className="nav-item">
              TCG <ChevronDown size={16} className="dropdown-icon" />
            </Link>
            {activeDropdown === 'tcg' && (
              <div className="dropdown-menu">
                {SUBCATEGORIES.tcg.map(sub => (
                  <Link 
                    key={sub.id} 
                    to={`/tcg/${sub.id}`}
                    className="dropdown-item"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Goodies avec sous-catégories */}
          <div 
            className={`nav-item-dropdown ${isActiveCategory('goodies') ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter('goodies')}
            onMouseLeave={handleMouseLeave}
          >
            <Link to="/goodies" className="nav-item">
              Goodies <ChevronDown size={16} className="dropdown-icon" />
            </Link>
            {activeDropdown === 'goodies' && (
              <div className="dropdown-menu">
                {SUBCATEGORIES.goodies.map(sub => (
                  <Link 
                    key={sub.id} 
                    to={`/goodies/${sub.id}`}
                    className="dropdown-item"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
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
              <div className="user-dropdown-menu">
                <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #eee', fontSize: '0.9rem', color: '#666' }}>
                  {currentUser.displayName || currentUser.email}
                </div>
                
                <Link to="/profile" className="dropdown-item">
                  Mon profil
                </Link>
                
                <Link to="/cart" className="dropdown-item">
                  Mon panier
                </Link>
                
                {isAdmin && (
                  <Link to="/admin" className="dropdown-item admin-link">
                    <Settings size={16} style={{ marginRight: '0.5rem' }} />
                    Administration
                  </Link>
                )}
                
                <button onClick={handleLogout} className="dropdown-item logout-item">
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