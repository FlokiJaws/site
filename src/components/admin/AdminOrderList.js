import React, { useState, useEffect } from 'react';
import { getActiveOrders, getCompletedOrders, updateOrderStatus } from '../../firebase/orders';
import { Archive, BarChart2, FileText, Clock } from 'lucide-react';

const AdminOrderList = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Récupérer les commandes actives
      const activeResult = await getActiveOrders();
      if (activeResult.success) {
        setActiveOrders(activeResult.orders);
      } else {
        setError(activeResult.error || "Erreur lors de la récupération des commandes actives");
      }
      
      // Récupérer les commandes terminées
      const completedResult = await getCompletedOrders();
      if (completedResult.success) {
        setCompletedOrders(completedResult.orders);
      } else {
        setError(completedResult.error || "Erreur lors de la récupération des commandes terminées");
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de la récupération des commandes");
      console.error(error);
    }
    
    setLoading(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        setSuccess(`Statut de la commande mis à jour avec succès`);
        // Rafraîchir les listes de commandes
        fetchOrders();
        
        // Effacer le message de succès après 3 secondes
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(`Erreur: ${result.error}`);
        
        // Effacer le message d'erreur après 3 secondes
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de la mise à jour du statut");
      console.error(error);
      
      // Effacer le message d'erreur après 3 secondes
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107'; // Yellow
      case 'processing':
        return '#2196f3'; // Blue
      case 'shipped':
        return '#4caf50'; // Green
      case 'delivered':
        return '#8bc34a'; // Light Green
      case 'cancelled':
        return '#f44336'; // Red
      default:
        return '#9e9e9e'; // Grey
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Gestion des commandes</h1>
      </div>

      {success && (
        <div style={{ 
          backgroundColor: '#e8f5e9', 
          color: '#2e7d32', 
          padding: '0.8rem', 
          borderRadius: '8px', 
          marginBottom: '1rem' 
        }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '0.8rem', 
          borderRadius: '8px', 
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}

      <div className="admin-tabs" style={{ marginBottom: '1.5rem' }}>
        <button 
          className={`admin-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <Clock size={18} style={{ marginRight: '0.5rem' }} />
          Commandes en cours ({activeOrders.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <Archive size={18} style={{ marginRight: '0.5rem' }} />
          Commandes terminées ({completedOrders.length})
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <p>Chargement des commandes...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID Commande</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Articles</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === 'active' ? (
                  activeOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center' }}>
                        Aucune commande en cours
                      </td>
                    </tr>
                  ) : (
                    activeOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id.substring(0, 8)}...</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{order.userId.substring(0, 8)}...</td>
                        <td>{order.totalPrice?.toFixed(2)} €</td>
                        <td>{order.totalItems} articles</td>
                        <td>
                          <span 
                            style={{ 
                              backgroundColor: getStatusColor(order.status),
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.85rem'
                            }}
                          >
                            {order.status === 'pending' && 'En attente'}
                            {order.status === 'processing' && 'En traitement'}
                            {order.status === 'shipped' && 'Expédié'}
                            {order.status === 'delivered' && 'Livré'}
                            {order.status === 'cancelled' && 'Annulé'}
                          </span>
                        </td>
                        <td>
                          <select 
                            value={order.status} 
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            style={{ 
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #ddd'
                            }}
                          >
                            <option value="pending">En attente</option>
                            <option value="processing">En traitement</option>
                            <option value="shipped">Expédié</option>
                            <option value="delivered">Livré</option>
                            <option value="cancelled">Annulé</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  completedOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center' }}>
                        Aucune commande terminée
                      </td>
                    </tr>
                  ) : (
                    completedOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id.substring(0, 8)}...</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{order.userId.substring(0, 8)}...</td>
                        <td>{order.totalPrice?.toFixed(2)} €</td>
                        <td>{order.totalItems} articles</td>
                        <td>
                          <span 
                            style={{ 
                              backgroundColor: getStatusColor(order.status),
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.85rem'
                            }}
                          >
                            {order.status === 'delivered' && 'Livré'}
                            {order.status === 'cancelled' && 'Annulé'}
                          </span>
                        </td>
                        <td>
                          <select 
                            value={order.status} 
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            style={{ 
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #ddd'
                            }}
                          >
                            <option value="delivered">Livré</option>
                            <option value="cancelled">Annulé</option>
                            <option value="pending">Remettre en attente</option>
                            <option value="processing">Remettre en traitement</option>
                            <option value="shipped">Remettre en expédition</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderList;