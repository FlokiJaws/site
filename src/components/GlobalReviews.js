import React, { useState, useEffect } from 'react';
import { Star, StarHalf, Edit, Trash, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getGlobalReviews, getUserGlobalReview, updateReview, deleteReview } from '../firebase/reviews';

// Fonction simplifiée pour ajouter un avis
const addReview = async (reviewData) => {
  try {
    // Import des fonctions nécessaires de Firebase
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('../firebase/config');
    
    if (!reviewData.userId) {
      return { success: false, error: "ID utilisateur requis" };
    }
    
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return { success: false, error: "La note doit être entre 1 et 5" };
    }
    
    const reviewToAdd = {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      reviewType: 'global'
    };
    
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

const GlobalReviewsManager = () => {
  const { currentUser } = useAuth();
  const [userReview, setUserReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [allReviews, setAllReviews] = useState([]);

  // Récupérer l'avis de l'utilisateur et tous les avis globaux
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Charger tous les avis globaux
        const result = await getGlobalReviews();
        if (result.success) {
          setAllReviews(result.reviews);
        }

        // Si l'utilisateur est connecté, récupérer son avis
        if (currentUser) {
          const userReviewResult = await getUserGlobalReview(currentUser.uid);
          if (userReviewResult.success && userReviewResult.review) {
            setUserReview(userReviewResult.review);
            setFormData({
              rating: userReviewResult.review.rating,
              title: userReviewResult.review.title || '',
              comment: userReviewResult.review.comment || ''
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des avis:", error);
        setMessage({
          text: "Erreur lors du chargement des avis",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setMessage({
        text: "Vous devez être connecté pour laisser un avis",
        type: "error"
      });
      return;
    }
    
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      const reviewData = {
        userId: currentUser.uid,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment
      };
      
      let result;
      
      if (userReview) {
        // Mise à jour de l'avis existant
        result = await updateReview(userReview.id, reviewData);
      } else {
        // Création d'un nouvel avis
        result = await addReview(reviewData);
      }
      
      if (result.success) {
        // Rafraîchir les données
        const updatedReviews = await getGlobalReviews();
        if (updatedReviews.success) {
          setAllReviews(updatedReviews.reviews);
        }
        
        // Si c'était une création, récupérer le nouvel avis de l'utilisateur
        if (!userReview) {
          const userReviewResult = await getUserGlobalReview(currentUser.uid);
          if (userReviewResult.success && userReviewResult.review) {
            setUserReview(userReviewResult.review);
          }
        }
        
        setMessage({
          text: userReview ? "Votre avis a été mis à jour avec succès" : "Votre avis a été ajouté avec succès",
          type: "success"
        });
        
        setIsEditing(false);
      } else {
        setMessage({
          text: result.error || "Une erreur est survenue",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({
        text: "Une erreur est survenue lors de la sauvegarde",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour supprimer un avis
  const handleDelete = async () => {
    if (!userReview) return;
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre avis ?')) {
      return;
    }
    
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      const result = await deleteReview(userReview.id);
      
      if (result.success) {
        // Rafraîchir les données
        const updatedReviews = await getGlobalReviews();
        if (updatedReviews.success) {
          setAllReviews(updatedReviews.reviews);
        }
        
        setUserReview(null);
        setFormData({
          rating: 5,
          title: '',
          comment: ''
        });
        
        setMessage({
          text: "Votre avis a été supprimé avec succès",
          type: "success"
        });
      } else {
        setMessage({
          text: result.error || "Une erreur est survenue lors de la suppression",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({
        text: "Une erreur est survenue lors de la suppression",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour afficher les étoiles de notation
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={20} fill="#FFD700" color="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" size={20} fill="#FFD700" color="#FFD700" />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={20} color="#FFD700" />);
    }
    
    return stars;
  };

  // Fonction pour le sélecteur d'étoiles interactif
  const RatingSelector = () => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={30}
            onClick={() => setFormData({ ...formData, rating: star })}
            color="#FFD700"
            fill={formData.rating >= star ? "#FFD700" : "none"}
            className="cursor-pointer"
          />
        ))}
      </div>
    );
  };

  // Fonction pour formater la date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    
    const date = timestamp.seconds 
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
      
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-8">
          <div className="inline-block h-12 w-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement des avis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestionnaire d'Avis Globaux</h2>
        
        {/* Message de statut */}
        {message.text && (
          <div className={`p-4 mb-4 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        {/* Avis de l'utilisateur ou formulaire de création/édition */}
        {!isEditing && userReview ? (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">Votre avis</h3>
                <div className="flex my-2">{renderStars(userReview.rating)}</div>
                <h4 className="font-medium text-gray-800">{userReview.title}</h4>
                <p className="text-gray-600 mt-2">{userReview.comment}</p>
                <p className="text-sm text-gray-500 mt-3">Publié le {formatDate(userReview.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="p-2 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={handleDelete} 
                  className="p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                {userReview ? "Modifier votre avis" : "Ajouter un avis global"}
              </h3>
              {isEditing && (
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="p-2 text-gray-600 hover:text-gray-800"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Votre note</label>
                <RatingSelector />
              </div>
              
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 mb-2">Titre de votre avis</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Résumez votre expérience en quelques mots"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="comment" className="block text-gray-700 mb-2">Votre commentaire</label>
                <textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Partagez votre expérience avec notre site..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3">
                {userReview && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    disabled={saving}
                  >
                    Supprimer
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  disabled={saving}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                  {!saving && <Save size={18} />}
                </button>
              </div>
            </form>
          </div>
        )}

        {!isEditing && !userReview && (
          <div className="mb-6">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Ajouter votre avis global
            </button>
          </div>
        )}

        {/* Autres avis globaux */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Autres avis globaux ({allReviews.length})</h3>
          
          {allReviews.length === 0 ? (
            <p className="text-gray-600 italic text-center py-6">
              Aucun avis global pour le moment. Soyez le premier à donner votre avis !
            </p>
          ) : (
            <div className="space-y-4">
              {allReviews.map(review => (
                <div key={review.id} className={`p-4 border rounded-lg ${currentUser && review.userId === currentUser.uid ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.user?.displayName || 'Utilisateur'}</span>
                        {currentUser && review.userId === currentUser.uid && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Vous</span>
                        )}
                      </div>
                      <div className="flex mb-2">{renderStars(review.rating)}</div>
                      <h4 className="font-medium">{review.title}</h4>
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">Publié le {formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalReviews;