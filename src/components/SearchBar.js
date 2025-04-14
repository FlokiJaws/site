import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { searchProducts } from '../firebase/products';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    minPrice: '',
    maxPrice: '',
    inStock: false
  });
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  
  // Catégories disponibles pour le filtre
  const availableCategories = [
    { id: 'gaming', name: 'Gaming' },
    { id: 'retro', name: 'Retro' },
    { id: 'tcg', name: 'TCG' },
    { id: 'goodies', name: 'Goodies' }
  ];

  useEffect(() => {
    // Fonction pour gérer les clics à l'extérieur du composant de recherche
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    // Attach the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Detach the event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, filters]);

  const handleSearch = async () => {
    if (query.length < 2) return;
    
    setLoading(true);
    try {
      const searchResults = await searchProducts(query, filters);
      if (searchResults.success) {
        setResults(searchResults.products);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Erreur de recherche:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFilters(prev => {
      const categories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      
      return { ...prev, categories };
    });
  };

  const handlePriceChange = (e, type) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleStockChange = (e) => {
    setFilters(prev => ({
      ...prev,
      inStock: e.target.checked
    }));
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      minPrice: '',
      maxPrice: '',
      inStock: false
    });
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSelectResult = (productId) => {
    navigate(`/product/${productId}`);
    setShowResults(false);
    setQuery('');
  };

  const handleViewAllResults = () => {
    navigate(`/search?q=${encodeURIComponent(query)}&minPrice=${filters.minPrice}&maxPrice=${filters.maxPrice}&inStock=${filters.inStock}&categories=${filters.categories.join(',')}`);
    setShowResults(false);
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <div className="search-input-container">
          <Search className="search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            placeholder="Rechercher un produit..."
            className="search-input"
          />
          {query && (
            <button className="clear-search-btn" onClick={clearSearch}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      
      {showFilters && (
        <div className="search-filters">
          <div className="filter-section">
            <h4>Catégories</h4>
            <div className="filter-categories">
              {availableCategories.map(category => (
                <label key={category.id} className="filter-category-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Prix</h4>
            <div className="filter-price-range">
              <input
                type="number"
                placeholder="Min €"
                value={filters.minPrice}
                onChange={(e) => handlePriceChange(e, 'minPrice')}
                min="0"
                className="price-input"
              />
              <span>à</span>
              <input
                type="number"
                placeholder="Max €"
                value={filters.maxPrice}
                onChange={(e) => handlePriceChange(e, 'maxPrice')}
                min="0"
                className="price-input"
              />
            </div>
          </div>
          
          <div className="filter-section">
            <label className="filter-stock-checkbox">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={handleStockChange}
              />
              <span>Uniquement en stock</span>
            </label>
          </div>
          
          <div className="filter-actions">
            <button 
              className="reset-filters-btn" 
              onClick={resetFilters}
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}

      {showResults && (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">Recherche en cours...</div>
          ) : results.length > 0 ? (
            <>
              <div className="results-list">
                {results.slice(0, 5).map(product => (
                  <div 
                    key={product.id} 
                    className="result-item"
                    onClick={() => handleSelectResult(product.id)}
                  >
                    <div className="result-image">
                      <img 
                        src={product.imageUrls && product.imageUrls.length > 0 
                          ? product.imageUrls[0] 
                          : "/api/placeholder/50/50"} 
                        alt={product.name} 
                      />
                    </div>
                    <div className="result-info">
                      <div className="result-name">{product.name}</div>
                      <div className="result-price">{product.price.toFixed(2)} €</div>
                    </div>
                    <div className="result-stock">
                      <div className={`stock-indicator ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}></div>
                      <span>{product.stock > 0 ? 'En stock' : 'Épuisé'}</span>
                    </div>
                  </div>
                ))}
              </div>
              {results.length > 5 && (
                <div className="view-all-results" onClick={handleViewAllResults}>
                  Voir tous les résultats ({results.length})
                </div>
              )}
            </>
          ) : query.length >= 2 ? (
            <div className="no-results">Aucun résultat trouvé pour "{query}"</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;