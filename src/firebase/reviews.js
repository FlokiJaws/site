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
    // Simplifions la requête pour éviter les problèmes d'index
    let reviewsQuery = query(
      collection(db, 'reviews'),
      where('productId', '==', productId)
    );
    
    // Récupérons tous les documents puis filtrons et trions côté client
    const querySnapshot = await getDocs(reviewsQuery);
    let reviews = [];
    
    // Filtrer les avis qui ne sont pas des avis de catégorie
    querySnapshot.forEach(reviewDoc => {
      const data = reviewDoc.data();
      if (data.reviewType !== 'category') {
        reviews.push({
          id: reviewDoc.id,
          ...data
        });
      }
    });
    
    // Tri côté client
    if (sortBy === 'recent') {
      reviews.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
        return dateB - dateA;
      });
    } else if (sortBy === 'highest') {
      reviews.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      reviews.sort((a, b) => a.rating - b.rating);
    }
    
    // Limite côté client
    if (limitCount && !isNaN(limitCount)) {
      reviews = reviews.slice(0, limitCount);
    }
    
    // Récupérer les informations de l'utilisateur pour chaque avis
    for (let i = 0; i < reviews.length; i++) {
      const reviewData = reviews[i];
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
          console.warn(`Erreur lors de la récupération de l'utilisateur ${reviewData.userId}:`, userError);
          // Continue sans les données utilisateur
        }
      }
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

  // Récupérer tous les avis (produits, catégories, globaux)
export const getAllReviews = async () => {
  try {
    const q = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
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
      
      // Pour les avis de produits, récupérer le nom du produit
      if (reviewData.reviewType !== 'category' && reviewData.reviewType !== 'global' && reviewData.productId) {
        try {
          const productDoc = await getDoc(doc(db, 'products', reviewData.productId));
          if (productDoc.exists()) {
            reviewData.product = {
              name: productDoc.data().name,
              imageUrl: productDoc.data().imageUrls && productDoc.data().imageUrls.length > 0 
                ? productDoc.data().imageUrls[0] 
                : null
            };
          }
        } catch (productError) {
          console.warn(`Erreur lors de la récupération des infos produit: ${productError.message}`);
        }
      }
      
      reviews.push(reviewData);
    }
    
    return { success: true, reviews };
  } catch (error) {
    console.error("Erreur lors de la récupération de tous les avis:", error);
    return { success: false, error: error.message };
  }
};

  // Ajouter un nouvel avis
  
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

  // Ces fonctions sont à ajouter dans src/firebase/reviews.js

// Récupérer tous les avis globaux
export const getGlobalReviews = async (sortBy = 'recent', limitCount = null) => {
    try {
      // Importer les fonctions nécessaires si elles ne sont pas déjà importées en haut du fichier
      // Ces imports sont cruciaux - assurez-vous qu'ils existent en haut de votre fichier reviews.js
      // import { collection, query, where, orderBy, limit, getDocs, getDoc, doc } from 'firebase/firestore';
      // import { db } from './config';
      
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
  