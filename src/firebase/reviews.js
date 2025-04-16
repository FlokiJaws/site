// src/firebase/reviews.js
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
  export const addReview = async (review) => {
    try {
      // Vérifier que les champs obligatoires sont présents
      if (!review.userId) {
        return { success: false, error: "ID utilisateur manquant" };
      }
  
      // Vérifier si c'est un avis de produit ou de catégorie
      if (review.reviewType === 'category') {
        if (!review.categoryType || !review.rating) {
          return { success: false, error: "Informations manquantes" };
        }
        
        // Vérifier si l'utilisateur a déjà laissé un avis pour cette catégorie
        const existingReview = await getUserCategoryReview(review.userId, review.categoryType);
        
        if (existingReview.review) {
          return { success: false, error: "Vous avez déjà laissé un avis pour cette catégorie" };
        }
      } else {
        // Avis de produit par défaut
        if (!review.productId || !review.rating) {
          return { success: false, error: "Informations manquantes" };
        }
        
        // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
        const existingReview = await getUserProductReview(review.userId, review.productId);
        
        if (existingReview.review) {
          return { success: false, error: "Vous avez déjà laissé un avis pour ce produit" };
        }
      }
  
      // Ajouter l'avis avec un timestamp
      const reviewRef = await addDoc(collection(db, 'reviews'), {
        ...review,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
  
      // Si c'est un avis de produit, mettre à jour les statistiques de notation du produit
      if (review.reviewType !== 'category' && review.productId) {
        await updateProductRating(review.productId);
      }
  
      return { success: true, id: reviewRef.id };
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
      
      // Si c'est un avis de produit, mettre à jour les statistiques de notation
      if (reviewDoc.data().reviewType !== 'category' && reviewDoc.data().productId) {
        await updateProductRating(reviewDoc.data().productId);
      }
      
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
      
      const reviewData = reviewDoc.data();
      const isProductReview = reviewData.reviewType !== 'category';
      const productId = reviewData.productId;
      
      // Supprimer l'avis
      await deleteDoc(reviewRef);
      
      // Si c'est un avis de produit, mettre à jour les statistiques de notation
      if (isProductReview && productId) {
        await updateProductRating(productId);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la suppression de l'avis:", error);
      return { success: false, error: error.message };
    }
  };
  
  // Récupérer tous les avis d'un produit
  export const getProductReviews = async (productId, sortBy = 'recent', limitCount = null) => {
    try {
      let reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        where('reviewType', '!=', 'category') // Exclure les avis de catégorie
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
      
      const querySnapshot = await getDocs(reviewsQuery);
      const reviews = [];
      
      for (const reviewDoc of querySnapshot.docs) {
        const reviewData = {
          id: reviewDoc.id,
          ...reviewDoc.data()
        };
        
        // Récupérer les informations de l'utilisateur
        if (reviewData.userId) {
          const userDoc = await getDoc(doc(db, 'users', reviewData.userId));
          if (userDoc.exists()) {
            reviewData.user = {
              displayName: userDoc.data().displayName || 'Utilisateur',
              photoURL: userDoc.data().photoURL
            };
          }
        }
        
        reviews.push(reviewData);
      }
      
      return { success: true, reviews };
    } catch (error) {
      console.error("Erreur lors de la récupération des avis:", error);
      return { success: false, error: error.message };
    }
  };
  
  // Récupérer tous les avis d'une catégorie
  export const getCategoryReviews = async (categoryType, sortBy = 'recent', limitCount = null) => {
    try {
      let reviewsQuery = query(
        collection(db, 'reviews'),
        where('categoryType', '==', categoryType),
        where('reviewType', '==', 'category')
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
      
      const querySnapshot = await getDocs(reviewsQuery);
      const reviews = [];
      
      for (const reviewDoc of querySnapshot.docs) {
        const reviewData = {
          id: reviewDoc.id,
          ...reviewDoc.data()
        };
        
        // Récupérer les informations de l'utilisateur
        if (reviewData.userId) {
          const userDoc = await getDoc(doc(db, 'users', reviewData.userId));
          if (userDoc.exists()) {
            reviewData.user = {
              displayName: userDoc.data().displayName || 'Utilisateur',
              photoURL: userDoc.data().photoURL
            };
          }
        }
        
        reviews.push(reviewData);
      }
      
      return { success: true, reviews };
    } catch (error) {
      console.error("Erreur lors de la récupération des avis de catégorie:", error);
      return { success: false, error: error.message };
    }
  };
  
  // Vérifier si un utilisateur a déjà laissé un avis pour un produit
  export const getUserProductReview = async (userId, productId) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('userId', '==', userId),
        where('productId', '==', productId),
        where('reviewType', '!=', 'category')
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
      console.error("Erreur lors de la vérification de l'avis utilisateur:", error);
      return { success: false, error: error.message };
    }
  };
  
  // Vérifier si un utilisateur a déjà laissé un avis pour une catégorie
  export const getUserCategoryReview = async (userId, categoryType) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('userId', '==', userId),
        where('categoryType', '==', categoryType),
        where('reviewType', '==', 'category')
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
      console.error("Erreur lors de la vérification de l'avis de catégorie:", error);
      return { success: false, error: error.message };
    }
  };
  
  // Récupérer les avis d'un utilisateur
  export const getUserReviews = async (userId) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reviews = [];
      
      for (const reviewDoc of querySnapshot.docs) {
        const reviewData = {
          id: reviewDoc.id,
          ...reviewDoc.data()
        };
        
        // Pour les avis de produits, récupérer les informations du produit
        if (reviewData.reviewType !== 'category' && reviewData.productId) {
          const productDoc = await getDoc(doc(db, 'products', reviewData.productId));
          if (productDoc.exists()) {
            reviewData.product = {
              id: productDoc.id,
              name: productDoc.data().name,
              image: productDoc.data().imageUrls && productDoc.data().imageUrls.length > 0 
                ? productDoc.data().imageUrls[0] 
                : null
            };
          }
        }
        // Pour les avis de catégories, ajouter directement le nom de la catégorie
        else if (reviewData.reviewType === 'category' && reviewData.categoryType) {
          const categoryMapping = {
            'gaming': 'Gaming',
            'retro': 'Retro',
            'tcg': 'TCG',
            'goodies': 'Goodies'
          };
          
          reviewData.category = {
            id: reviewData.categoryType,
            name: categoryMapping[reviewData.categoryType] || reviewData.categoryType
          };
        }
        
        reviews.push(reviewData);
      }
      
      return { success: true, reviews };
    } catch (error) {
      console.error("Erreur lors de la récupération des avis utilisateur:", error);
      return { success: false, error: error.message };
    }
  };
  
  // Mettre à jour les statistiques de notation d'un produit
  const updateProductRating = async (productId) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        where('reviewType', '!=', 'category')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Pas d'avis, réinitialiser les statistiques
        await updateDoc(doc(db, 'products', productId), {
          ratingAvg: 0,
          ratingCount: 0
        });
        return;
      }
      
      let totalRating = 0;
      const reviews = querySnapshot.docs;
      
      reviews.forEach(review => {
        totalRating += review.data().rating;
      });
      
      const avgRating = totalRating / reviews.length;
      
      await updateDoc(doc(db, 'products', productId), {
        ratingAvg: avgRating,
        ratingCount: reviews.length
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des statistiques de notation:", error);
    }
  };