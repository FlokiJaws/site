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
  orderBy,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

// Récupérer toutes les commandes actives (non livrées et non annulées)
export const getActiveOrders = async () => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['pending', 'processing', 'shipped']),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, orders };
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes actives:", error);
    return { success: false, error: error.message };
  }
};

// Récupérer toutes les commandes complétées ou annulées
export const getCompletedOrders = async () => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['delivered', 'cancelled']),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, orders };
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes terminées:", error);
    return { success: false, error: error.message };
  }
};

// Récupérer toutes les commandes
export const getAllOrders = async () => {
  try {
    const activeOrdersResult = await getActiveOrders();
    const completedOrdersResult = await getCompletedOrders();
    
    if (!activeOrdersResult.success || !completedOrdersResult.success) {
      return { 
        success: false, 
        error: activeOrdersResult.error || completedOrdersResult.error 
      };
    }
    
    const orders = [
      ...activeOrdersResult.orders,
      ...completedOrdersResult.orders
    ];
    
    // Trier par date (plus récente en premier)
    orders.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
      return dateB - dateA;
    });
    
    return { success: true, orders };
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return { success: false, error: error.message };
  }
};

// Récupérer les commandes d'un utilisateur
export const getUserOrders = async (userId) => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, orders };
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes de l'utilisateur:", error);
    return { success: false, error: error.message };
  }
};

// Récupérer une commande par ID
export const getOrderById = async (orderId) => {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    
    if (orderDoc.exists()) {
      return { 
        success: true, 
        order: {
          id: orderDoc.id,
          ...orderDoc.data()
        }
      };
    } else {
      return { success: false, error: "Commande non trouvée" };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la commande:", error);
    return { success: false, error: error.message };
  }
};

// Créer une nouvelle commande
export const createOrder = async (orderData) => {
  try {
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'pending', // Statut par défaut
      createdAt: serverTimestamp()
    });
    
    return { success: true, id: orderRef.id };
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return { success: false, error: error.message };
  }
};

// Mettre à jour le statut d'une commande
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    // 1. Obtenir les données actuelles de la commande
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    
    if (!orderDoc.exists()) {
      return { success: false, error: "Commande non trouvée" };
    }
    
    const order = orderDoc.data();
    const currentStatus = order.status;
    
    // Pas besoin de continuer si le statut ne change pas
    if (currentStatus === newStatus) {
      return { success: true };
    }
    
    const batch = writeBatch(db);
    const orderRef = doc(db, 'orders', orderId);
    
    // 2. Mettre à jour le statut de la commande
    batch.update(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    
    // 3. Si la commande est annulée, remettre les articles en stock et ajuster les statistiques de vente
    if (newStatus === 'cancelled' && currentStatus !== 'cancelled') {
      // Remettre les articles en stock
      for (const item of order.items) {
        const productRef = doc(db, 'products', item.productId);
        batch.update(productRef, {
          stock: increment(item.quantity)
        });
      }
      
      // Mettre à jour les statistiques de vente (décrémenter)
      const statsRef = doc(db, 'stats', 'sales');
      batch.update(statsRef, {
        totalRevenue: increment(-order.totalPrice),
        totalOrders: increment(-1)
      });
    }
    
    // 4. Si la commande était annulée et est maintenant active, retirer à nouveau les articles du stock
    if (currentStatus === 'cancelled' && newStatus !== 'cancelled') {
      // Retirer les articles du stock
      for (const item of order.items) {
        const productRef = doc(db, 'products', item.productId);
        batch.update(productRef, {
          stock: increment(-item.quantity)
        });
      }
      
      // Mettre à jour les statistiques de vente (incrémenter)
      const statsRef = doc(db, 'stats', 'sales');
      batch.update(statsRef, {
        totalRevenue: increment(order.totalPrice),
        totalOrders: increment(1)
      });
    }
    
    // Exécuter le batch
    await batch.commit();
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de la commande:", error);
    return { success: false, error: error.message };
  }
};