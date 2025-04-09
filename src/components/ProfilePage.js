import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import './LoginPage.css'; // Réutiliser le style de la page de connexion

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="login-page">
        <Navbar />
        <div className="login-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Chargement de votre profil...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <Navbar />
      <div className="login-container">
        <div className="login-header">
          <h1>Mon Profil</h1>
          <p>Informations personnelles</p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{ 
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}>
              {userData?.displayName?.charAt(0) || currentUser.email?.charAt(0) || '?'}
            </div>
          </div>
          
          <div style={{ 
            marginBottom: '1rem',
            padding: '0.7rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.03)'
          }}>
            <p style={{ margin: '0 0 0.3rem', fontSize: '0.9rem', color: '#666' }}>Nom</p>
            <p style={{ margin: '0', fontWeight: '500' }}>{userData?.displayName || 'Non défini'}</p>
          </div>
          
          <div style={{ 
            marginBottom: '1rem',
            padding: '0.7rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.03)'
          }}>
            <p style={{ margin: '0 0 0.3rem', fontSize: '0.9rem', color: '#666' }}>Email</p>
            <p style={{ margin: '0', fontWeight: '500' }}>{userData?.email || currentUser.email}</p>
          </div>
          
          <div style={{ 
            marginBottom: '1rem',
            padding: '0.7rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.03)'
          }}>
            <p style={{ margin: '0 0 0.3rem', fontSize: '0.9rem', color: '#666' }}>Type de compte</p>
            <p style={{ margin: '0', fontWeight: '500' }}>
              {userData?.role === 'admin' ? 'Administrateur' : 'Client'}
            </p>
          </div>
          
          <div style={{ 
            marginBottom: '1rem',
            padding: '0.7rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.03)'
          }}>
            <p style={{ margin: '0 0 0.3rem', fontSize: '0.9rem', color: '#666' }}>Date d'inscription</p>
            <p style={{ margin: '0', fontWeight: '500' }}>
              {userData?.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 'Inconnue'}
            </p>
          </div>
        </div>
        
        <button 
          className="login-button"
          onClick={() => navigate('/update-profile')}
          style={{ marginBottom: '1rem' }}
        >
          Modifier mes informations
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;