import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addToCart } from '../firebase/cart';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Check, AlertCircle } from 'lucide-react';
import LazyImage from './LazyImage';

const ProductCard = ({ id, title, price, image, badge, stock = 0 }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Déterminer le statut du stock avec affichage du nombre exact
  const getStockStatus = () => {
    if (stock <= 0) return { status: 'stock-out', text: 'Rupture de stock' };
    if (stock < 5) return { status: 'stock-low', text: `${stock} en stock` };
    return { status: 'stock-in', text: `${stock} en stock` };
  };

  const stockStatus = getStockStatus();
  
  const handleAddToCart = async (e) => {
    // Empêcher l'événement de click de se propager à la carte
    e.stopPropagation();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (stock <= 0) {
      setError("Produit en rupture de stock");
      setTimeout(() => setError(null), 2000);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const product = {
        id,
        name: title,
        price,
        imageUrls: [image],
        stock
      };
      
      const result = await addToCart(currentUser.uid, product);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error || "Erreur lors de l'ajout au panier");
      }
    } catch (error) {
      setError("Une erreur s'est produite: " + error.message);
    }
    
    setLoading(false);
  };

  const handleCardClick = () => {
    // Naviguer vers la page de détail du produit avec animation fluide
    navigate(`/product/${id}`, { state: { from: location.pathname } });
  };

  return (
    <div 
      className="product-card" 
      onClick={handleCardClick} 
      style={{ cursor: 'pointer' }}
    >
      <div className="product-image">
        <LazyImage src={image} alt={title} />
        {badge && <div className="product-badge">{badge}</div>}
      </div>
      <div className="product-info">
        <h3>{title}</h3>
        <div className="product-stock-info">
          <div className={`product-stock-indicator ${stockStatus.status}`}></div>
          <span>{stockStatus.text}</span>
        </div>
        <div className="product-footer">
          <p className="price">{price} €</p>
          <button 
            className="add-to-cart" 
            onClick={handleAddToCart}
            disabled={loading || stock <= 0}
            style={{ 
              backgroundColor: success ? '#4CAF50' : error ? '#f44336' : '',
              position: 'relative',
              opacity: stock <= 0 ? 0.6 : 1
            }}
          >
            {loading ? (
              <span className="loading-dot">•</span>
            ) : success ? (
              <Check size={18} />
            ) : error ? (
              <AlertCircle size={18} />
            ) : (
              <Plus size={18} />
            )}
            
            {error && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  backgroundColor: '#f44336',
                  color: 'white',
                  padding: '5px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  marginBottom: '5px'
                }}
              >
                {error}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;