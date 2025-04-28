import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Ajouter un nouvel avis
export const addReview = async (reviewData) => {
  try {
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

// Mettre à jour un avis existant
export const updateReview = async (reviewId, updatedData) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) {
      return { success: false, error: "Avis non trouvé" };
    }
    
    // Mettre à jour l'avis
    await updateDoc(reviewRef, {
      ...updatedData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avis:", error);
    return { success: false, error: error.message };
  }
};

// Supprimer un avis
export const deleteReview = async (reviewId) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) {
      return { success: false, error: "Avis non trouvé" };
    }
    
    // Supprimer l'avis
    await deleteDoc(reviewRef);
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'avis:", error);
    return { success: false, error: error.message };
  }
};

// Récupérer tous les avis globaux
export const getGlobalReviews = async (sortBy = 'recent', limitCount = null) => {
  try {
    // Construire la requête de base
    let reviewsQuery = query(
      collection(db, 'reviews'),
      where('reviewType', '==', 'global')
    );
    
    // Appliquer le tri
    if (sortBy === 'recent') {
      reviewsQuery = query(reviewsQuery, orderBy('createdAt', 'desc'));
    } else if (sortBy === 'highest') {
      reviewsQuery = query(reviewsQuery, orderBy('rating', 'desc'));
    } else if (sortBy === 'lowest') {
      reviewsQuery = query(reviewsQuery, orderBy('rating', 'asc'));
    }
    
    // Appliquer une limite si spécifiée
    if (limitCount && !isNaN(limitCount)) {
      reviewsQuery = query(reviewsQuery, limit(limitCount));
    }
    
    // Exécuter la requête
    const querySnapshot = await getDocs(reviewsQuery);
    const reviews = [];
    
    // Traitement des résultats
    for (const reviewDoc of querySnapshot.docs) {
      const reviewData = {
        id: reviewDoc.id,
        ...reviewDoc.data()
      };
      
      // Récupérer les informations de l'utilisateur
      if (reviewData.userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', reviewData.userId));
          if (userDoc.exists()) {
            reviewData.user = {
              displayName: userDoc.data().displayName || 'Utilisateur',
              photoURL: userDoc.data().photoURL
            };
          }
        } catch (userError) {
          console.warn(`Erreur lors de la récupération des infos utilisateur: ${userError.message}`);
          // Continue même si on ne peut pas récupérer les infos utilisateur
        }
      }
      
      reviews.push(reviewData);
    }
    
    return { success: true, reviews };
  } catch (error) {
    console.error("Erreur lors de la récupération des avis globaux:", error);
    return { success: false, error: error.message };
  }
};

// Vérifier si un utilisateur a déjà laissé un avis global
export const getUserGlobalReview = async (userId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('userId', '==', userId),
      where('reviewType', '==', 'global')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: true, review: null };
    }
    
    const reviewDoc = querySnapshot.docs[0];
    return { 
      success: true, 
      review: {
        id: reviewDoc.id,
        ...reviewDoc.data()
      }
    };
  } catch (error) {
    console.error("Erreur lors de la vérification de l'avis global:", error);
    return { success: false, error: error.message };
  }
};

// Récupérer les avis d'un utilisateur (tous types)
export const getUserReviews = async (userId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
    querySnapshot.forEach(doc => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, reviews };
  } catch (error) {
    console.error("Erreur lors de la récupération des avis utilisateur:", error);
    return { success: false, error: error.message };
  }
};