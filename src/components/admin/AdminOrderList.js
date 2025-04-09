import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../firebase/orders';

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const result = await getAllOrders();
      if (result.success) {
        setOrders(result.orders);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } else {
      alert(`Erreur: ${result.error}`);
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>
                      Aucune commande trouvée
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id.substring(0, 8)}...</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{order.userId.substring(0, 8)}...</td>
                      <td>{order.totalPrice.toFixed(2)} €</td>
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