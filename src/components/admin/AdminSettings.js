import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Save, Users, Settings as SettingsIcon } from 'lucide-react';

const AdminSettings = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'GameCash',
    siteDescription: 'Votre destination pour tous les produits gaming, rétro, cartes et goodies',
    contactEmail: 'contact@gamecash.com',
    shippingFee: 0, // Gratuit pour l'instant
    taxRate: 20, // TVA 20%
    minOrderForFreeShipping: 0 // Livraison gratuite par défaut
  });
  const [activeTab, setActiveTab] = useState('general');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const querySnapshot = await getDocs(usersQuery);
        
        const usersData = [];
        querySnapshot.forEach(doc => {
          usersData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Erreur lors de la récupération des utilisateurs');
        setLoading(false);
      }
    };

    const fetchSettings = async () => {
      try {
        // Dans une application réelle, vous auriez probablement un document de paramètres
        // Pour cet exemple, on simule juste la récupération des paramètres
        const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
        
        if (settingsDoc.exists()) {
          setSiteSettings(settingsDoc.data());
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchUsers();
    fetchSettings();
  }, []);

  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
      
      // Mettre à jour l'état local
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      setSuccess(`Rôle de l'utilisateur mis à jour avec succès`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError("Erreur lors de la mise à jour du rôle de l'utilisateur");
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSiteSettingsChange = (e) => {
    const { name, value } = e.target;
    setSiteSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveSiteSettings = async () => {
    try {
      // Dans une application réelle, vous sauvegarderiez les paramètres dans Firestore
      await updateDoc(doc(db, 'settings', 'site'), siteSettings);
      
      setSuccess('Paramètres du site mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Erreur lors de la sauvegarde des paramètres');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div>Chargement des paramètres d'administration...</div>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Paramètres d'administration</h1>
      </div>
      
      {success && (
        <div style={{ 
          backgroundColor: '#e8f5e9', 
          color: '#2e7d32', 
          padding: '10px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {success}
        </div>
      )}
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <SettingsIcon size={18} style={{ marginRight: '8px' }} />
          Paramètres généraux
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} style={{ marginRight: '8px' }} />
          Gestion des utilisateurs
        </button>
      </div>
      
      <div className="admin-card">
        {activeTab === 'general' && (
          <div className="admin-settings-form">
            <h2>Paramètres du site</h2>
            
            <div className="admin-form-group">
              <label htmlFor="siteName">Nom du site</label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={siteSettings.siteName}
                onChange={handleSiteSettingsChange}
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="siteDescription">Description du site</label>
              <textarea
                id="siteDescription"
                name="siteDescription"
                value={siteSettings.siteDescription}
                onChange={handleSiteSettingsChange}
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="contactEmail">Email de contact</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={siteSettings.contactEmail}
                onChange={handleSiteSettingsChange}
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="shippingFee">Frais de livraison (€)</label>
              <input
                type="number"
                id="shippingFee"
                name="shippingFee"
                value={siteSettings.shippingFee}
                onChange={handleSiteSettingsChange}
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="taxRate">Taux de TVA (%)</label>
              <input
                type="number"
                id="taxRate"
                name="taxRate"
                value={siteSettings.taxRate}
                onChange={handleSiteSettingsChange}
                min="0"
                max="100"
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="minOrderForFreeShipping">Montant minimum pour la livraison gratuite (€)</label>
              <input
                type="number"
                id="minOrderForFreeShipping"
                name="minOrderForFreeShipping"
                value={siteSettings.minOrderForFreeShipping}
                onChange={handleSiteSettingsChange}
                min="0"
                step="0.01"
              />
            </div>
            
            <button 
              className="admin-button"
              onClick={saveSiteSettings}
            >
              <Save size={18} style={{ marginRight: '8px' }} />
              Enregistrer les paramètres
            </button>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="admin-users-management">
            <h2>Gestion des utilisateurs</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Date d'inscription</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.displayName || 'Non défini'}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.role || 'customer'}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="role-select"
                        >
                          <option value="customer">Client</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </td>
                      <td>
                        {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 'N/A'}
                      </td>
                      <td>
                        <button
                          className="admin-button-small"
                          onClick={() => window.open(`/profile/${user.id}`, '_blank')}
                        >
                          Voir profil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;