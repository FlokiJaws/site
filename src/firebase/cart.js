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
    serverTimestamp,
    increment
  } from 'firebase/firestore';
  import { db } from './config';
  
  // Récupérer le panier d'un utilisateur
  export const getUserCart = async (userId) => {
    try {
      // Vérifier si l'utilisateur a déjà un panier
      const q = query(
        collection(db, 'carts'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Si le panier existe, le retourner
      if (!querySnapshot.empty) {
        const cartDoc = querySnapshot.docs[0];
        return { 
          success: true, 
          cart: {
            id: cartDoc.id,
            ...cartDoc.data()
          }
        };
      }
      
      // Sinon, créer un nouveau panier
      const cartRef = await addDoc(collection(db, 'carts'), {
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { 
        success: true, 
        cart: {
          id: cartRef.id,
          userId,
          items: [],
          totalItems: 0,
          totalPrice: 0
        }
      };
    } catch (error) {
      console.error("Erreur lors de la récupération du panier:", error);
      return { success: false, error: error.message };
    }
  };
  
  // Ajouter un produit au panier
  export const addToCart = async (userId, product, quantity = 1) => {
    try {
      // Récupérer le panier de l'utilisateur
      const cartResult = await getUserCart(userId);
      
      if (!cartResult.success) {
        return cartResult;
      }
      
      const cart = cartResult.cart;
      const cartRef = doc(db, 'carts', cart.id);
      
      // Vérifier si le produit est déjà dans le panier
      const existingItems = cart.items || [];
      const existingItemIndex = existingItems.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex !== -1) {
        // Mettre à jour la quantité si le produit existe déjà
        const newItems = [...existingItems];
        newItems[existingItemIndex].quantity += quantity;
        
        await updateDoc(cartRef, {
          items: newItems,
          totalItems: increment(quantity),
          totalPrice: increment(product.price * quantity),
          updatedAt: serverTimestamp()
        });
      } else {
        // Ajouter le produit si c'est un nouveau produit
        const newItem = {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null,
          quantity
        };
        
        await updateDoc(cartRef, {
          items: [...existingItems, newItem],
          totalItems: increment(quantity),
          totalPrice: increment(product.price * quantity),
          updatedAt: serverTimestamp()
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      return { success: false, error: error.message };
    }
  };
  
  // Mettre à jour la quantité d'un produit dans le panier
  export const updateCartItemQuantity = async (userId, productId, newQuantity) => {
    try {
      // Récupérer le panier
      const cartResult = await getUserCart(userId);
      
      if (!cartResult.success) {
        return cartResult;
      }
      
      const cart = cartResult.cart;
      const cartRef = doc(db, 'carts', cart.id);
      
      // Trouver le produit dans le panier
      const existingItems = cart.items || [];
      const itemIndex = existingItems.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        return { success: false, error: "Produit non trouvé dans le panier" };
      }
      
      const item = existingItems[itemIndex];
      const quantityDifference = newQuantity - item.quantity;
      const priceDifference = quantityDifference * item.price;
      
      // Mettre à jour la quantité
      const newItems = [...existingItems];
      
      if (newQuantity <= 0) {
        // Supprimer l'article si la quantité est 0 ou moins
        newItems.splice(itemIndex, 1);
      } else {
        newItems[itemIndex].quantity = newQuantity;
      }
      
      await updateDoc(cartRef, {
        items: newItems,
        totalItems: increment(quantityDifference),
        totalPrice: increment(priceDifference),
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la quantité:", error);
      return { success: false, error: error.message };
    }
  };
  
  // Supprimer un produit du panier
  export const removeFromCart = async (userId, productId) => {
    try {
      // Récupérer le panier
      const cartResult = await getUserCart(userId);
      
      if (!cartResult.success) {
        return cartResult;
      }
      
      const cart = cartResult.cart;
      const cartRef = doc(db, 'carts', cart.id);
      
      // Trouver le produit dans le panier
      const existingItems = cart.items || [];
      const itemIndex = existingItems.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        return { success: false, error: "Produit non trouvé dans le panier" };
      }
      
      const item = existingItems[itemIndex];
      
      // Supprimer le produit
      const newItems = [...existingItems];
      newItems.splice(itemIndex, 1);
      
      await updateDoc(cartRef, {
        items: newItems,
        totalItems: increment(-item.quantity),
        totalPrice: increment(-(item.price * item.quantity)),
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      return { success: false, error: error.message };
    }
  };
  
  // Vider le panier
  export const clearCart = async (userId) => {
    try {
      // Récupérer le panier
      const cartResult = await getUserCart(userId);
      
      if (!cartResult.success) {
        return cartResult;
      }
      
      const cartRef = doc(db, 'carts', cartResult.cart.id);
      
      // Réinitialiser le panier
      await updateDoc(cartRef, {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la vidange du panier:", error);
      return { success: false, error: error.message };
    }
  };
  
  // Récupérer le nombre d'articles dans le panier
  export const getCartItemCount = async (userId) => {
    try {
      // Récupérer le panier
      const cartResult = await getUserCart(userId);
      
      if (!cartResult.success) {
        return { success: false, error: cartResult.error };
      }
      
      return { 
        success: true, 
        count: cartResult.cart.totalItems || 0 
      };
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre d'articles:", error);
      return { success: false, error: error.message };
    }
  };