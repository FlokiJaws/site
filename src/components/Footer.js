import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Facebook, Twitter, Instagram, GitHub } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" style={{ 
      backgroundColor: '#1a1a1a', 
      color: 'white',
      padding: '3rem 0 2rem',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        <div className="footer-top" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div className="footer-column">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>GamerClash</h3>
            <p style={{ lineHeight: '1.6', color: '#aaa', marginBottom: '1.5rem' }}>
              Votre destination pour tous les produits gaming, rétro, cartes et goodies.
              Nous proposons une large sélection de produits de qualité pour tous les passionnés.
            </p>
            <div className="footer-social" style={{ display: 'flex', gap: '1rem' }}>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '36px', 
                height: '36px', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transition: 'all 0.3s ease'
              }}>
                <Facebook size={18} color="white" />
              </a>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '36px', 
                height: '36px', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transition: 'all 0.3s ease'
              }}>
                <Twitter size={18} color="white" />
              </a>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '36px', 
                height: '36px', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transition: 'all 0.3s ease'
              }}>
                <Instagram size={18} color="white" />
              </a>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '36px', 
                height: '36px', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transition: 'all 0.3s ease'
              }}>
                <GitHub size={18} color="white" />
              </a>
            </div>
          </div>
          
          <div className="footer-column">
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', color: 'white' }}>Catégories</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.8rem' }}>
                <Link to="/gaming" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                  Gaming
                </Link>
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <Link to="/retro" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                  Retro
                </Link>
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <Link to="/tcg" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                  TCG
                </Link>
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <Link to="/goodies" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                  Goodies
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', color: 'white' }}>Mon compte</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.8rem' }}>
                <Link to="/profile" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                  Mon profil
                </Link>
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <Link to="/orders" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                  Mes commandes
                </Link>
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <Link to="/cart" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                  Mon panier
                </Link>
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <Link to="/reviews" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                  Voir les avis
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', color: 'white' }}>Informations</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.8rem' }}>
                <Link to="/about" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                  À propos
                </Link>
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <Link to="/contact" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                  Contact
                </Link>
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <Link to="/terms" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                  CGV
                </Link>
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <Link to="/privacy" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}>
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom" style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div className="footer-made-with">
            Réalisé avec <span className="footer-heart"><Heart size={14} color="red" fill="red" /></span> par GamerClash
          </div>
          
          <div className="footer-legal" style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" className="footer-legal-link">Politique de confidentialité</a>
            <a href="#" className="footer-legal-link">Termes et conditions</a>
            <a href="#" className="footer-legal-link">Mentions légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;