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
import { getParentSubcategory } from '../utils/categories';
import productCache from '../utils/ProductCacheService';

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
    
    // 4. Invalider le cache après l'ajout d'un produit
    productCache.clearCache();
    
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
    // Vérifier si les données sont en cache
    const cachedProducts = productCache.getCategoryProducts(category);
    if (cachedProducts) {
      return { success: true, products: cachedProducts };
    }
    
    // Si pas en cache, récupérer depuis Firestore
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
    
    // Mettre en cache les résultats
    productCache.setCategoryProducts(category, products);
    
    return { success: true, products };
  } catch (error) {
    console.error("Erreur lors de la récupération des produits par catégorie:", error);
    return { success: false, error: error.message };
  }
};

// Récupérer les produits par sous-catégorie
export const getProductsBySubcategory = async (categoryType, subcategoryId) => {
  try {
    // Vérifier si les données sont en cache
    const cachedProducts = productCache.getSubcategoryProducts(categoryType, subcategoryId);
    if (cachedProducts) {
      return { success: true, products: cachedProducts };
    }
    
    // Vérifier si c'est une sous-sous-catégorie (pour TCG)
    const parentCategory = getParentSubcategory(categoryType, subcategoryId);
    
    // Si c'est une sous-sous-catégorie, nous devons d'abord récupérer tous les produits de la catégorie principale
    if (parentCategory) {
      // D'abord récupérer tous les produits de la catégorie principale
      const { success, products, error } = await getProductsByCategory(categoryType);
      
      if (!success) {
        return { success: false, error };
      }
      
      // Filtrer les produits qui ont cette sous-sous-catégorie
      const filteredProducts = products.filter(product => 
        product.subcategories && product.subcategories.includes(subcategoryId)
      );
      
      // Mettre en cache les résultats
      productCache.setSubcategoryProducts(categoryType, subcategoryId, filteredProducts);
      
      return { success: true, products: filteredProducts };
    } else {
      // Sinon, c'est une sous-catégorie régulière
      // D'abord récupérer tous les produits de la catégorie principale
      const { success, products, error } = await getProductsByCategory(categoryType);
      
      if (!success) {
        return { success: false, error };
      }
      
      // Ensuite filtrer par sous-catégorie
      const filteredProducts = products.filter(product => 
        product.subcategories && product.subcategories.includes(subcategoryId)
      );
      
      // Mettre en cache les résultats
      productCache.setSubcategoryProducts(categoryType, subcategoryId, filteredProducts);
      
      return { success: true, products: filteredProducts };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des produits par sous-catégorie:", error);
    return { success: false, error: error.message };
  }
};

// Récupérer un produit par ID
export const getProductById = async (productId) => {
  try {
    // Vérifier si le produit est en cache
    const cachedProduct = productCache.getProduct(productId);
    if (cachedProduct) {
      return { success: true, product: cachedProduct };
    }
    
    // Si pas en cache, récupérer depuis Firestore
    const productDoc = await getDoc(doc(db, 'products', productId));
    
    if (productDoc.exists()) {
      const product = {
        id: productDoc.id,
        ...productDoc.data()
      };
      
      // Mettre en cache le produit
      productCache.setProduct(productId, product);
      
      return { success: true, product };
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
    
    // Invalider le cache après la mise à jour
    productCache.clearCache();
    
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
    
    // 4. Invalider le cache après la suppression
    productCache.clearCache();
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return { success: false, error: error.message };
  }
};

// Fonction de recherche avancée
export const searchProducts = async (searchTerm, searchFilters = {}) => {
  try {
    // Vérifier si les résultats sont en cache
    const cachedResults = productCache.getSearchResults(searchTerm, searchFilters);
    if (cachedResults) {
      return { success: true, products: cachedResults };
    }
    
    // Récupérer tous les produits (dans une application réelle, vous utiliseriez 
    // Firestore ou Algolia pour une recherche plus efficace)
    const querySnapshot = await getDocs(collection(db, 'products'));
    let products = [];
    
    querySnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Filtrer les produits par terme de recherche (recherche de texte simple)
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      products = products.filter(product => {
        const nameMatch = product.name && product.name.toLowerCase().includes(term);
        const descMatch = product.description && product.description.toLowerCase().includes(term);
        return nameMatch || descMatch;
      });
    }
    
    // Appliquer les filtres supplémentaires
    if (searchFilters) {
      // Filtre par catégories
      if (searchFilters.categories && searchFilters.categories.length > 0) {
        products = products.filter(product => 
          product.categories && searchFilters.categories.some(cat => product.categories.includes(cat))
        );
      }
      
      // Filtre par prix minimum
      if (searchFilters.minPrice && !isNaN(searchFilters.minPrice)) {
        products = products.filter(product => product.price >= parseFloat(searchFilters.minPrice));
      }
      
      // Filtre par prix maximum
      if (searchFilters.maxPrice && !isNaN(searchFilters.maxPrice)) {
        products = products.filter(product => product.price <= parseFloat(searchFilters.maxPrice));
      }
      
      // Filtre par gamme de prix
      if (searchFilters.priceRange && Array.isArray(searchFilters.priceRange) && searchFilters.priceRange.length === 2) {
        const [min, max] = searchFilters.priceRange;
        if (min !== '' && max !== '') {
          products = products.filter(product => 
            product.price >= parseFloat(min) && product.price <= parseFloat(max)
          );
        }
      }
      
      // Filtre par stock
      if (searchFilters.inStock) {
        products = products.filter(product => product.stock > 0);
      }
    }
    
    // Mettre en cache les résultats
    productCache.setSearchResults(searchTerm, searchFilters, products);
    
    return { success: true, products };
  } catch (error) {
    console.error("Erreur lors de la recherche de produits:", error);
    return { success: false, error: error.message };
  }
};