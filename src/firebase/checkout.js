import { 
    collection, 
    addDoc, 
    doc, 
    getDoc, 
    updateDoc,
    increment,
    serverTimestamp,
    runTransaction,
    writeBatch
  } from 'firebase/firestore';
  import { db } from './config';
  import { clearCart } from './cart';
  
  // Créer une nouvelle commande à partir du panier
  export const createOrder = async (userId, cartData, userAddress = null) => {
    try {
      // Vérifier si le panier est vide
      if (!cartData || !cartData.items || cartData.items.length === 0) {
        return { success: false, error: "Le panier est vide" };
      }
      
      // Vérifier le stock pour chaque produit
      const stockErrors = [];
      
      for (const item of cartData.items) {
        const productRef = doc(db, 'products', item.productId);
        const productDoc = await getDoc(productRef);
        
        if (!productDoc.exists()) {
          stockErrors.push(`Le produit "${item.name}" n'existe plus.`);
          continue;
        }
        
        const product = productDoc.data();
        if (!product.stock || product.stock < item.quantity) {
          stockErrors.push(`Stock insuffisant pour "${item.name}". Disponible: ${product.stock || 0}`);
        }
      }
      
      if (stockErrors.length > 0) {
        return { success: false, error: stockErrors.join('\n') };
      }
      
      // Au lieu d'utiliser une transaction, nous allons utiliser un batch
      // qui est plus adapté à ce cas d'utilisation
      const batch = writeBatch(db);
      
      // 1. Créer la commande
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId,
        items: cartData.items,
        totalItems: cartData.totalItems,
        totalPrice: cartData.totalPrice,
        status: 'pending',
        createdAt: serverTimestamp(),
        shippingAddress: userAddress,
        paymentStatus: 'completed', // Simuler un paiement réussi
        paymentMethod: 'simulation'
      });
      
      const orderId = orderRef.id;
      
      // 2. Mettre à jour le stock pour chaque produit
      for (const item of cartData.items) {
        const productRef = doc(db, 'products', item.productId);
        batch.update(productRef, {
          stock: increment(-item.quantity)
        });
      }
      
      // 3. Ajouter la commande à l'historique de l'utilisateur
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const orderHistory = userData.orderHistory || [];
        
        batch.update(userRef, {
          orderHistory: [...orderHistory, orderId],
          updatedAt: serverTimestamp()
        });
      }
      
      // Exécuter le batch
      await batch.commit();
      
      // 4. Vider le panier après une commande réussie
      await clearCart(userId);
      
      return { success: true, orderId };
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      return { success: false, error: error.message || "Une erreur s'est produite" };
    }
  };
  
  // Récupérer l'historique des commandes d'un utilisateur
  export const getUserOrderHistory = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return { success: false, error: "Utilisateur non trouvé" };
      }
      
      const userData = userDoc.data();
      const orderHistory = userData.orderHistory || [];
      
      // Si l'utilisateur n'a pas encore de commandes
      if (orderHistory.length === 0) {
        return { success: true, orders: [] };
      }
      
      // Récupérer les détails de chaque commande
      const orders = [];
      
      for (const orderId of orderHistory) {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (orderDoc.exists()) {
          orders.push({
            id: orderDoc.id,
            ...orderDoc.data()
          });
        }
      }
      
      return { success: true, orders };
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique des commandes:", error);
      return { success: false, error: error.message };
    }
  };