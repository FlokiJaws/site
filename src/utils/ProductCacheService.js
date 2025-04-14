// Service de mise en cache des produits pour limiter les appels Firestore
// À placer dans src/utils/ProductCacheService.js

class ProductCacheService {
    constructor() {
      this.cache = {
        categories: {}, // Cache par catégorie
        subcategories: {}, // Cache par sous-catégorie
        products: {}, // Cache des produits individuels par ID
        searchResults: {}, // Cache des résultats de recherche
        timestamp: Date.now() // Timestamp pour la validité du cache
      };
      
      this.cacheLifetime = 5 * 60 * 1000; // 5 minutes en millisecondes
    }
    
    // Vérifier si le cache est toujours valide
    isCacheValid() {
      const now = Date.now();
      return (now - this.cache.timestamp) < this.cacheLifetime;
    }
    
    // Invalider le cache si nécessaire
    invalidateCache() {
      const shouldInvalidate = !this.isCacheValid();
      
      if (shouldInvalidate) {
        this.cache = {
          categories: {},
          subcategories: {},
          products: {},
          searchResults: {},
          timestamp: Date.now()
        };
      }
      
      return shouldInvalidate;
    }
    
    // Mettre à jour le timestamp du cache
    refreshTimestamp() {
      this.cache.timestamp = Date.now();
    }
    
    // Récupérer les produits par catégorie
    getCategoryProducts(category) {
      this.invalidateCache();
      
      if (this.cache.categories[category]) {
        return this.cache.categories[category];
      }
      
      return null;
    }
    
    // Stocker les produits par catégorie
    setCategoryProducts(category, products) {
      this.cache.categories[category] = products;
      this.refreshTimestamp();
    }
    
    // Récupérer les produits par sous-catégorie
    getSubcategoryProducts(categoryType, subcategoryId) {
      this.invalidateCache();
      
      const key = `${categoryType}_${subcategoryId}`;
      if (this.cache.subcategories[key]) {
        return this.cache.subcategories[key];
      }
      
      return null;
    }
    
    // Stocker les produits par sous-catégorie
    setSubcategoryProducts(categoryType, subcategoryId, products) {
      const key = `${categoryType}_${subcategoryId}`;
      this.cache.subcategories[key] = products;
      this.refreshTimestamp();
    }
    
    // Récupérer un produit par ID
    getProduct(productId) {
      this.invalidateCache();
      
      if (this.cache.products[productId]) {
        return this.cache.products[productId];
      }
      
      return null;
    }
    
    // Stocker un produit par ID
    setProduct(productId, product) {
      this.cache.products[productId] = product;
      this.refreshTimestamp();
    }
    
    // Récupérer les résultats de recherche
    getSearchResults(searchTerm, filters) {
      this.invalidateCache();
      
      // Créer une clé unique basée sur les critères de recherche
      const filterString = JSON.stringify(filters || {});
      const key = `${searchTerm}_${filterString}`;
      
      if (this.cache.searchResults[key]) {
        return this.cache.searchResults[key];
      }
      
      return null;
    }
    
    // Stocker les résultats de recherche
    setSearchResults(searchTerm, filters, results) {
      const filterString = JSON.stringify(filters || {});
      const key = `${searchTerm}_${filterString}`;
      
      this.cache.searchResults[key] = results;
      this.refreshTimestamp();
    }
    
    // Vider complètement le cache
    clearCache() {
      this.cache = {
        categories: {},
        subcategories: {},
        products: {},
        searchResults: {},
        timestamp: Date.now()
      };
    }
  }
  
  // Exporter une instance unique du service pour toute l'application
  const productCache = new ProductCacheService();
  export default productCache;