import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Star, StarHalf, ArrowLeft, Search, Plus, AlertTriangle } from 'lucide-react';
import { getGlobalReviews, getUserGlobalReview, addReview, updateReview, deleteReview } from '../firebase/reviews';
import './AllReviewsPage.css';

const AllReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReviews, setFilteredReviews] = useState([]);
  
  // États pour le formulaire d'avis
  const [showAddReview, setShowAddReview] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [reviewLoading, setReviewLoading] = useState(false);

  // Import useAuth pour vérifier si l'utilisateur est connecté
  const { currentUser } = React.useContext(
    window.AuthContext || { currentUser: null }
  );

  useEffect(() => {
    const fetchAllReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getGlobalReviews();
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

  // Vérifier si l'utilisateur a déjà un avis global
  useEffect(() => {
    const checkUserReview = async () => {
      if (!currentUser) return;
      
      // Vérifier l'avis global
      const userReviewResult = await getUserGlobalReview(currentUser.uid);
      if (userReviewResult.success && userReviewResult.review) {
        setUserReview(userReviewResult.review);
        setNewReview({
          rating: userReviewResult.review.rating,
          title: userReviewResult.review.title || '',
          comment: userReviewResult.review.comment || ''
        });
        setIsEditing(true);
      }
    };
    
    checkUserReview();
  }, [currentUser]);

  useEffect(() => {
    // Appliquer les filtres quand les reviews, sortBy ou searchTerm changent
    let result = [...reviews];

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
  }, [reviews, sortBy, searchTerm]);

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

  // Rendre les étoiles interactives pour la notation
  const renderRatingInput = () => {
    return (
      <div className="rating-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={30}
            onClick={() => setNewReview({ ...newReview, rating: star })}
            color="#FFD700"
            fill={newReview.rating >= star ? "#FFD700" : "none"}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    );
  };

  // Préparation du formulaire d'ajout/modification d'avis
  const handleAddReviewClick = async () => {
    if (!currentUser) {
      alert("Veuillez vous connecter pour ajouter un avis");
      return;
    }
    
    // Afficher le formulaire
    setShowAddReview(true);
  };

  // Soumettre un avis
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("Veuillez vous connecter pour ajouter un avis");
      return;
    }
    
    if (newReview.rating < 1 || newReview.rating > 5) {
      setError('La note doit être entre 1 et 5');
      return;
    }
    
    setReviewLoading(true);
    
    try {
      const reviewData = {
        userId: currentUser.uid,
        reviewType: 'global',
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment
      };
      
      let result;
      
      if (isEditing && userReview) {
        // Mise à jour d'un avis existant
        result = await updateReview(userReview.id, reviewData);
      } else {
        // Création d'un nouvel avis
        result = await addReview(reviewData);
      }
      
      if (result.success) {
        // Rafraîchir la liste des avis
        const updatedReviews = await getGlobalReviews();
        if (updatedReviews.success) {
          setReviews(updatedReviews.reviews);
        }
        
        // Mettre à jour l'avis de l'utilisateur
        if (!userReview) {
          const userReviewResult = await getUserGlobalReview(currentUser.uid);
          if (userReviewResult.success && userReviewResult.review) {
            setUserReview(userReviewResult.review);
          }
        }
        
        setShowAddReview(false);
        
        // Réinitialiser le formulaire
        setNewReview({
          rating: 5,
          title: '',
          comment: ''
        });
      } else {
        setError(result.error || "Erreur lors de la soumission de l'avis");
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur est survenue');
    }
    
    setReviewLoading(false);
  };

  // Supprimer un avis
  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre avis ?')) {
      return;
    }
    
    setReviewLoading(true);
    
    try {
      const result = await deleteReview(userReview.id);
      
      if (result.success) {
        // Rafraîchir la liste des avis
        const updatedReviews = await getGlobalReviews();
        if (updatedReviews.success) {
          setReviews(updatedReviews.reviews);
        }
        
        setUserReview(null);
        setIsEditing(false);
        setShowAddReview(false);
        
        // Réinitialiser le formulaire
        setNewReview({
          rating: 5,
          title: '',
          comment: ''
        });
      } else {
        setError(result.error || 'Erreur lors de la suppression de l\'avis');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur est survenue');
    }
    
    setReviewLoading(false);
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
      <div className="all-reviews-page">
        <Navbar />
        <div className="all-reviews-container">
          <div className="all-reviews-header">
            <button className="back-button" onClick={() => window.history.back()}>
              <ArrowLeft size={18} />
              Retour
            </button>
            <h1>Avis des clients</h1>
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des avis...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="all-reviews-page">
      <Navbar />
      <div className="all-reviews-container">
        <div className="all-reviews-header">
          <button className="back-button" onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
            Retour
          </button>
          <h1>Avis des clients</h1>
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
            <div className="all-reviews-filters">
              <button 
                onClick={() => setSortBy('recent')}
                className={`filter-button ${sortBy === 'recent' ? 'active' : ''}`}
              >
                Les plus récents
              </button>
              <button 
                onClick={() => setSortBy('highest')}
                className={`filter-button ${sortBy === 'highest' ? 'active' : ''}`}
              >
                Meilleures notes
              </button>
              <button 
                onClick={() => setSortBy('lowest')}
                className={`filter-button ${sortBy === 'lowest' ? 'active' : ''}`}
              >
                Notes basses
              </button>
            </div>
            <button
              onClick={handleAddReviewClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              disabled={userReview && !showAddReview}
            >
              <Plus size={18} />
              {userReview && !showAddReview ? "Vous avez déjà donné votre avis" : "Donner votre avis"}
            </button>
          </div>
        </div>

        {/* Formulaire d'ajout ou de modification d'avis */}
        {showAddReview && (
          <div className="review-form-container">
            <h3>{isEditing ? 'Modifier votre avis' : 'Ajouter votre avis'}</h3>
            
            {error && <div className="error-alert">{error}</div>}
            
            <form className="review-form" onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Votre note</label>
                {renderRatingInput()}
              </div>
              
              <div className="form-group">
                <label htmlFor="title">Titre de l'avis</label>
                <input
                  type="text"
                  id="title"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  placeholder="Résumez votre expérience en quelques mots"
                  maxLength={100}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="comment">Détails de l'avis</label>
                <textarea
                  id="comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Partagez votre expérience avec notre site..."
                  rows={5}
                  maxLength={1000}
                  required
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowAddReview(false);
                    setError('');
                  }}
                >
                  Annuler
                </button>
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={reviewLoading}
                >
                  {reviewLoading 
                    ? 'Envoi en cours...' 
                    : (isEditing ? 'Mettre à jour' : 'Publier l\'avis')
                  }
                </button>
                
                {isEditing && (
                  <button 
                    type="button" 
                    className="delete-button"
                    onClick={handleDeleteReview}
                    disabled={reviewLoading}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Affichage des erreurs */}
        {error && !showAddReview && (
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
        <div className="all-reviews-list">
          <h2>Avis ({filteredReviews.length})</h2>
          
          {filteredReviews.length === 0 ? (
            <div className="no-reviews-message">
              <h2>Aucun avis pour le moment</h2>
              <p>Soyez le premier à donner votre avis sur notre site !</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className={`review-card ${currentUser && review.userId === currentUser.uid ? 'user-review' : ''}`}>
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.user?.displayName?.charAt(0) || review.userId?.charAt(0) || '?'}
                    </div>
                    <div className="reviewer-details">
                      <div className="reviewer-name">
                        {review.user?.displayName || 'Utilisateur'}
                        {currentUser && review.userId === currentUser.uid && (
                          <span style={{ 
                            marginLeft: '8px',
                            fontSize: '0.8rem',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '10px'
                          }}>
                            Vous
                          </span>
                        )}
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
                </div>
                
                {currentUser && review.userId === currentUser.uid && !showAddReview && (
                  <div className="review-footer">
                    <button 
                      onClick={() => {
                        setNewReview({
                          rating: review.rating,
                          title: review.title || '',
                          comment: review.comment || ''
                        });
                        setShowAddReview(true);
                      }}
                      className="edit-review"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => {
                        setUserReview(review);
                        handleDeleteReview();
                      }}
                      className="delete-review"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllReviewsPage;