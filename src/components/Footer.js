import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Facebook, Twitter, Instagram, Github, Shield, Package, Store, CreditCard, Percent } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" style={{ backgroundColor: '#1a1a1a', color: 'white', padding: '0 0 2rem', marginTop: 'auto' }}>
      {/* Section des avantages avec icônes */}
      <div style={{ backgroundColor: '#222', padding: '2rem 0', width: '100%' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '0 2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1', minWidth: '150px' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#4caf50', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'white' }}>
              <Shield size={40} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '500', color: 'white' }}>Garantie 24 mois</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1', minWidth: '150px' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#4caf50', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'white' }}>
              <CreditCard size={40} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '500', color: 'white' }}>Paiement sécurisé</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1', minWidth: '150px' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#4caf50', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'white' }}>
              <Package size={40} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '500', color: 'white' }}>Livraison rapide</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1', minWidth: '150px' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#4caf50', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'white' }}>
              <Store size={40} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '500', color: 'white' }}>Nos magasins</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1', minWidth: '150px' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#4caf50', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'white' }}>
              <Percent size={40} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '500', color: 'white' }}>Promotions</div>
          </div>
        </div>
      </div>

      {/* Section informations complémentaires */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto', padding: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ flex: '1', minWidth: '250px', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white', fontWeight: '600' }}>Les plateformes</h3>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: '1' }}>
              <Link to="/gaming/playstation-5" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>PS5</Link>
              <Link to="/gaming/playstation-4" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>PS4</Link>
              <Link to="/gaming/playstation-3" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>PS3</Link>
              <Link to="/gaming/psp" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>PSP</Link>
              <Link to="/gaming/playstation-vita" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>PS VITA</Link>
              <Link to="/gaming/xbox-series-x" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>XBOX X</Link>
              <Link to="/gaming/xbox-one" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>XBOX ONE</Link>
              <Link to="/gaming/xbox-360" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>XBOX 360</Link>
              <Link to="/gaming/switch" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>SWITCH</Link>
            </div>
            <div style={{ flex: '1' }}>
              <Link to="/gaming/wii-u" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>WII U</Link>
              <Link to="/gaming/wii" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>WII</Link>
              <Link to="/gaming/3ds" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>3DS</Link>
              <Link to="/gaming/ds" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>DS</Link>
              <Link to="/retro" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>RETRO GAMING</Link>
              <Link to="/goodies" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>CULTURE GEEK</Link>
              <Link to="/goodies" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>DVD/BLU-RAY</Link>
              <Link to="/gaming" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>PC</Link>
            </div>
          </div>
        </div>

        <div style={{ flex: '1', minWidth: '250px', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white', fontWeight: '600' }}>À propos</h3>
          <Link to="/about" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>Qui sommes-nous ?</Link>
          <Link to="/help" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>Besoin d'aide ?</Link>
          <Link to="/franchise" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>La Franchise</Link>
          <Link to="/cgv" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>CGV</Link>
          <Link to="/stores" style={{ display: 'block', color: '#aaa', marginBottom: '0.8rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>Nos magasins</Link>
        </div>

        <div style={{ flex: '1', minWidth: '250px', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white', fontWeight: '600' }}>Restons en contact !</h3>
          <div>
            <p style={{ color: '#aaa', marginBottom: '0.5rem' }}>Vous avez une question ?</p>
            <p style={{ color: '#aaa', marginBottom: '0.5rem' }}>Cliquez ici !</p>
            <Link to="/contact" style={{ display: 'inline-block', backgroundColor: '#4caf50', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '4px', fontWeight: '500', marginTop: '1rem', transition: 'background-color 0.2s ease', textDecoration: 'none' }}>
              Contactez Nous !
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#666', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s ease', color: 'white' }}>
                <Facebook size={20} />
              </div>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#666', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s ease', color: 'white' }}>
                <Twitter size={20} />
              </div>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#666', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s ease', color: 'white' }}>
                <Instagram size={20} />
              </div>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#666', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s ease', color: 'white' }}>
                <Github size={20} />
              </div>
            </a>
          </div>
        </div>

        <div style={{ flex: '1', minWidth: '250px', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white', fontWeight: '600' }}>Paiement sécurisé</h3>
          <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: 'white', color: '#333', padding: '0.8rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '600' }}>
              <img src="/api/placeholder/70/30" alt="Visa" style={{ height: '30px' }} />
            </div>
            <div style={{ backgroundColor: 'white', color: '#333', padding: '0.8rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '600' }}>
              <img src="/api/placeholder/70/30" alt="MasterCard" style={{ height: '30px' }} />
            </div>
            <div style={{ backgroundColor: 'white', color: '#333', padding: '0.8rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '600' }}>
              <img src="/api/placeholder/70/30" alt="American Express" style={{ height: '30px' }} />
            </div>
          </div>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'white', width: 'fit-content' }}>
            <div style={{ backgroundColor: '#ff9800', color: 'white', padding: '0.5rem 1rem', textAlign: 'center', fontWeight: '600' }}>
              Avis Vérifiés
            </div>
            <div style={{ color: '#333', padding: '0.8rem' }}>
              <div>AVIS DE NOS CLIENTS</div>
              <div style={{ color: '#ff9800', fontSize: '1.2rem', fontWeight: '700' }}>★★★★☆ 4.5/5</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer existant */}
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
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