// src/components/ProductReviewsSection.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, StarHalf, ArrowRight } from 'lucide-react';
import './ProductReviewsSection.css';

const ProductReviewsSection = ({ product }) => {
  // Fonction pour afficher les étoiles
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} fill="#FFD700" color="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" fill="#FFD700" color="#FFD700" />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} color="#FFD700" />);
    }
    
    return stars;
  };

  return (
    <div className="product-reviews-section">
      <div className="reviews-section-header">
        <h2>Avis clients</h2>
        <Link to={`/reviews/${product.id}`} className="view-all-reviews">
          Voir tous les avis <ArrowRight size={16} />
        </Link>
      </div>
      
      <div className="review-summary">
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-value">{product.ratingAvg ? product.ratingAvg.toFixed(1) : '0'}</span>
            <div className="rating-stars">{renderStars(product.ratingAvg || 0)}</div>
          </div>
          <div className="rating-count">
            <span>{product.ratingCount || 0} avis</span>
          </div>
        </div>
        
        <Link to={`/reviews/${product.id}#write-review`} className="write-review-button">
          Donnez votre avis
        </Link>
      </div>
      
      {product.ratingCount > 0 ? (
        <div className="recent-reviews">
          <h3>Avis récents</h3>
          <div className="reviews-preview">
            {/* Cette section afficherait normalement les avis récents, 
                mais elle sera remplie dynamiquement par les données réelles */}
            <div className="review-preview-placeholder">
              <p>Consultez tous les avis clients pour ce produit</p>
              <Link to={`/reviews/${product.id}`} className="view-more-button">
                Voir les avis
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-reviews-yet">
          <p>Ce produit n'a pas encore d'avis. Soyez le premier à donner votre opinion !</p>
          <Link to={`/reviews/${product.id}#write-review`} className="be-first-button">
            Laisser un avis
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductReviewsSection;