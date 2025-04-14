import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, SlidersHorizontal, Tag, Zap } from 'lucide-react';
import { SUBCATEGORIES } from '../utils/categories';

const CategoryFilter = ({ categoryType, subcategoryId, onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryId || 'all');
  const [subcategories, setSubcategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('default');
  const [inStock, setInStock] = useState(false);

  useEffect(() => {
    // Réinitialiser la sous-catégorie sélectionnée lorsque subcategoryId change
    setSelectedSubcategory(subcategoryId || 'all');
  }, [subcategoryId]);

  useEffect(() => {
    // Charger les sous-catégories pour le type de catégorie sélectionné
    const loadSubcategories = () => {
      if (categoryType && SUBCATEGORIES[categoryType]) {
        setSubcategories(SUBCATEGORIES[categoryType]);
      } else {
        setSubcategories([]);
      }
    };
    
    loadSubcategories();
  }, [categoryType]);

  const handleSubcategoryChange = (subId) => {
    setSelectedSubcategory(subId);
    onFilterChange({ subcategory: subId });
  };

  const handlePriceRangeChange = (event, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(event.target.value);
    setPriceRange(newRange);
    onFilterChange({ priceRange: newRange });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    onFilterChange({ sortBy: value });
  };

  const handleStockChange = (checked) => {
    setInStock(checked);
    onFilterChange({ inStock: checked });
  };

  // Si aucune sous-catégorie n'est disponible et qu'on est déjà sur une sous-catégorie, 
  // ne pas afficher le filtre de sous-catégorie
  const showSubcategoryFilter = !subcategoryId || subcategories.length === 0;

  return (
    <div className="category-filter-container">
      <button 
        className="filter-toggle-button"
        onClick={() => setShowFilters(!showFilters)}
      >
        <SlidersHorizontal size={18} />
        <span>Filtres et tri</span>
        <ChevronDown 
          size={16} 
          style={{ 
            transform: showFilters ? 'rotate(180deg)' : 'rotate(0)', 
            transition: 'transform 0.3s ease' 
          }} 
        />
      </button>
      
      {showFilters && (
        <div className="filter-options">
          {/* Filtre par sous-catégorie si on est sur la page principale de catégorie */}
          {showSubcategoryFilter && subcategories.length > 0 && (
            <div className="subcategory-filter filter-section">
              <h4><Tag size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Sous-catégories</h4>
              
              <div className="subcategory-list filter-grid">
                <div 
                  className={`filter-option ${selectedSubcategory === 'all' ? 'active' : ''}`}
                  onClick={() => handleSubcategoryChange('all')}
                >
                  Toutes les sous-catégories
                </div>
                
                {subcategories.map(subcategory => (
                  <div 
                    key={subcategory.id}
                    className={`filter-option ${selectedSubcategory === subcategory.id ? 'active' : ''}`}
                    onClick={() => handleSubcategoryChange(subcategory.id)}
                  >
                    {subcategory.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Filtre par gamme de prix */}
          <div className="price-filter filter-section">
            <h4><Zap size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Prix</h4>
            
            <div className="price-range-inputs">
              <div className="range-container">
                <label>Min: {priceRange[0]} €</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="10" 
                  value={priceRange[0]} 
                  onChange={(e) => handlePriceRangeChange(e, 0)}
                  className="price-slider"
                />
              </div>
              
              <div className="range-container">
                <label>Max: {priceRange[1]} €</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="10" 
                  value={priceRange[1]} 
                  onChange={(e) => handlePriceRangeChange(e, 1)}
                  className="price-slider"
                />
              </div>
            </div>
          </div>
          
          {/* Tri par */}
          <div className="sort-filter filter-section">
            <h4><Filter size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Trier par</h4>
            
            <div className="sort-options filter-grid">
              <div 
                className={`filter-option ${sortBy === 'default' ? 'active' : ''}`}
                onClick={() => handleSortChange('default')}
              >
                Par défaut
              </div>
              <div 
                className={`filter-option ${sortBy === 'price_asc' ? 'active' : ''}`}
                onClick={() => handleSortChange('price_asc')}
              >
                Prix croissant
              </div>
              <div 
                className={`filter-option ${sortBy === 'price_desc' ? 'active' : ''}`}
                onClick={() => handleSortChange('price_desc')}
              >
                Prix décroissant
              </div>
              <div 
                className={`filter-option ${sortBy === 'newest' ? 'active' : ''}`}
                onClick={() => handleSortChange('newest')}
              >
                Nouveautés
              </div>
            </div>
          </div>
          
          {/* Filtre de disponibilité */}
          <div className="stock-filter filter-section">
            <label className="stock-toggle">
              <input 
                type="checkbox" 
                checked={inStock} 
                onChange={(e) => handleStockChange(e.target.checked)}
              />
              <span>Afficher uniquement les produits en stock</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;