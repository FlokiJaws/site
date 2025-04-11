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
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './config';

// Ajouter un nouveau produit
export const addProduct = async (productData, images) => {
  try {
    // 1. Ajouter d'abord le produit sans images
    const productRef = await addDoc(collection(db, 'products'), {
      ...productData,
      imageUrls: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // 2. Uploader les images et obtenir leurs URLs
    const imageUrls = await Promise.all(
      images.map(async (image, index) => {
        const storageRef = ref(storage, `products/${productRef.id}/${index}-${image.name}`);
        await uploadBytes(storageRef, image);
        return getDownloadURL(storageRef);
      })
    );
    
    // 3. Mettre à jour le document avec les URLs des images
    await updateDoc(productRef, {
      imageUrls
    });
    
    return { success: true, id: productRef.id };
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit:", error);
    return { success: false, error: error.message };
  }
};

// Récupérer tous les produits
export const getAllProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = [];
    
    querySnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, products };
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return { success: false, error: error.message };
  }
};

// Récupérer les produits par catégorie
export const getProductsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'products'),
      where('categories', 'array-contains', category)
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, products };
  } catch (error) {
    console.error("Erreur lors de la récupération des produits par catégorie:", error);
    return { success: false, error: error.message };
  }
};

// Récupérer les produits par sous-catégorie
export const getProductsBySubcategory = async (categoryType, subcategoryId) => {
  try {
    // D'abord récupérer tous les produits de la catégorie principale
    const { success, products, error } = await getProductsByCategory(categoryType);
    
    if (!success) {
      return { success: false, error };
    }
    
    // Ensuite filtrer par sous-catégorie
    const filteredProducts = products.filter(product => 
      product.subcategories && product.subcategories.includes(subcategoryId)
    );
    
    return { success: true, products: filteredProducts };
  } catch (error) {
    console.error("Erreur lors de la récupération des produits par sous-catégorie:", error);
    return { success: false, error: error.message };
  }
};

// Récupérer un produit par ID
export const getProductById = async (productId) => {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    
    if (productDoc.exists()) {
      return { 
        success: true, 
        product: {
          id: productDoc.id,
          ...productDoc.data()
        }
      };
    } else {
      return { success: false, error: "Produit non trouvé" };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return { success: false, error: error.message };
  }
};

// Mettre à jour un produit
export const updateProduct = async (productId, productData, newImages = []) => {
  try {
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      return { success: false, error: "Produit non trouvé" };
    }
    
    let imageUrls = productDoc.data().imageUrls || [];
    
    // Uploader les nouvelles images si nécessaire
    if (newImages.length > 0) {
      const newImageUrls = await Promise.all(
        newImages.map(async (image, index) => {
          const storageRef = ref(storage, `products/${productId}/${imageUrls.length + index}-${image.name}`);
          await uploadBytes(storageRef, image);
          return getDownloadURL(storageRef);
        })
      );
      
      imageUrls = [...imageUrls, ...newImageUrls];
    }
    
    // Mettre à jour le document
    await updateDoc(productRef, {
      ...productData,
      imageUrls,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    return { success: false, error: error.message };
  }
};

// Supprimer un produit
export const deleteProduct = async (productId) => {
  try {
    // 1. Récupérer le produit pour obtenir les URLs des images
    const productDoc = await getDoc(doc(db, 'products', productId));
    
    if (!productDoc.exists()) {
      return { success: false, error: "Produit non trouvé" };
    }
    
    // 2. Supprimer les images du storage
    const imageUrls = productDoc.data().imageUrls || [];
    await Promise.all(
      imageUrls.map(async (imageUrl) => {
        // Extraire le chemin complet de l'URL
        const imageRef = ref(storage, imageUrl);
        return deleteObject(imageRef).catch(err => {
          console.warn("Impossible de supprimer l'image:", err);
        });
      })
    );
    
    // 3. Supprimer le document du produit
    await deleteDoc(doc(db, 'products', productId));
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return { success: false, error: error.message };
  }
};