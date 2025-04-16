// src/components/ReviewsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, StarHalf, Filter, AlertTriangle, ThumbsUp, MessageSquare } from 'lucide-react';
import { getProductReviews, getUserProductReview, addReview, updateReview, deleteReview } from '../firebase/reviews';
import { getProductById } from '../firebase/products';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import './ReviewsPage.css';

const ReviewsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showAddReview, setShowAddReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Récupérer les informations du produit
        const productResult = await getProductById(productId);
        
        if (!productResult.success) {
          setError('Produit non trouvé');
          setLoading(false);
          return;
        }
        
        setProduct(productResult.product);
        
        // Récupérer les avis du produit
        await fetchReviews();
        
        // Si l'utilisateur est connecté, vérifier s'il a déjà laissé un avis
        if (currentUser) {
          const userReviewResult = await getUserProductReview(currentUser.uid, productId);
          
          if (userReviewResult.success && userReviewResult.review) {
            setUserReview(userReviewResult.review);
            setNewReview({
              rating: userReviewResult.review.rating,
              title: userReviewResult.review.title || '',
              comment: userReviewResult.review.comment || ''
            });
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Une erreur est survenue lors du chargement des données');
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [productId, currentUser]);

  // Fonction pour récupérer les avis
  const fetchReviews = async () => {
    try {
      const reviewsResult = await getProductReviews(productId, sortBy);
      
      if (reviewsResult.success) {
        setReviews(reviewsResult.reviews);
      } else {
        console.error('Erreur lors de la récupération des avis:', reviewsResult.error);
        setError('Erreur lors de la récupération des avis');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur est survenue lors du chargement des avis');
    }
  };

  // Gérer le changement du tri
  const handleSortChange = async (newSortBy) => {
    setSortBy(newSortBy);
    
    try {
      const reviewsResult = await getProductReviews(productId, newSortBy);
      
      if (reviewsResult.success) {
        setReviews(reviewsResult.reviews);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Gérer la soumission d'un nouvel avis
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login');
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
        productId,
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
        // Mettre à jour la liste des avis
        await fetchReviews();
        
        // Mettre à jour l'avis de l'utilisateur
        const userReviewResult = await getUserProductReview(currentUser.uid, productId);
        
        if (userReviewResult.success && userReviewResult.review) {
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
        setError(result.error || 'Erreur lors de la soumission de l\'avis');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur est survenue');
    }
    
    setReviewLoading(false);
  };

  // Gérer la suppression d'un avis
  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre avis ?')) {
      return;
    }
    
    setReviewLoading(true);
    
    try {
      const result = await deleteReview(userReview.id);
      
      if (result.success) {
        // Mettre à jour la liste des avis
        await fetchReviews();
        
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

  // Afficher le chargement
  if (loading) {
    return (
      <div className="reviews-page">
        <Navbar />
        <div className="reviews-container">
          <div className="loading">Chargement des avis...</div>
        </div>
      </div>
    );
  }

  // Afficher une erreur
  if (error && !product) {
    return (
      <div className="reviews-page">
        <Navbar />
        <div className="reviews-container">
          <div className="error-message">
            <AlertTriangle size={48} />
            <p>{error}</p>
            <button 
              className="back-button"
              onClick={() => navigate(-1)}
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <Navbar />
      <div className="reviews-container">
        {/* En-tête de la page */}
        <div className="reviews-header">
          <button 
            className="back-button"
            onClick={() => navigate(`/product/${productId}`)}
          >
            Retour au produit
          </button>
          <h1>Avis sur {product?.name}</h1>
        </div>
        
        {/* Résumé des avis */}
        <div className="reviews-summary">
          <div className="product-preview">
            <img 
              src={product?.imageUrls?.[0] || "/api/placeholder/100/100"} 
              alt={product?.name} 
            />
            <div className="product-info">
              <h2>{product?.name}</h2>
              <div className="product-rating">
                <div className="stars">
                  {renderStars(product?.ratingAvg || 0)}
                </div>
                <span className="rating-text">
                  {product?.ratingAvg ? product.ratingAvg.toFixed(1) : '0'} sur 5 ({product?.ratingCount || 0} avis)
                </span>
              </div>
            </div>
          </div>
          
          <div className="rating-distribution">
            <h3>Répartition des notes</h3>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter(review => Math.round(review.rating) === star).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
              return (
                <div key={star} className="rating-bar">
                  <div className="rating-label">
                    <Star size={16} fill="#FFD700" color="#FFD700" /> {star}
                  </div>
                  <div className="rating-progress">
                    <div 
                      className="rating-progress-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="rating-count">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Contrôles des avis */}
        <div className="reviews-controls">
          <div className="reviews-filter">
            <Filter size={18} />
            <select 
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="recent">Plus récents</option>
              <option value="highest">Meilleures notes</option>
              <option value="lowest">Notes les plus basses</option>
            </select>
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
              {userReview ? 'Modifier votre avis' : 'Ajouter un avis'}
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
                  placeholder="Partagez votre expérience avec ce produit..."
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
              <MessageSquare size={48} />
              <p>Aucun avis pour ce produit</p>
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
    </div>
  );
};

export default ReviewsPage;