import React, { useState, useEffect } from 'react';
import { getAllProducts } from '../../firebase/products';
import { getAllOrders } from '../../firebase/orders';
import { BarChart2, ShoppingBag, DollarSign, Users, TrendingUp } from 'lucide-react';

const AdminStats = () => {
  const [productStats, setProductStats] = useState({
    total: 0,
    byCategory: {}
  });
  
  const [orderStats, setOrderStats] = useState({
    total: 0,
    totalRevenue: 0,
    byStatus: {}
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Récupérer les produits
        const productsResult = await getAllProducts();
        if (productsResult.success) {
          const products = productsResult.products;
          
          // Statistiques des produits
          const categoryCounts = {};
          products.forEach(product => {
            product.categories.forEach(category => {
              categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            });
          });
          
          setProductStats({
            total: products.length,
            byCategory: categoryCounts
          });
        }
        
        // Récupérer les commandes
        const ordersResult = await getAllOrders();
        if (ordersResult.success) {
          const orders = ordersResult.orders;
          
          // Statistiques des commandes
          let totalRevenue = 0;
          const statusCounts = {};
          
          orders.forEach(order => {
            totalRevenue += order.totalPrice || 0;
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
          });
          
          setOrderStats({
            total: orders.length,
            totalRevenue,
            byStatus: statusCounts
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
      
      setLoading(false);
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return <div>Chargement des statistiques...</div>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Tableau de bord</h1>
      </div>
      
      {/* Stats cards */}
      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <ShoppingBag size={40} style={{ color: 'var(--primary-color)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{productStats.total}</h2>
          <p style={{ color: '#666' }}>Produits</p>
        </div>
        
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <Users size={40} style={{ color: 'var(--secondary-color)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{orderStats.total}</h2>
          <p style={{ color: '#666' }}>Commandes</p>
        </div>
        
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <DollarSign size={40} style={{ color: '#4caf50', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {orderStats.totalRevenue.toFixed(2)} €
          </h2>
          <p style={{ color: '#666' }}>Chiffre d'affaires</p>
        </div>
        
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <TrendingUp size={40} style={{ color: '#f44336', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {((orderStats.total / (productStats.total || 1)) * 100).toFixed(0)}%
          </h2>
          <p style={{ color: '#666' }}>Taux de conversion</p>
        </div>
      </div>
      
      {/* Product stats */}
      <div className="admin-card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
          <BarChart2 size={24} style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} />
          Répartition des produits par catégorie
        </h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {Object.entries(productStats.byCategory).map(([category, count]) => {
            // Mapper les noms de catégories techniques aux noms affichés
            const categoryNames = {
              'home': 'Accueil',
              'gaming': 'Gaming',
              'retro': 'Retro',
              'tcg': 'TCG',
              'goodies': 'Goodies'
            };
            
            const displayName = categoryNames[category] || category;
            const percentage = (count / productStats.total) * 100;
            
            return (
              <div key={category} style={{ flex: '1 0 200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>{displayName}</span>
                  <span>{count} produits ({percentage.toFixed(1)}%)</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${percentage}%`, 
                    height: '100%', 
                    backgroundColor: 'var(--primary-color)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Order stats */}
      <div className="admin-card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
          <BarChart2 size={24} style={{ marginRight: '0.5rem', color: 'var(--secondary-color)' }} />
          État des commandes
        </h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {Object.entries(orderStats.byStatus).map(([status, count]) => {
            // Mapper les status techniques aux noms affichés
            const statusNames = {
              'pending': 'En attente',
              'processing': 'En traitement',
              'shipped': 'Expédié',
              'delivered': 'Livré',
              'cancelled': 'Annulé'
            };
            
            const displayName = statusNames[status] || status;
            const percentage = (count / orderStats.total) * 100;
            
            // Couleurs pour chaque statut
            const statusColors = {
              'pending': '#ffc107',
              'processing': '#2196f3',
              'shipped': '#4caf50',
              'delivered': '#8bc34a',
              'cancelled': '#f44336'
            };
            
            const color = statusColors[status] || '#9e9e9e';
            
            return (
              <div key={status} style={{ flex: '1 0 200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>{displayName}</span>
                  <span>{count} commandes ({percentage.toFixed(1)}%)</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${percentage}%`, 
                    height: '100%', 
                    backgroundColor: color,
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminStats;