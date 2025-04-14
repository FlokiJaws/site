import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import Pagination from './Pagination';
import { searchProducts } from '../firebase/products';
import './CategoryPage.css';

const SearchResultsPage = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(16); // Nombre de produits par page
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    priceRange: [0, 1000],
    sortBy: 'default',
    inStock: false
  });
  
  // Extraire les paramètres de l'URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get('q') || '';
    const minPrice = parseInt(searchParams.get('minPrice')) || 0;
    const maxPrice = parseInt(searchParams.get('maxPrice')) || 1000;
    const inStock = searchParams.get('inStock') === 'true';
    const categories = searchParams.get('categories') ? searchParams.get('categories').split(',') : [];
    
    setQuery(q);
    setActiveFilters({
      categories,
      priceRange: [minPrice, maxPrice],
      sortBy: 'default',
      inStock
    });
    
    // Déclencher la recherche
    performSearch(q, {
      categories,
      priceRange: [minPrice, maxPrice],
      inStock
    });
  }, [location.search]);
  
  // Fonction pour effectuer la recherche
  const performSearch = async (searchQuery, filters) => {
    setLoading(true);
    try {
      const result = await searchProducts(searchQuery, filters);
      if (result.success) {
        setProducts(result.products);
        applyFilters(result.products, filters);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setProducts([]);
      setFilteredProducts([]);
    }
    setLoading(false);
  };
  
  // Mettre à jour les produits paginés quand les filtres ou la page changent
  useEffect(() => {
    // Calculer le nombre total de pages
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    // Ajuster la page courante si nécessaire
    const adjustedCurrentPage = Math.min(currentPage, totalPages || 1);
    if (adjustedCurrentPage !== currentPage) {
      setCurrentPage(adjustedCurrentPage);
    }
    
    // Calculer les indices pour la pagination
    const indexOfLastProduct = adjustedCurrentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    
    // Extraire les produits pour la page courante
    setPaginatedProducts(filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct));
  }, [filteredProducts, currentPage, productsPerPage]);
  
  // Appliquer les filtres sur les produits
  const applyFilters = (productsToFilter, filters) => {
    let result = [...productsToFilter];
    
    // Filtre par catégorie si spécifié
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter(product => 
        product.categories && 
        product.categories.some(cat => filters.categories.includes(cat))
      );
    }
    
    // Filtre par gamme de prix
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      result = result.filter(product => 
        product.price >= min && product.price <= max
      );
    }
    
    // Filtre par disponibilité en stock
    if (filters.inStock) {
      result = result.filter(product => product.stock > 0);
    }
    
    // Tri des produits
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          result.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return b.createdAt.seconds - a.createdAt.seconds;
            }
            return 0;
          });
          break;
        default:
          // Tri par pertinence (déjà géré par Firebase)
          break;
      }
    }
    
    setFilteredProducts(result);
    setCurrentPage(1); // Réinitialiser à la première page après filtrage
  };
  
  // Gestionnaire pour les changements de filtre
  const handleFilterChange = (filters) => {
    // Mettre à jour les filtres actifs
    const updatedFilters = { ...activeFilters, ...filters };
    setActiveFilters(updatedFilters);
    
    // Appliquer les filtres mis à jour
    applyFilters(products, updatedFilters);
  };
  
  return (
    <div className="page-container">
      <Navbar />
      <div className="category-content">
        <div className="category-hero-section">
          <h2>Résultats de recherche pour "{query}"</h2>
          <p>Nous avons trouvé {filteredProducts.length} produits correspondant à votre recherche</p>
        </div>
        
        {/* Filtres pour les résultats */}
        <CategoryFilter 
          onFilterChange={handleFilterChange}
          initialFilters={activeFilters}
        />
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Chargement des résultats...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Aucun produit ne correspond à votre recherche.
          </div>
        ) : (
          <>
            <div className="products-grid">
              {paginatedProducts.map(product => (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  title={product.name}
                  price={product.price}
                  image={product.imageUrls && product.imageUrls.length > 0 
                    ? product.imageUrls[0] 
                    : "/api/placeholder/300/300"}
                  badge={product.badge}
                  stock={product.stock || 0}
                />
              ))}
            </div>
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredProducts.length / productsPerPage)}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;