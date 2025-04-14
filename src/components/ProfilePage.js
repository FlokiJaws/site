import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getUserOrderHistory } from '../firebase/checkout';
import { ShoppingBag, User, MapPin, Settings, Package, Calendar, CreditCard, Clock, ChevronRight } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        // Récupérer les données utilisateur
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
        
        // Récupérer l'historique des commandes
        const historyResult = await getUserOrderHistory(currentUser.uid);
        if (historyResult.success) {
          setOrderHistory(historyResult.orders);
        } else {
          setError("Erreur lors de la récupération de l'historique des commandes");
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError("Une erreur s'est produite lors de la récupération des données utilisateur");
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, [currentUser, navigate]);

  // Formater une date depuis un timestamp Firestore
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

  // Obtenir le statut de la commande en français
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

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107'; // Jaune
      case 'processing': return '#2196f3'; // Bleu
      case 'shipped': return '#4caf50'; // Vert
      case 'delivered': return '#8bc34a'; // Vert clair
      case 'cancelled': return '#f44336'; // Rouge
      default: return '#9e9e9e'; // Gris
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-user-info">
            <div className="profile-avatar">
              {userData?.displayName?.charAt(0) || currentUser.email?.charAt(0) || '?'}
            </div>
            <div className="profile-name">
              {userData?.displayName || 'Utilisateur'}
            </div>
            <div className="profile-email">
              {currentUser.email}
            </div>
            <div className="profile-member-since">
              Membre depuis {userData?.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 'récemment'}
            </div>
          </div>
          
          <div className="profile-navigation">
            <button 
              className={`profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`} 
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} />
              <span>Mon profil</span>
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'orders' ? 'active' : ''}`} 
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={20} />
              <span>Mes commandes</span>
              <span className="profile-nav-badge">{orderHistory.length}</span>
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'addresses' ? 'active' : ''}`} 
              onClick={() => setActiveTab('addresses')}
            >
              <MapPin size={20} />
              <span>Mes adresses</span>
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'settings' ? 'active' : ''}`} 
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={20} />
              <span>Paramètres</span>
            </button>
          </div>
          
          <div className="profile-actions">
            <Link to="/" className="profile-back-button">
              Retour à la boutique
            </Link>
          </div>
        </div>
      
        <div className="profile-content">
          {error && (
            <div className="profile-error-message">
              {error}
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div className="profile-tab-content">
              <h2 className="profile-section-title">Détails du profil</h2>
              
              <div className="profile-info-cards">
                <div className="profile-info-card">
                  <div className="profile-info-icon">
                    <User size={24} />
                  </div>
                  <div className="profile-info-content">
                    <h3>Informations personnelles</h3>
                    <p><strong>Nom:</strong> {userData?.displayName || 'Non défini'}</p>
                    <p><strong>Email:</strong> {currentUser.email}</p>
                    <p><strong>Téléphone:</strong> {userData?.phone || 'Non défini'}</p>
                  </div>
                  <button className="profile-edit-button" onClick={() => navigate('/settings')}>
                    Modifier
                  </button>
                </div>
                
                <div className="profile-info-card">
                  <div className="profile-info-icon">
                    <MapPin size={24} />
                  </div>
                  <div className="profile-info-content">
                    <h3>Adresse de livraison principale</h3>
                    {userData?.address ? (
                      <>
                        <p>{userData.address}</p>
                        <p>{userData.postalCode} {userData.city}</p>
                        <p>{userData.country || 'France'}</p>
                      </>
                    ) : (
                      <p>Aucune adresse enregistrée</p>
                    )}
                  </div>
                  <button className="profile-edit-button" onClick={() => setActiveTab('addresses')}>
                    Gérer
                  </button>
                </div>
                
                <div className="profile-info-card">
                  <div className="profile-info-icon">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="profile-info-content">
                    <h3>Résumé des commandes</h3>
                    <p><strong>Total des commandes:</strong> {orderHistory.length}</p>
                    <p>
                      <strong>Dernière commande:</strong> {
                        orderHistory.length > 0 
                          ? formatDate(orderHistory[0].createdAt)
                          : 'Aucune commande'
                      }
                    </p>
                  </div>
                  <button className="profile-edit-button" onClick={() => setActiveTab('orders')}>
                    Voir tout
                  </button>
                </div>
              </div>
              
              {orderHistory.length > 0 && (
                <div className="profile-recent-orders">
                  <h2 className="profile-section-title">Commandes récentes</h2>
                  <div className="profile-orders-list">
                    {orderHistory.slice(0, 3).map(order => (
                      <div key={order.id} className="profile-order-card">
                        <div className="profile-order-header">
                          <div className="profile-order-info">
                            <h3>Commande #{order.id.substring(0, 8)}</h3>
                            <p className="profile-order-date">
                              <Calendar size={16} />
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div 
                            className="profile-order-status"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          >
                            {getStatusText(order.status)}
                          </div>
                        </div>
                        
                        <div className="profile-order-items">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="profile-order-item">
                              <img 
                                src={item.image || "/api/placeholder/50/50"} 
                                alt={item.name}
                                className="profile-order-item-image"
                              />
                              <div className="profile-order-item-details">
                                <p className="profile-order-item-name">{item.name}</p>
                                <p className="profile-order-item-price">
                                  {item.price.toFixed(2)} € × {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="profile-order-more-items">
                              + {order.items.length - 2} article(s) supplémentaire(s)
                            </p>
                          )}
                        </div>
                        
                        <div className="profile-order-footer">
                          <div className="profile-order-total">
                            Total: <strong>{order.totalPrice.toFixed(2)} €</strong>
                          </div>
                          <button 
                            className="profile-order-details-button"
                            onClick={() => {
                              setActiveTab('orders');
                              // Idéalement, ajoutez ici un scroll vers la commande spécifique
                            }}
                          >
                            Voir les détails
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {orderHistory.length > 3 && (
                    <button 
                      className="profile-view-all-button"
                      onClick={() => setActiveTab('orders')}
                    >
                      Voir toutes mes commandes
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div className="profile-tab-content">
              <h2 className="profile-section-title">Historique des commandes</h2>
              
              {orderHistory.length === 0 ? (
                <div className="profile-empty-state">
                  <Package size={48} />
                  <h3>Aucune commande</h3>
                  <p>Vous n'avez pas encore passé de commande sur notre site.</p>
                  <Link to="/" className="profile-shop-now-button">
                    Commencer mes achats
                  </Link>
                </div>
              ) : (
                <div className="profile-orders-list">
                  {orderHistory.map(order => (
                    <div key={order.id} className="profile-order-card expanded">
                      <div className="profile-order-header">
                        <div className="profile-order-info">
                          <h3>Commande #{order.id.substring(0, 8)}</h3>
                          <p className="profile-order-date">
                            <Calendar size={16} />
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div 
                          className="profile-order-status"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {getStatusText(order.status)}
                        </div>
                      </div>
                      
                      <div className="profile-order-details">
                        <div className="profile-order-details-section">
                          <h4>
                            <Package size={18} />
                            Articles commandés
                          </h4>
                          <div className="profile-order-items-list">
                            {order.items.map((item, index) => (
                              <div key={index} className="profile-order-detail-item">
                                <img 
                                  src={item.image || "/api/placeholder/60/60"} 
                                  alt={item.name}
                                  className="profile-order-detail-item-image"
                                />
                                <div className="profile-order-detail-item-info">
                                  <p className="profile-order-detail-item-name">{item.name}</p>
                                  <p className="profile-order-detail-item-price">
                                    {item.price.toFixed(2)} € × {item.quantity}
                                  </p>
                                </div>
                                <div className="profile-order-detail-item-total">
                                  {(item.price * item.quantity).toFixed(2)} €
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="profile-order-details-columns">
                          <div className="profile-order-details-section">
                            <h4>
                              <CreditCard size={18} />
                              Détails de paiement
                            </h4>
                            <div className="profile-order-payment-details">
                              <p><strong>Méthode:</strong> Carte bancaire (Simulation)</p>
                              <p><strong>Statut:</strong> {order.paymentStatus || 'Payé'}</p>
                              <div className="profile-order-summary">
                                <div className="profile-order-summary-row">
                                  <span>Sous-total</span>
                                  <span>{order.totalPrice?.toFixed(2)} €</span>
                                </div>
                                <div className="profile-order-summary-row">
                                  <span>Livraison</span>
                                  <span>Gratuit</span>
                                </div>
                                <div className="profile-order-summary-row total">
                                  <span>Total</span>
                                  <span>{order.totalPrice?.toFixed(2)} €</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="profile-order-details-section">
                            <h4>
                              <MapPin size={18} />
                              Adresse de livraison
                            </h4>
                            <div className="profile-order-address">
                              {order.shippingAddress ? (
                                <>
                                  <p>{order.shippingAddress.name}</p>
                                  <p>{order.shippingAddress.address}</p>
                                  <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                                  <p>{order.shippingAddress.country}</p>
                                </>
                              ) : (
                                <p>Adresse non disponible</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="profile-order-details-section">
                          <h4>
                            <Clock size={18} />
                            Suivi de commande
                          </h4>
                          <div className="profile-order-timeline">
                            <div className={`profile-timeline-step ${order.status !== 'cancelled' ? 'completed' : 'cancelled'}`}>
                              <div className="profile-timeline-dot"></div>
                              <div className="profile-timeline-content">
                                <p className="profile-timeline-title">Commande passée</p>
                                <p className="profile-timeline-date">{formatDate(order.createdAt)}</p>
                              </div>
                            </div>
                            
                            <div className={`profile-timeline-step ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : (order.status === 'cancelled' ? 'cancelled' : '')}`}>
                              <div className="profile-timeline-dot"></div>
                              <div className="profile-timeline-content">
                                <p className="profile-timeline-title">En préparation</p>
                                <p className="profile-timeline-date">
                                  {order.processingDate ? formatDate(order.processingDate) : ''}
                                </p>
                              </div>
                            </div>
                            
                            <div className={`profile-timeline-step ${['shipped', 'delivered'].includes(order.status) ? 'completed' : (order.status === 'cancelled' ? 'cancelled' : '')}`}>
                              <div className="profile-timeline-dot"></div>
                              <div className="profile-timeline-content">
                                <p className="profile-timeline-title">Expédiée</p>
                                <p className="profile-timeline-date">
                                  {order.shippedDate ? formatDate(order.shippedDate) : ''}
                                </p>
                              </div>
                            </div>
                            
                            <div className={`profile-timeline-step ${order.status === 'delivered' ? 'completed' : (order.status === 'cancelled' ? 'cancelled' : '')}`}>
                              <div className="profile-timeline-dot"></div>
                              <div className="profile-timeline-content">
                                <p className="profile-timeline-title">Livrée</p>
                                <p className="profile-timeline-date">
                                  {order.deliveredDate ? formatDate(order.deliveredDate) : ''}
                                </p>
                              </div>
                            </div>
                            
                            {order.status === 'cancelled' && (
                              <div className="profile-timeline-step cancelled completed">
                                <div className="profile-timeline-dot"></div>
                                <div className="profile-timeline-content">
                                  <p className="profile-timeline-title">Annulée</p>
                                  <p className="profile-timeline-date">
                                    {order.cancelledDate ? formatDate(order.cancelledDate) : ''}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="profile-order-footer expanded">
                        {order.status === 'pending' && (
                          <button className="profile-order-action-button cancel">
                            Annuler la commande
                          </button>
                        )}
                        <button className="profile-order-action-button">
                          Contacter le support
                        </button>
                        {['shipped', 'delivered'].includes(order.status) && (
                          <button className="profile-order-action-button primary">
                            Suivre ma livraison
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'addresses' && (
            <div className="profile-tab-content">
              <h2 className="profile-section-title">Mes adresses</h2>
              
              <div className="profile-addresses">
                <div className="profile-address-card">
                  <h3>Adresse principale</h3>
                  
                  {userData?.address ? (
                    <div className="profile-address-content">
                      <p><strong>Adresse:</strong> {userData.address}</p>
                      <p><strong>Code postal:</strong> {userData.postalCode || 'Non défini'}</p>
                      <p><strong>Ville:</strong> {userData.city || 'Non définie'}</p>
                      <p><strong>Pays:</strong> {userData.country || 'France'}</p>
                      
                      <div className="profile-address-actions">
                        <button className="profile-edit-button" onClick={() => navigate('/settings')}>
                          Modifier
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-address-empty">
                      <p>Vous n'avez pas encore ajouté d'adresse principale.</p>
                      <button className="profile-add-button" onClick={() => navigate('/settings')}>
                        Ajouter une adresse
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Dans une future mise à jour, vous pourriez ajouter la gestion de plusieurs adresses ici */}
                <div className="profile-address-card add-new">
                  <h3>Ajouter une nouvelle adresse</h3>
                  <div className="profile-address-empty">
                    <p>La gestion de plusieurs adresses sera disponible prochainement.</p>
                    <button className="profile-disabled-button" disabled>
                      Fonctionnalité à venir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="profile-tab-content">
              <h2 className="profile-section-title">Paramètres du compte</h2>
              
              <div className="profile-settings-section">
                <h3>Paramètres personnels</h3>
                <p>Modifiez vos informations personnelles et vos préférences.</p>
                <button className="profile-action-button" onClick={() => navigate('/settings')}>
                  Accéder aux paramètres
                </button>
              </div>
              
              <div className="profile-settings-section">
                <h3>Sécurité du compte</h3>
                <p>Changez votre mot de passe ou mettez à jour vos informations de sécurité.</p>
                <button className="profile-action-button" onClick={() => navigate('/settings')}>
                  Gérer la sécurité
                </button>
              </div>
              
              <div className="profile-settings-section">
                <h3>Préférences de notification</h3>
                <p>Gérez vos préférences d'e-mails et de notifications.</p>
                <button className="profile-disabled-button" disabled>
                  Fonctionnalité à venir
                </button>
              </div>
              
              <div className="profile-settings-section danger">
                <h3>Supprimer mon compte</h3>
                <p>Cette action est irréversible et supprimera toutes vos données.</p>
                <button className="profile-action-button delete">
                  Supprimer mon compte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;