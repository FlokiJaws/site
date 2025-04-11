import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { getUserCart, updateCartItemQuantity, removeFromCart, clearCart } from '../firebase/cart';
import { createOrder } from '../firebase/checkout';
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, CreditCard, Check } from 'lucide-react';
import './CartPage.css';

const CartPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const result = await getUserCart(currentUser.uid);
        if (result.success) {
          setCart(result.cart);
        } else {
          setError(result.error || "Erreur lors de la récupération du panier");
        }
        setLoading(false);
      } catch (error) {
        setError("Une erreur s'est produite");
        setLoading(false);
      }
    };

    fetchCart();
  }, [currentUser]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (!currentUser) return;
    
    try {
      const result = await updateCartItemQuantity(currentUser.uid, productId, newQuantity);
      if (result.success) {
        // Mettre à jour l'état local du panier
        const updatedItems = cart.items.map(item => {
          if (item.productId === productId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        }).filter(item => item.quantity > 0);
        
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        setCart({
          ...cart,
          items: updatedItems,
          totalItems,
          totalPrice
        });
      } else {
        setError(result.error || "Erreur lors de la mise à jour de la quantité");
      }
    } catch (error) {
      setError("Une erreur s'est produite");
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!currentUser) return;
    
    try {
      const result = await removeFromCart(currentUser.uid, productId);
      if (result.success) {
        // Mettre à jour l'état local du panier
        const updatedItems = cart.items.filter(item => item.productId !== productId);
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        setCart({
          ...cart,
          items: updatedItems,
          totalItems,
          totalPrice
        });
      } else {
        setError(result.error || "Erreur lors de la suppression du produit");
      }
    } catch (error) {
      setError("Une erreur s'est produite");
    }
  };

  const handleClearCart = async () => {
    if (!currentUser) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      try {
        const result = await clearCart(currentUser.uid);
        if (result.success) {
          setCart({
            ...cart,
            items: [],
            totalItems: 0,
            totalPrice: 0
          });
        } else {
          setError(result.error || "Erreur lors de la vidange du panier");
        }
      } catch (error) {
        setError("Une erreur s'est produite");
      }
    }
  };

  const handleCheckout = async () => {
    if (!currentUser || !cart || cart.items.length === 0) return;
    
    setIsCheckingOut(true);
    setError('');
    
    try {
      // Pour la simulation, on utilise une adresse factice
      const userAddress = {
        name: currentUser.displayName || 'Client',
        email: currentUser.email,
        address: '123 Rue de la Simulation',
        city: 'Ville Factice',
        postalCode: '75000',
        country: 'France'
      };
      
      const result = await createOrder(currentUser.uid, cart, userAddress);
      
      if (result.success) {
        setCheckoutSuccess(true);
        setOrderId(result.orderId);
        
        // Réinitialiser le panier localement
        setCart({
          ...cart,
          items: [],
          totalItems: 0,
          totalPrice: 0
        });
        
        // Rediriger vers la page de succès après 3 secondes
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } else {
        setError(result.error || "Erreur lors de la finalisation de la commande");
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de la finalisation de la commande");
    }
    
    setIsCheckingOut(false);
  };

  if (!currentUser) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="cart-container">
          <div className="cart-header">
            <h1>Mon Panier</h1>
          </div>
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingCart size={80} />
            </div>
            <h2>Veuillez vous connecter</h2>
            <p>Vous devez être connecté pour accéder à votre panier.</p>
            <Link to="/login" className="cart-empty-button">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="cart-container">
          <div className="cart-header">
            <h1>Mon Panier</h1>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Chargement de votre panier...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="cart-container">
          <div className="cart-header">
            <h1>Mon Panier</h1>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (checkoutSuccess) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="cart-container">
          <div className="cart-header">
            <h1>Commande confirmée</h1>
          </div>
          <div className="cart-success">
            <div className="success-icon">
              <Check size={80} color="#4caf50" />
            </div>
            <h2>Merci pour votre commande !</h2>
            <p>Votre commande a été confirmée et sera bientôt préparée.</p>
            <p className="order-id">Numéro de commande : {orderId}</p>
            <p>Vous allez être redirigé vers votre profil dans quelques secondes...</p>
            <div className="success-actions">
              <Link to="/" className="continue-shopping-button">
                Continuer mes achats
              </Link>
              <Link to="/profile" className="view-order-button">
                Voir mes commandes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="cart-container">
          <div className="cart-header">
            <h1>Mon Panier</h1>
          </div>
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingCart size={80} />
            </div>
            <h2>Votre panier est vide</h2>
            <p>Vous n'avez aucun article dans votre panier pour le moment.</p>
            <Link to="/" className="cart-empty-button">
              Commencer vos achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-container">
        <div className="cart-header">
          <h1>Mon Panier</h1>
          <p>{cart.totalItems} article{cart.totalItems > 1 ? 's' : ''} dans votre panier</p>
        </div>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item.productId} className="cart-item">
              <img 
                src={item.image || "/api/placeholder/100/100"} 
                alt={item.name} 
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{item.price.toFixed(2)} €</div>
                </div>
                <div className="cart-item-quantity">
                  <button 
                    className="cart-quantity-btn"
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                    className="cart-quantity-input"
                  />
                  <button 
                    className="cart-quantity-btn"
                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <button 
                className="cart-item-remove"
                onClick={() => handleRemoveItem(item.productId)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h2>Récapitulatif</h2>
          <div className="summary-row">
            <div className="summary-label">Sous-total</div>
            <div className="summary-value">{cart.totalPrice?.toFixed(2)} €</div>
          </div>
          <div className="summary-row">
            <div className="summary-label">Frais de livraison</div>
            <div className="summary-value">Gratuit</div>
          </div>
          <div className="summary-total">
            <div className="summary-total-label">Total</div>
            <div className="summary-total-value">{cart.totalPrice?.toFixed(2)} €</div>
          </div>
          
          <button 
            className="checkout-button"
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? (
              'Traitement en cours...'
            ) : (
              <>
                <CreditCard size={18} style={{ marginRight: '0.5rem' }} />
                Finaliser la commande (simulation)
              </>
            )}
          </button>
          
          <p className="simulation-note">
            Ceci est une simulation de paiement. Aucune carte bancaire ne sera débitée.
          </p>
        </div>
        
        <div className="cart-actions">
          <Link to="/" className="continue-shopping">
            <ArrowLeft size={18} />
            Continuer mes achats
          </Link>
          
          <button 
            className="clear-cart"
            onClick={handleClearCart}
          >
            <Trash2 size={18} />
            Vider le panier
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;