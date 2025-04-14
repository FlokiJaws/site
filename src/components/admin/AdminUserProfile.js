import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { User, Mail, Phone, MapPin, ShoppingBag, Calendar, Edit, Save, ArrowLeft, Shield, AlertTriangle, DollarSign, Package, CreditCard, TrendingUp, Clock, Home } from 'lucide-react';
import './AdminUserProfile.css';

const AdminUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    role: ''
  });
  
  // Statistiques calculées
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    lastOrderDate: null,
    firstOrderDate: null,
    completedOrders: 0,
    cancelledOrders: 0,
    pendingOrders: 0,
    totalItems: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError("Identifiant utilisateur manquant");
        setLoading(false);
        return;
      }

      try {
        // Récupérer les données de l'utilisateur
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
          setError("Utilisateur non trouvé");
          setLoading(false);
          return;
        }

        const user = userDoc.data();
        setUserData(user);
        setEditedData({
          displayName: user.displayName || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          postalCode: user.postalCode || '',
          country: user.country || 'France',
          role: user.role || 'customer'
        });

        // Récupérer les commandes de l'utilisateur
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', userId)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const orders = [];
        ordersSnapshot.forEach(doc => {
          orders.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Trier les commandes par date (plus récentes en premier)
        orders.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
          return dateB - dateA;
        });

        setUserOrders(orders);
        
        // Calculer les statistiques avancées
        if (orders.length > 0) {
          const totalSpent = orders.reduce((sum, order) => {
            // Ne pas compter les commandes annulées dans le total dépensé
            if (order.status !== 'cancelled') {
              return sum + (order.totalPrice || 0);
            }
            return sum;
          }, 0);
          
          const totalItems = orders.reduce((sum, order) => {
            return sum + (order.totalItems || 0);
          }, 0);
          
          const completedOrders = orders.filter(order => order.status === 'delivered').length;
          const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
          const pendingOrders = orders.filter(order => 
            ['pending', 'processing', 'shipped'].includes(order.status)
          ).length;
          
          const firstOrder = [...orders].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
            return dateA - dateB;
          })[0];
          
          const lastOrder = orders[0]; // Déjà trié, plus récent en premier
          
          setUserStats({
            totalOrders: orders.length,
            totalSpent: totalSpent,
            averageOrderValue: orders.length > 0 ? totalSpent / (orders.length - cancelledOrders) : 0,
            lastOrderDate: lastOrder?.createdAt || null,
            firstOrderDate: firstOrder?.createdAt || null,
            completedOrders,
            cancelledOrders,
            pendingOrders,
            totalItems
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setError("Erreur lors de la récupération des données utilisateur");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...editedData,
        updatedAt: new Date()
      });

      // Mettre à jour les données locales
      setUserData(prev => ({
        ...prev,
        ...editedData
      }));

      setIsEditing(false);
      // Afficher un message de succès
      alert("Profil utilisateur mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setError("Erreur lors de la mise à jour du profil");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.seconds 
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
      
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#2196f3';
      case 'shipped': return '#4caf50';
      case 'delivered': return '#8bc34a';
      case 'cancelled': return '#f44336';
      default: return '#9e9e9e';
    }
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

  // Formater les montants en euros
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="admin-user-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des données utilisateur...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-user-error">
        <AlertTriangle size={48} />
        <h2>Erreur</h2>
        <p>{error}</p>
        <div className="admin-error-actions">
          <button 
            className="admin-button"
            onClick={() => navigate('/admin/users')}
          >
            Retour à la liste des utilisateurs
          </button>
          <Link to="/" className="admin-button secondary">
            Retour au site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-profile">
      <div className="admin-user-header">
        <div className="admin-navigation-buttons">
          <button 
            className="admin-back-button"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft size={18} />
            Retour aux utilisateurs
          </button>
          <Link to="/" className="admin-home-button">
            <Home size={18} />
            Retour au site
          </Link>
        </div>
        
        <h1>Profil Utilisateur</h1>
        {!isEditing ? (
          <button 
            className="admin-edit-button"
            onClick={() => setIsEditing(true)}
          >
            <Edit size={18} />
            Modifier
          </button>
        ) : (
          <button 
            className="admin-save-button"
            onClick={handleSaveChanges}
          >
            <Save size={18} />
            Enregistrer
          </button>
        )}
      </div>

      <div className="admin-user-container">
        <div className="admin-user-sidebar">
          <div className="admin-user-avatar">
            {userData?.displayName?.charAt(0) || userData?.email?.charAt(0) || '?'}
          </div>
          <div className="admin-user-meta">
            <h2>{userData?.displayName || 'Utilisateur sans nom'}</h2>
            <p className="admin-user-email">{userData?.email}</p>
            <div className="admin-user-status">
              <div className={`user-status-badge ${userData?.role === 'admin' ? 'admin' : 'customer'}`}>
                {userData?.role === 'admin' ? 'Administrateur' : 'Client'}
              </div>
            </div>
          </div>
          
          {/* Statistiques basiques */}
          <div className="admin-user-stats">
            <div className="admin-stat-item">
              <ShoppingBag size={20} />
              <div className="admin-stat-content">
                <span className="admin-stat-value">{userStats.totalOrders}</span>
                <span className="admin-stat-label">Commandes</span>
              </div>
            </div>
            <div className="admin-stat-item">
              <Calendar size={20} />
              <div className="admin-stat-content">
                <span className="admin-stat-value">
                  {userData?.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
                <span className="admin-stat-label">Date d'inscription</span>
              </div>
            </div>
            <div className="admin-stat-item highlight">
              <DollarSign size={20} />
              <div className="admin-stat-content">
                <span className="admin-stat-value">{formatCurrency(userStats.totalSpent)}</span>
                <span className="admin-stat-label">Total dépensé</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-user-content">
          {/* Statistiques avancées */}
          <div className="admin-user-section">
            <h3>
              <TrendingUp size={20} />
              Statistiques du client
            </h3>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-card-icon">
                  <DollarSign size={24} />
                </div>
                <div className="admin-stat-card-content">
                  <div className="admin-stat-card-value">{formatCurrency(userStats.totalSpent)}</div>
                  <div className="admin-stat-card-label">Total dépensé</div>
                </div>
              </div>
              
              <div className="admin-stat-card">
                <div className="admin-stat-card-icon">
                  <ShoppingBag size={24} />
                </div>
                <div className="admin-stat-card-content">
                  <div className="admin-stat-card-value">{userStats.totalOrders}</div>
                  <div className="admin-stat-card-label">Nombre de commandes</div>
                </div>
              </div>
              
              <div className="admin-stat-card">
                <div className="admin-stat-card-icon">
                  <CreditCard size={24} />
                </div>
                <div className="admin-stat-card-content">
                  <div className="admin-stat-card-value">
                    {userStats.averageOrderValue > 0 
                      ? formatCurrency(userStats.averageOrderValue) 
                      : 'N/A'}
                  </div>
                  <div className="admin-stat-card-label">Valeur moyenne</div>
                </div>
              </div>
              
              <div className="admin-stat-card">
                <div className="admin-stat-card-icon">
                  <Package size={24} />
                </div>
                <div className="admin-stat-card-content">
                  <div className="admin-stat-card-value">{userStats.totalItems}</div>
                  <div className="admin-stat-card-label">Articles achetés</div>
                </div>
              </div>
            </div>
            
            <div className="admin-stats-secondary">
              <div className="admin-stat-group">
                <h4>Statut des commandes</h4>
                <div className="admin-stat-progress-container">
                  <div className="admin-stat-progress-item">
                    <div className="admin-stat-label">
                      <span className="status-dot delivered"></span>
                      Livrées
                    </div>
                    <div className="admin-stat-bar-container">
                      <div 
                        className="admin-stat-bar delivered" 
                        style={{ 
                          width: userStats.totalOrders > 0 
                            ? `${(userStats.completedOrders / userStats.totalOrders) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                    <div className="admin-stat-value">{userStats.completedOrders}</div>
                  </div>
                  
                  <div className="admin-stat-progress-item">
                    <div className="admin-stat-label">
                      <span className="status-dot pending"></span>
                      En cours
                    </div>
                    <div className="admin-stat-bar-container">
                      <div 
                        className="admin-stat-bar pending" 
                        style={{ 
                          width: userStats.totalOrders > 0 
                            ? `${(userStats.pendingOrders / userStats.totalOrders) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                    <div className="admin-stat-value">{userStats.pendingOrders}</div>
                  </div>
                  
                  <div className="admin-stat-progress-item">
                    <div className="admin-stat-label">
                      <span className="status-dot cancelled"></span>
                      Annulées
                    </div>
                    <div className="admin-stat-bar-container">
                      <div 
                        className="admin-stat-bar cancelled" 
                        style={{ 
                          width: userStats.totalOrders > 0 
                            ? `${(userStats.cancelledOrders / userStats.totalOrders) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                    <div className="admin-stat-value">{userStats.cancelledOrders}</div>
                  </div>
                </div>
              </div>
              
              <div className="admin-stat-group">
                <h4>Historique d'achat</h4>
                <div className="admin-stat-history">
                  <div className="admin-stat-history-item">
                    <Clock size={18} />
                    <div className="admin-stat-history-content">
                      <div className="admin-stat-history-label">Première commande</div>
                      <div className="admin-stat-history-value">
                        {userStats.firstOrderDate ? formatDate(userStats.firstOrderDate) : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="admin-stat-history-item">
                    <Clock size={18} />
                    <div className="admin-stat-history-content">
                      <div className="admin-stat-history-label">Dernière commande</div>
                      <div className="admin-stat-history-value">
                        {userStats.lastOrderDate ? formatDate(userStats.lastOrderDate) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="admin-user-section">
            <h3>
              <User size={20} />
              Informations personnelles
            </h3>
            {isEditing ? (
              <div className="admin-user-form">
                <div className="admin-form-row">
                <div className="admin-form-group">
                    <label htmlFor="displayName">Nom complet</label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={editedData.displayName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editedData.email}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label htmlFor="phone">Téléphone</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={editedData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="role">Rôle</label>
                    <select
                      id="role"
                      name="role"
                      value={editedData.role}
                      onChange={handleInputChange}
                    >
                      <option value="customer">Client</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-user-info">
                <div className="admin-info-row">
                  <div className="admin-info-label">Nom complet</div>
                  <div className="admin-info-value">{userData?.displayName || 'Non défini'}</div>
                </div>
                <div className="admin-info-row">
                  <div className="admin-info-label">Email</div>
                  <div className="admin-info-value">{userData?.email}</div>
                </div>
                <div className="admin-info-row">
                  <div className="admin-info-label">Téléphone</div>
                  <div className="admin-info-value">{userData?.phone || 'Non défini'}</div>
                </div>
                <div className="admin-info-row">
                  <div className="admin-info-label">Rôle</div>
                  <div className="admin-info-value">
                    <span className={`role-badge ${userData?.role === 'admin' ? 'admin' : 'customer'}`}>
                      {userData?.role === 'admin' ? 'Administrateur' : 'Client'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="admin-user-section">
            <h3>
              <MapPin size={20} />
              Adresse de livraison
            </h3>
            {isEditing ? (
              <div className="admin-user-form">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label htmlFor="address">Adresse</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={editedData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label htmlFor="city">Ville</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={editedData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="postalCode">Code postal</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={editedData.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label htmlFor="country">Pays</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={editedData.country}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-user-info">
                {userData?.address ? (
                  <>
                    <div className="admin-info-row">
                      <div className="admin-info-label">Adresse</div>
                      <div className="admin-info-value">{userData.address}</div>
                    </div>
                    <div className="admin-info-row">
                      <div className="admin-info-label">Ville</div>
                      <div className="admin-info-value">{userData.city || 'Non définie'}</div>
                    </div>
                    <div className="admin-info-row">
                      <div className="admin-info-label">Code postal</div>
                      <div className="admin-info-value">{userData.postalCode || 'Non défini'}</div>
                    </div>
                    <div className="admin-info-row">
                      <div className="admin-info-label">Pays</div>
                      <div className="admin-info-value">{userData.country || 'France'}</div>
                    </div>
                  </>
                ) : (
                  <div className="admin-info-empty">
                    <p>Aucune adresse enregistrée</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="admin-user-section">
            <h3>
              <ShoppingBag size={20} />
              Historique des commandes
            </h3>
            {userOrders.length === 0 ? (
              <div className="admin-info-empty">
                <p>Aucune commande passée par cet utilisateur</p>
              </div>
            ) : (
              <div className="admin-orders-list">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Commande #</th>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Articles</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id.substring(0, 8)}...</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{formatCurrency(order.totalPrice || 0)}</td>
                        <td>
                          <span 
                            className="order-status-badge"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td>{order.items?.length || 0}</td>
                        <td>
                          <button 
                            className="admin-view-order-button"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                          >
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-user-section">
            <h3>
              <Shield size={20} />
              Actions administratives
            </h3>
            <div className="admin-actions-container">
              <div className="admin-action-group">
                <button className="admin-action-button">Réinitialiser mot de passe</button>
                <button className="admin-action-button">Envoyer email</button>
              </div>
              <div className="admin-action-group">
                <button className="admin-action-button warning">Bloquer l'utilisateur</button>
                <button className="admin-action-button danger">Supprimer le compte</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;