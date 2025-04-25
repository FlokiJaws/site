// src/components/GlobalReviews.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, StarHalf, ThumbsUp, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getGlobalReviews, 
  updateReview, 
  deleteReview,
  getUserGlobalReview
} from '../firebase/reviews';
import './ProductReviewsSection.css'; // Réutilisation du style existant

// Suppression de l'import de addReview et implémentation locale
const addReview = async (reviewData) => {
  try {
    // Import des fonctions nécessaires de Firebase directement
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('../firebase/config');
    
    // Vérifier les données requises
    if (!reviewData.userId) {
      return { success: false, error: "ID utilisateur requis" };
    }
    
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return { success: false, error: "La note doit être entre 1 et 5" };
    }
    
    // Préparer les données de l'avis avec un timestamp
    const reviewToAdd = {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Ajouter l'avis à la collection 'reviews'
    const reviewRef = await addDoc(collection(db, 'reviews'), reviewToAdd);
    
    return { 
      success: true, 
      reviewId: reviewRef.id 
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'avis:", error);
    return { success: false, error: error.message };
  }
};

const GlobalReviews = () => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [showAddReview, setShowAddReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Récupérer les avis globaux
        const result = await getGlobalReviews();
        
        if (result.success) {
          console.log('Avis globaux récupérés:', result.reviews); // Ajout de log pour débugger
          setReviews(result.reviews);
        } else {
          console.error('Erreur lors de la récupération des avis globaux:', result.error);
          setError('Erreur lors de la récupération des avis');
        }
        
        // Si l'utilisateur est connecté, vérifier s'il a déjà laissé un avis
        if (currentUser) {
          const userReviewResult = await getUserGlobalReview(currentUser.uid);
          
          if (userReviewResult.success && userReviewResult.review) {
            console.log('Avis global de l\'utilisateur trouvé:', userReviewResult.review); // Ajout de log pour débugger
            setUserReview(userReviewResult.review);
            setNewReview({
              rating: userReviewResult.review.rating,
              title: userReviewResult.review.title || '',
              comment: userReviewResult.review.comment || ''
            });
          } else {
            console.log('Aucun avis global pour cet utilisateur');
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur dans fetchReviews:', error);
        setError('Une erreur est survenue lors de la récupération des avis');
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [currentUser]);

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

  // Soumettre un avis
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
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
        reviewType: 'global', // Type d'avis global
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
        const userReviewResult = await getUserGlobalReview(currentUser.uid);
        if (userReviewResult.success) {
          setUserReview(userReviewResult.review);
        }
        
        setShowAddReview(false);
        setIsEditing(false);
        
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

  // Calculer la note moyenne
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  };

  const avgRating = calculateAverageRating();

  return (
    <div className="product-reviews-section" style={{ marginTop: '3rem' }}>
      <div className="reviews-section-header">
        <h2>Avis sur notre site</h2>
        <Link to="/reviews" className="view-all-reviews" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Voir tous les avis
          <ArrowRight size={16} />
        </Link>
      </div>
      
      <div className="review-summary">
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-value">{avgRating.toFixed(1)}</span>
            <div className="rating-stars">{renderStars(avgRating)}</div>
          </div>
          <div className="rating-count">
            <span>{reviews.length} avis</span>
          </div>
        </div>
        
        {currentUser && !showAddReview && (
          <button 
            className="add-review-button"
            onClick={() => {
              if (userReview) {
                // Si l'utilisateur a déjà un avis, initialiser le formulaire avec cet avis
                setNewReview({
                  rating: userReview.rating,
                  title: userReview.title || '',
                  comment: userReview.comment || ''
                });
                setIsEditing(true);
              }
              setShowAddReview(true);
            }}
          >
            {userReview ? 'Modifier votre avis' : 'Donner votre avis'}
          </button>
        )}
      </div>
      
      {/* Formulaire d'ajout ou de modification d'avis */}
      {showAddReview && (
        <div className="review-form-container">
          <h3>{isEditing ? 'Modifier votre avis' : 'Ajouter un avis'}</h3>
          
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
                  setIsEditing(false);
                  setError('');
                  
                  // Réinitialiser le formulaire si ce n'est pas une modification
                  if (!isEditing) {
                    setNewReview({
                      rating: 5,
                      title: '',
                      comment: ''
                    });
                  }
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
      {/* Liste des avis */}
      <div className="reviews-list">
        <h2>Avis des clients ({reviews.length})</h2>
        
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>Aucun avis global pour le moment</p>
            {currentUser && !showAddReview && (
              <button 
                className="add-review-button"
                onClick={() => setShowAddReview(true)}
              >
                Soyez le premier à donner votre avis
              </button>
            )}
            {!currentUser && (
              <Link to="/login" className="login-to-review">
                Connectez-vous pour laisser un avis
              </Link>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div 
              key={review.id} 
              className={`review-card ${currentUser && review.userId === currentUser.uid ? 'user-review' : ''}`}
            >
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.user?.displayName?.charAt(0) || review.userId?.charAt(0) || '?'}
                  </div>
                  <div className="reviewer-details">
                    <div className="reviewer-name">
                      {review.user?.displayName || 'Utilisateur'}
                      {currentUser && review.userId === currentUser.uid && (
                        <span className="user-badge">Vous</span>
                      )}
                    </div>
                    <div className="review-date">
                      {review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 'Date inconnue'}
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
              
              <div className="review-footer">
                <button className="review-helpful">
                  <ThumbsUp size={16} />
                  Utile
                </button>
                
                {currentUser && review.userId === currentUser.uid && (
                  <div className="review-actions">
                    <button 
                      className="edit-review"
                      onClick={() => {
                        setNewReview({
                          rating: review.rating,
                          title: review.title || '',
                          comment: review.comment || ''
                        });
                        setIsEditing(true);
                        setShowAddReview(true);
                      }}
                    >
                      Modifier
                    </button>
                    <button 
                      className="delete-review"
                      onClick={() => {
                        setUserReview(review);
                        handleDeleteReview();
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GlobalReviews;