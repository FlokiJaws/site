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
    orderBy
  } from 'firebase/firestore';
  import { db } from './config';
  
  // Récupérer toutes les commandes
  export const getAllOrders = async () => {
    try {
      const q = query(
        collection(db, 'orders'),
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
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de la commande:", error);
      return { success: false, error: error.message };
    }
  };