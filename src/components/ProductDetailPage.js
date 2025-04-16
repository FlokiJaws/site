import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductById } from '../firebase/products';
import { addToCart } from '../firebase/cart';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import ProductReviewsSection from './ProductReviewsSection';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isChangeingImage, setIsChangingImage] = useState(false);

  // Récupérer les données du produit
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const result = await getProductById(productId);
        if (result.success) {
          setProduct(result.product);
        } else {
          setError("Produit non trouvé");
        }
        setLoading(false);
      } catch (error) {
        setError("Une erreur s'est produite lors du chargement du produit");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Gérer la navigation des images avec transition
  const handlePrevImage = () => {
    if (product.imageUrls && product.imageUrls.length > 0) {
      setIsChangingImage(true);
      setIsImageLoaded(false);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === 0 ? product.imageUrls.length - 1 : prevIndex - 1
        );
      }, 200);
    }
  };

  const handleNextImage = () => {
    if (product.imageUrls && product.imageUrls.length > 0) {
      setIsChangingImage(true);
      setIsImageLoaded(false);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === product.imageUrls.length - 1 ? 0 : prevIndex + 1
        );
      }, 200);
    }
  };

  const handleThumbnailClick = (index) => {
    if (index !== currentImageIndex) {
      setIsChangingImage(true);
      setIsImageLoaded(false);
      setTimeout(() => {
        setCurrentImageIndex(index);
      }, 200);
    }
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setTimeout(() => {
      setIsChangingImage(false);
    }, 300);
  };

  // Gérer l'ajout au panier
  const handleAddToCart = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (product.stock <= 0) {
      setCartError("Produit en rupture de stock");
      setTimeout(() => setCartError(null), 2000);
      return;
    }

    setAddingToCart(true);
    setCartError(null);

    try {
      const result = await addToCart(currentUser.uid, product, quantity);
      if (result.success) {
        setCartSuccess(true);
        setTimeout(() => setCartSuccess(false), 2000);
      } else {
        setCartError(result.error || "Erreur lors de l'ajout au panier");
      }
    } catch (error) {
      setCartError("Une erreur s'est produite");
    }

    setAddingToCart(false);
  };

  // Gérer le retour à la page précédente
  const handleBack = () => {
    // Utiliser l'historique de navigation pour revenir à la page précédente
    if (location.state && location.state.from) {
      navigate(location.state.from);
    } else {
      navigate(-1); // Retour à la page précédente dans l'historique
    }
  };

  // Déterminer le statut du stock
  const getStockStatus = () => {
    if (!product.stock || product.stock <= 0) return { status: 'out-of-stock', text: 'Rupture de stock' };
    if (product.stock < 5) return { status: 'low-stock', text: `${product.stock} en stock` };
    return { status: 'in-stock', text: `${product.stock} en stock` };
  };

  // Page de chargement avec Navbar
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="product-detail-container" style={{ 
          height: 'calc(100vh - 70px)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <div>Chargement du produit...</div>
        </div>
      </>
    );
  }

  // Page d'erreur avec Navbar
  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="product-detail-container" style={{ 
          height: 'calc(100vh - 70px)', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <div>{error || "Produit non trouvé"}</div>
          <button 
            onClick={handleBack} 
            style={{ 
              marginTop: '20px',
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <>
      <Navbar />
      <div className="product-detail-container">
        <div className="product-detail-page">
          <button onClick={handleBack} className="product-detail-back">
            <ArrowLeft size={20} />
          </button>

          <div className="product-image-gallery">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <>
                <img 
                  src={product.imageUrls[currentImageIndex]} 
                  alt={product.name} 
                  className="product-main-image"
                  style={{ 
                    opacity: isImageLoaded ? 1 : 0, 
                    transition: 'opacity 0.3s ease-in-out',
                    transform: isChangeingImage ? 'scale(0.95)' : 'scale(1)'
                  }}
                  onLoad={handleImageLoad}
                />
                
                {product.imageUrls.length > 1 && (
                  <>
                    <button onClick={handlePrevImage} className="product-image-nav prev">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleNextImage} className="product-image-nav next">
                      <ChevronRight size={20} />
                    </button>
                    
                    <div className="product-thumbnails">
                      {product.imageUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Miniature ${index + 1}`}
                          className={`product-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => handleThumbnailClick(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p>Aucune image disponible</p>
              </div>
            )}
          </div>

          <div className="product-info-panel">
            <h1 className="product-title">{product.name}</h1>
            
            {product.badge && (
              <div className="product-detail-badge">{product.badge}</div>
            )}
            
            <div className="product-detail-price">{product.price.toFixed(2)} €</div>
            
            <div className="product-stock">
              <div className={`stock-indicator ${stockStatus.status}`}></div>
              <span>{stockStatus.text}</span>
            </div>
            
            <div className="product-description">
              {product.description || "Aucune description disponible pour ce produit."}
            </div>
            
            <div className="product-actions">
              <div className="quantity-selector">
                <button 
                  className="quantity-btn" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={stockStatus.status === 'out-of-stock'}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={product.stock || 1}
                  disabled={stockStatus.status === 'out-of-stock'}
                />
                <button 
                  className="quantity-btn" 
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  disabled={stockStatus.status === 'out-of-stock' || quantity >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <button 
                className="add-to-cart-btn" 
                onClick={handleAddToCart}
                disabled={addingToCart || stockStatus.status === 'out-of-stock' || cartSuccess}
                style={{
                  backgroundColor: cartSuccess ? '#4CAF50' : cartError ? '#f44336' : '',
                  background: cartSuccess ? 'none' : cartError ? 'none' : ''
                }}
              >
                {addingToCart ? (
                  'Ajout en cours...'
                ) : cartSuccess ? (
                  'Ajouté au panier ✓'
                ) : stockStatus.status === 'out-of-stock' ? (
                  'Indisponible'
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Ajouter au panier
                  </>
                )}
              </button>
            </div>
            
            {cartError && (
              <div style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>
                {cartError}
              </div>
            )}
          </div>
        </div>
        
        {/* Section des avis */}
        <ProductReviewsSection product={product} />
      </div>
    </>
  );
};

export default ProductDetailPage;