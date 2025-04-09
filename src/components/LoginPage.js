import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { Eye, EyeOff, Facebook, Github } from 'lucide-react';
import { loginUser } from '../firebase/auth';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        // Redirection après connexion réussie
        navigate('/');
      } else {
        setError(result.error || "Erreur lors de la connexion");
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de la connexion");
      console.error(error);
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <Navbar />
      <div className="login-container">
        <div className="login-header">
          <h1>Connexion</h1>
          <p>Connectez-vous pour accéder à votre compte</p>
        </div>
        
        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre email"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="remember-forgot">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                disabled={loading}
              />
              <label htmlFor="remember">Se souvenir de moi</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Mot de passe oublié?
            </Link>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        <div className="login-divider">
          <span>ou continuez avec</span>
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
          Vous n'avez pas de compte?{' '}
          <Link to="/register" className="signup-link">
            Inscrivez-vous
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;