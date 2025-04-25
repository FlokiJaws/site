import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { Star, StarHalf, Filter, ArrowLeft, Search, ChevronDown } from 'lucide-react';
import { getAllReviews } from '../firebase/reviews';
import './ReviewsPage.css'; // Réutiliser le style existant

const AllReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredReviews, setFilteredReviews] = useState([]);

  useEffect(() => {
    const fetchAllReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getAllReviews();
        if (result.success) {
          setReviews(result.reviews);
          setFilteredReviews(result.reviews);
        } else {
          setError(result.error || "Une erreur est survenue lors de la récupération des avis");
        }
      } catch (error) {
        console.error("Erreur:", error);
        setError("Une erreur est survenue lors de la récupération des avis");
      } finally {
        setLoading(false);
      }
    };

    fetchAllReviews();
  }, []);

  useEffect(() => {
    // Appliquer les filtres quand les reviews, filterType, sortBy ou searchTerm changent
    let result = [...reviews];

    // Filtre par type d'avis
    if (filterType !== 'all') {
      result = result.filter(review => review.reviewType === filterType);
    }

    // Filtre par terme de recherche
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(review => 
        (review.title && review.title.toLowerCase().includes(term)) || 
        (review.comment && review.comment.toLowerCase().includes(term)) ||
        (review.user?.displayName && review.user.displayName.toLowerCase().includes(term))
      );
    }

    // Tri
    if (sortBy === 'recent') {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
        return dateB - dateA;
      });
    } else if (sortBy === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      result.sort((a, b) => a.rating - b.rating);
    }

    setFilteredReviews(result);
  }, [reviews, filterType, sortBy, searchTerm]);

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

  // Obtenir le type d'avis en français
  const getReviewTypeText = (reviewType, categoryType = null) => {
    if (reviewType === 'product') return 'Produit';
    if (reviewType === 'category') {
      if (categoryType) {
        const categories = {
          'gaming': 'Gaming',
          'retro': 'Retro',
          'tcg': 'TCG',
          'goodies': 'Goodies'
        };
        return `Catégorie ${categories[categoryType] || categoryType}`;
      }
      return 'Catégorie';
    }
    if (reviewType === 'global') return 'Avis global';
    return reviewType;
  };

  // Formatage de la date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    
    const date = timestamp.seconds 
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
      
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="reviews-page">
        <Navbar />
        <div className="reviews-container">
          <div className="reviews-header">
            <button className="back-button" onClick={() => window.history.back()}>
              <ArrowLeft size={18} />
              Retour
            </button>
            <h1>Tous les avis</h1>
          </div>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            Chargement des avis...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <Navbar />
      <div className="reviews-container">
        <div className="reviews-header">
          <button className="back-button" onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
            Retour
          </button>
          <h1>Tous les avis</h1>
        </div>

        {/* Filtres et recherche */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <input
                type="text"
                placeholder="Rechercher dans les avis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.5rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
              <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.8rem 1rem',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Filter size={18} />
              Filtres
              <ChevronDown 
                size={16} 
                style={{ 
                  transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }} 
              />
            </button>
          </div>

          {showFilters && (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ minWidth: '200px', flex: 1 }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Type d'avis</h4>
                  <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => setFilterType('all')}
                      style={{ 
                        padding: '0.5rem 1rem',
                        backgroundColor: filterType === 'all' ? 'var(--primary-color)' : '#f5f5f5',
                        color: filterType === 'all' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer'
                      }}
                    >
                      Tous
                    </button>
                    <button 
                      onClick={() => setFilterType('product')}
                      style={{ 
                        padding: '0.5rem 1rem',
                        backgroundColor: filterType === 'product' ? 'var(--primary-color)' : '#f5f5f5',
                        color: filterType === 'product' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer'
                      }}
                    >
                      Produits
                    </button>
                    <button 
                      onClick={() => setFilterType('category')}
                      style={{ 
                        padding: '0.5rem 1rem',
                        backgroundColor: filterType === 'category' ? 'var(--primary-color)' : '#f5f5f5',
                        color: filterType === 'category' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer'
                      }}
                    >
                      Catégories
                    </button>
                    <button 
                      onClick={() => setFilterType('global')}
                      style={{ 
                        padding: '0.5rem 1rem',
                        backgroundColor: filterType === 'global' ? 'var(--primary-color)' : '#f5f5f5',
                        color: filterType === 'global' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer'
                      }}
                    >
                      Globaux
                    </button>
                  </div>
                </div>

                <div style={{ minWidth: '200px', flex: 1 }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Trier par</h4>
                  <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => setSortBy('recent')}
                      style={{ 
                        padding: '0.5rem 1rem',
                        backgroundColor: sortBy === 'recent' ? 'var(--primary-color)' : '#f5f5f5',
                        color: sortBy === 'recent' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer'
                      }}
                    >
                      Plus récents
                    </button>
                    <button 
                      onClick={() => setSortBy('highest')}
                      style={{ 
                        padding: '0.5rem 1rem',
                        backgroundColor: sortBy === 'highest' ? 'var(--primary-color)' : '#f5f5f5',
                        color: sortBy === 'highest' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer'
                      }}
                    >
                      Meilleures notes
                    </button>
                    <button 
                      onClick={() => setSortBy('lowest')}
                      style={{ 
                        padding: '0.5rem 1rem',
                        backgroundColor: sortBy === 'lowest' ? 'var(--primary-color)' : '#f5f5f5',
                        color: sortBy === 'lowest' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer'
                      }}
                    >
                      Notes les plus basses
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem' 
          }}>
            {error}
          </div>
        )}

        {/* Liste des avis */}
        <div className="reviews-list">
          <h2>Avis ({filteredReviews.length})</h2>
          
          {filteredReviews.length === 0 ? (
            <div className="no-reviews">
              <p>Aucun avis ne correspond à vos critères.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.user?.displayName?.charAt(0) || review.userId?.charAt(0) || '?'}
                    </div>
                    <div className="reviewer-details">
                      <div className="reviewer-name">
                        {review.user?.displayName || 'Utilisateur'}
                      </div>
                      <div className="review-date">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                <div className="review-content">
                  {review.title && <h4 className="review-title">{review.title}</h4>}
                  <p className="review-comment">{review.comment}</p>
                  <div style={{ 
                    marginTop: '1rem', 
                    display: 'inline-block',
                    padding: '0.3rem 0.8rem', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem',
                    color: '#666'
                  }}>
                    Type: {getReviewTypeText(review.reviewType, review.categoryType)}
                  </div>
                </div>
                
                <div className="review-footer">
                  {review.reviewType === 'product' && review.productId && (
                    <Link 
                      to={`/product/${review.productId}`} 
                      className="review-helpful"
                      style={{ textDecoration: 'none' }}
                    >
                      Voir le produit
                    </Link>
                  )}
                  {review.reviewType === 'category' && review.categoryType && (
                    <Link 
                      to={`/${review.categoryType}`} 
                      className="review-helpful"
                      style={{ textDecoration: 'none' }}
                    >
                      Voir la catégorie
                    </Link>
                  )}
                  {review.reviewType === 'global' && (
                    <span className="review-helpful">
                      Avis sur le site
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AllReviewsPage;