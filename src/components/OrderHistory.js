import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { getUserOrderHistory } from '../firebase/checkout';
import { getUserProductReview } from '../firebase/reviews';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import './OrderHistory.css';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [reviewedProducts, setReviewedProducts] = useState({});

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const result = await getUserOrderHistory(currentUser.uid);
        if (result.success) {
          // Trier les commandes par date (plus récente en premier)
          const sortedOrders = result.orders.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
            return dateB - dateA;
          });
          
          setOrders(sortedOrders);
        } else {
          setError(result.error || "Erreur lors de la récupération de l'historique des commandes");
        }
      } catch (error) {
        setError("Une erreur s'est produite");
        console.error(error);
      }
      
      setLoading(false);
    };

    fetchOrderHistory();
  }, [currentUser, navigate]);

  useEffect(() => {
    const checkReviewedProducts = async () => {
      if (!currentUser || !orders.length) return;
      
      const reviewedProductsMap = {};
      
      // Parcourir toutes les commandes et leurs produits
      for (const order of orders) {
        if (order.status === 'delivered') {
          for (const item of order.items) {
            // Vérifier si l'utilisateur a déjà évalué ce produit
            const result = await getUserProductReview(currentUser.uid, item.productId);
            if (result.success) {
              reviewedProductsMap[item.productId] = result.review ? true : false;
            }
          }
        }
      }
      
      setReviewedProducts(reviewedProductsMap);
    };
    
    checkReviewedProducts();
  }, [currentUser, orders]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    
    const date = timestamp.seconds 
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
      
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processing': return 'En traitement';
      case 'shipped': return 'Expédié';
      case 'delivered': return 'Livré';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107'; // Yellow
      case 'processing': return '#2196f3'; // Blue
      case 'shipped': return '#4caf50'; // Green
      case 'delivered': return '#8bc34a'; // Light Green
      case 'cancelled': return '#f44336'; // Red
      default: return '#9e9e9e'; // Grey
    }
  };

  if (loading) {
    return (
      <div className="order-history-page">
        <Navbar />
        <div className="order-container">
          <div className="order-header">
            <h1>Historique des commandes</h1>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Chargement de vos commandes...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-page">
        <Navbar />
        <div className="order-container">
          <div className="order-header">
            <h1>Historique des commandes</h1>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="order-history-page">
        <Navbar />
        <div className="order-container">
          <div className="order-header">
            <h1>Historique des commandes</h1>
          </div>
          <div className="order-empty">
            <div className="order-empty-icon">
              <Package size={80} />
            </div>
            <h2>Aucune commande</h2>
            <p>Vous n'avez pas encore passé de commande.</p>
            <button 
              className="shop-now-button"
              onClick={() => navigate('/')}
            >
              Parcourir les produits
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <Navbar />
      <div className="order-container">
        <div className="order-header">
          <h1>Historique des commandes</h1>
          <p>Consultez vos commandes passées</p>
        </div>
        
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header" onClick={() => toggleOrderDetails(order.id)}>
                <div className="order-meta">
                  <div className="order-id">
                    <span>Commande #{order.id.substring(0, 8)}</span>
                  </div>
                  <div className="order-date">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                
                <div className="order-summary">
                  <div className="order-total">
                    {order.totalPrice?.toFixed(2)} €
                  </div>
                  <div 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </div>
                  <div className="expand-button">
                    {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>
              
              {expandedOrder === order.id && (
                <div className="order-details">
                  <div className="order-items">
                    <h3>Détail des articles</h3>
                    <div className="order-items-list">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-detail-item">
                          <div className="order-item-image-container">
                            <img 
                              src={item.image || "/api/placeholder/60/60"} 
                              alt={item.name} 
                              className="order-item-image" 
                            />
                          </div>
                          <div className="order-item-details">
                            <div className="order-item-name">{item.name}</div>
                            <div className="order-item-price">{item.price.toFixed(2)} € × {item.quantity}</div>
                          </div>
                          <div className="order-item-total">
                            {(item.price * item.quantity).toFixed(2)} €
                          </div>
                          
                          {order.status === 'delivered' && (
                            <div className="order-item-review">
                              {reviewedProducts[item.productId] ? (
                                <Link 
                                  to={`/reviews/${item.productId}`} 
                                  className="view-review-button"
                                >
                                  Voir votre avis
                                </Link>
                              ) : (
                                <Link 
                                  to={`/reviews/${item.productId}`} 
                                  className="leave-review-button"
                                >
                                  Laisser un avis
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="order-summary-details">
                    <div className="summary-detail">
                      <span>Sous-total</span>
                      <span>{order.totalPrice?.toFixed(2)} €</span>
                    </div>
                    <div className="summary-detail">
                      <span>Livraison</span>
                      <span>Gratuit</span>
                    </div>
                    <div className="summary-detail total">
                      <span>Total</span>
                      <span>{order.totalPrice?.toFixed(2)} €</span>
                    </div>
                  </div>
                  
                  <div className="order-shipping">
                    <h3>Livraison</h3>
                    <p>{order.shippingAddress?.name}</p>
                    <p>{order.shippingAddress?.address}</p>
                    <p>{order.shippingAddress?.postalCode} {order.shippingAddress?.city}</p>
                    <p>{order.shippingAddress?.country}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;