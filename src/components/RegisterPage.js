import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { Eye, EyeOff, Facebook, Github } from 'lucide-react';
import { registerUser } from '../firebase/auth';
import './LoginPage.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await registerUser(name, email, password);
      
      if (result.success) {
        // Redirection après inscription réussie
        navigate('/');
      } else {
        setError(result.error || "Erreur lors de l'inscription");
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de l'inscription");
      console.error(error);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-page">
      <Navbar />
      <div className="login-container">
        <div className="login-header">
          <h1>Créer un compte</h1>
          <p>Rejoignez la communauté GameCash</p>
        </div>
        
        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez votre nom"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input
              type="email"
              id="register-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre email"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="register-password">Mot de passe</label>
            <div className="password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="register-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Créez votre mot de passe"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirmer le mot de passe</label>
            <div className="password-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre mot de passe"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="remember-me">
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
              required
              disabled={loading}
            />
            <label htmlFor="agree-terms">
              J'accepte les <Link to="/terms" className="signup-link">conditions d'utilisation</Link> et la <Link to="/privacy" className="signup-link">politique de confidentialité</Link>
            </label>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>
        <div className="login-divider">
          <span>ou inscrivez-vous avec</span>
        </div>
        <div className="social-login">
          <button type="button" className="social-button" disabled={loading}>
            <Facebook size={20} color="#4267B2" />
            Facebook
          </button>
          <button type="button" className="social-button" disabled={loading}>
            <Github size={20} />
            Github
          </button>
        </div>
        <div className="signup-prompt">
          Vous avez déjà un compte?{' '}
          <Link to="/login" className="signup-link">
            Connectez-vous
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;