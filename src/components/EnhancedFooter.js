import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Package, Store, CreditCard, Percent } from 'lucide-react';

const EnhancedFooter = () => {
  return (
    <div className="enhanced-footer">
      {/* Section des avantages avec icônes */}
      <div className="advantages-section">
        <div className="advantages-container">
          <div className="advantage-item">
            <div className="advantage-icon">
              <Shield size={40} />
            </div>
            <div className="advantage-text">Garantie 24 mois</div>
          </div>
          
          <div className="advantage-item">
            <div className="advantage-icon">
              <CreditCard size={40} />
            </div>
            <div className="advantage-text">Paiement sécurisé</div>
          </div>
          
          <div className="advantage-item">
            <div className="advantage-icon">
              <Package size={40} />
            </div>
            <div className="advantage-text">Livraison rapide</div>
          </div>
          
          <div className="advantage-item">
            <div className="advantage-icon">
              <Store size={40} />
            </div>
            <div className="advantage-text">Nos magasins</div>
          </div>
          
          <div className="advantage-item">
            <div className="advantage-icon">
              <Percent size={40} />
            </div>
            <div className="advantage-text">Promotions</div>
          </div>
        </div>
      </div>

      {/* Section informations complémentaires */}
      <div className="footer-extended-info">
        <div className="footer-info-section">
          <h3>Les plateformes</h3>
          <div className="footer-columns">
            <div className="footer-column">
              <Link to="/gaming/playstation-5">PS5</Link>
              <Link to="/gaming/playstation-4">PS4</Link>
              <Link to="/gaming/playstation-3">PS3</Link>
              <Link to="/gaming/psp">PSP</Link>
              <Link to="/gaming/playstation-vita">PS VITA</Link>
              <Link to="/gaming/xbox-series-x">XBOX X</Link>
              <Link to="/gaming/xbox-one">XBOX ONE</Link>
              <Link to="/gaming/xbox-360">XBOX 360</Link>
              <Link to="/gaming/switch">SWITCH</Link>
            </div>
            <div className="footer-column">
              <Link to="/gaming/wii-u">WII U</Link>
              <Link to="/gaming/wii">WII</Link>
              <Link to="/gaming/3ds">3DS</Link>
              <Link to="/gaming/ds">DS</Link>
              <Link to="/retro">RETRO GAMING</Link>
              <Link to="/goodies">CULTURE GEEK</Link>
              <Link to="/goodies">DVD/BLU-RAY</Link>
              <Link to="/gaming">PC</Link>
            </div>
          </div>
        </div>

        <div className="footer-info-section">
          <h3>À propos</h3>
          <Link to="/about">Qui sommes-nous ?</Link>
          <Link to="/help">Besoin d'aide ?</Link>
          <Link to="/franchise">La Franchise</Link>
          <Link to="/cgv">CGV</Link>
          <Link to="/stores">Nos magasins</Link>
        </div>

        <div className="footer-info-section">
          <h3>Restons en contact !</h3>
          <div className="contact-info">
            <p>Vous avez une question ?</p>
            <p>Cliquez ici !</p>
            <Link to="/contact" className="contact-button">
              Contactez Nous !
            </Link>
          </div>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <div className="social-icon">f</div>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <div className="social-icon">t</div>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <div className="social-icon">i</div>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <div className="social-icon">in</div>
            </a>
          </div>
        </div>

        <div className="footer-info-section">
          <h3>Paiement sécurisé</h3>
          <div className="payment-methods">
            <div className="payment-icon">Visa</div>
            <div className="payment-icon">MasterCard</div>
            <div className="payment-icon">American Express</div>
          </div>
          <div className="reviews-box">
            <div className="reviews-header">Avis Vérifiés</div>
            <div className="reviews-content">
              <div>AVIS DE NOS CLIENTS</div>
              <div className="rating">★★★★☆ 4.5/5</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFooter;