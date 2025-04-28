import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductById } from '../firebase/products';
import { addToCart } from '../firebase/cart';
import { useAuth } from '../contexts/AuthContext';
import LazyImage from './LazyImage';
import Navbar from './Navbar';
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
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isChangingImage, setIsChangingImage] = useState(false);

  // Gestion des erreurs de chargement d'image
  const handleImageError = () => {
    setImageLoadError(true);
  };

  // Récupérer les données du produit
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const result = await getProductById(productId);
        if (result.success) {
          setProduct(result.product);
          // Réinitialiser l'index de l'image
          setCurrentImageIndex(0);
          setImageLoadError(false);
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

  // Méthodes de navigation et de gestion des images
  const handlePrevImage = () => {
    if (product.imageUrls && product.imageUrls.length > 0) {
      setIsChangingImage(true);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === 0 ? product.imageUrls.length - 1 : prevIndex - 1
        );
        setIsChangingImage(false);
      }, 200);
    }
  };

  const handleNextImage = () => {
    if (product.imageUrls && product.imageUrls.length > 0) {
      setIsChangingImage(true);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === product.imageUrls.length - 1 ? 0 : prevIndex + 1
        );
        setIsChangingImage(false);
      }, 200);
    }
  };

  const handleThumbnailClick = (index) => {
    if (index !== currentImageIndex) {
      setIsChangingImage(true);
      setTimeout(() => {
        setCurrentImageIndex(index);
        setIsChangingImage(false);
      }, 200);
    }
  };

  // Gestion de l'ajout au panier
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

  // Déterminer le statut du stock
  const getStockStatus = () => {
    if (!product.stock || product.stock <= 0) return { status: 'out-of-stock', text: 'Rupture de stock' };
    if (product.stock < 5) return { status: 'low-stock', text: `${product.stock} en stock` };
    return { status: 'in-stock', text: `${product.stock} en stock` };
  };

  // Page de chargement
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

  // Page d'erreur
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
            onClick={() => navigate(-1)} 
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
          <button onClick={() => navigate(-1)} className="product-detail-back">
            <ArrowLeft size={20} />
          </button>

          <div className="product-image-gallery">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <>
                {imageLoadError ? (
                  <img 
                    src="/api/placeholder/600/600" 
                    alt="Image par défaut" 
                    className="product-main-image"
                  />
                ) : (
                  <LazyImage 
                    src={product.imageUrls[currentImageIndex]} 
                    alt={product.name}
                    className="product-main-image"
                    onError={handleImageError}
                    style={{ 
                      opacity: 1, 
                      transition: 'opacity 0.3s ease-in-out',
                      transform: isChangingImage ? 'scale(0.95)' : 'scale(1)'
                    }}
                  />
                )}
                
                {product.imageUrls.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage} 
                      className="product-image-nav prev"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={handleNextImage} 
                      className="product-image-nav next"
                    >
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
                          onError={handleImageError}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%' 
              }}>
                <img 
                  src="/api/placeholder/600/600" 
                  alt="Aucune image disponible" 
                  className="product-main-image"
                />
              </div>
            )}
          </div>

          {/* Reste du code de la page de détail */}
          <div className="product-info-panel">
            {/* Contenu existant */}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;