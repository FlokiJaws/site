import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import './LoginPage.css'; // Réutiliser le style de la page de connexion

const UserSettings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // États pour les données utilisateur
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // États pour les formulaires
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setDisplayName(data.displayName || '');
          setEmail(currentUser.email || '');
          setAddress(data.address || '');
          setPhone(data.phone || '');
        }
      } catch (error) {
        setError("Erreur lors de la récupération des données utilisateur");
        console.error('Error fetching user data:', error);
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, [currentUser, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Mettre à jour le profil dans l'authentification Firebase
      await updateProfile(currentUser, {
        displayName: displayName
      });
      
      // Mettre à jour les données dans Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        address,
        phone,
        updatedAt: new Date()
      });
      
      setSuccess('Profil mis à jour avec succès');
    } catch (error) {
      setError('Erreur lors de la mise à jour du profil');
      console.error(error);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      // Réauthentifier l'utilisateur avant de modifier le mot de passe
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      
      // Mettre à jour le mot de passe
      await updatePassword(currentUser, newPassword);
      
      // Réinitialiser les champs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setSuccess('Mot de passe mis à jour avec succès');
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setError('Le mot de passe actuel est incorrect');
      } else {
        setError('Erreur lors de la mise à jour du mot de passe');
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
      <div className="login-page">
        <Navbar />
        <div className="login-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Chargement des paramètres...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <Navbar />
      <div className="login-container" style={{ maxWidth: '600px' }}>
        <div className="login-header">
          <h1>Paramètres du compte</h1>
          <p>Modifiez vos informations personnelles</p>
        </div>
        
        {success && (
          <div style={{ 
            color: 'green', 
            backgroundColor: 'rgba(0, 128, 0, 0.1)', 
            padding: '0.8rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}
        
        {error && (
          <div style={{ 
            color: 'red', 
            backgroundColor: 'rgba(255, 0, 0, 0.1)', 
            padding: '0.8rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        {/* Informations du profil */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
            Informations personnelles
          </h2>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label htmlFor="displayName">Nom complet</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Votre nom complet"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email (non modifiable)</label>
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className="disabled-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Adresse</label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Votre adresse"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Téléphone</label>
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Votre numéro de téléphone"
              />
            </div>
            
            <button type="submit" className="login-button">
              Mettre à jour le profil
            </button>
          </form>
        </div>
        
        {/* Modification du mot de passe */}
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
            Modifier le mot de passe
          </h2>
          
          <form onSubmit={handleUpdatePassword}>
            <div className="form-group">
              <label htmlFor="currentPassword">Mot de passe actuel</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Entrez votre mot de passe actuel"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">Nouveau mot de passe</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Entrez votre nouveau mot de passe"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
                required
              />
            </div>
            
            <button type="submit" className="login-button">
              Mettre à jour le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;