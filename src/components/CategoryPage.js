import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import Pagination from './Pagination';
import { getProductsByCategory, getProductsBySubcategory } from '../firebase/products';
import { SUBCATEGORIES, getParentSubcategory } from '../utils/categories';
import { ChevronRight } from 'lucide-react';
import './CategoryPage.css';
import './CategoryFilter.css';

const CategoryPage = ({ categoryType }) => {
  const { subcategoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12); // Nombre de produits par page
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    subcategory: subcategoryId || 'all',
    priceRange: [0, 1000],
    sortBy: 'default',
    inStock: false
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let result;
      
      // Si une sous-catégorie est spécifiée, filtrer par sous-catégorie
      if (subcategoryId) {
        result = await getProductsBySubcategory(categoryType, subcategoryId);
        
        // Vérifier si c'est une sous-sous-catégorie (pour TCG)
        const parent = getParentSubcategory(categoryType, subcategoryId);
        setParentCategory(parent);
        
        // Définir le titre et la description basés sur la sous-catégorie
        if (parent) {
          // C'est une sous-sous-catégorie
          const subcategories = parent.subCategories || [];
          const subcategory = subcategories.find(sub => sub.id === subcategoryId);
          
          if (subcategory) {
            setTitle(`${subcategory.name}`);
            setDescription(`Découvrez notre sélection de produits ${subcategory.name} de la ${parent.name}.`);
          }
        } else {
          // C'est une sous-catégorie régulière
          const subcategories = SUBCATEGORIES[categoryType] || [];
          const subcategory = subcategories.find(sub => sub.id === subcategoryId);
          
          if (subcategory) {
            setTitle(`${subcategory.name}`);
            setDescription(`Découvrez notre sélection de produits ${subcategory.name}.`);
          }
        }
      } else {
        // Sinon, obtenir tous les produits de la catégorie principale
        result = await getProductsByCategory(categoryType);
        
        // Définir le titre et la description pour la catégorie principale
        switch(categoryType) {
          case 'gaming':
            setTitle('Catégorie Gaming');
            setDescription('Bienvenue dans notre section Gaming. Ici vous trouverez les dernières consoles et jeux vidéo.');
            break;
          case 'retro':
            setTitle('Catégorie Retro');
            setDescription('Découvrez notre collection de jeux et consoles rétro. Une plongée dans la nostalgie des jeux vidéo.');
            break;
          case 'tcg':
            setTitle('Catégorie TCG');
            setDescription('Explorez notre sélection de cartes à collectionner. Pokémon, Magic: The Gathering, Yu-Gi-Oh! et bien plus.');
            break;
          case 'goodies':
            setTitle('Catégorie Goodies');
            setDescription('Trouvez vos figurines, posters, vêtements et autres accessoires de vos franchises préférées.');
            break;
          default:
            setTitle('Produits');
            setDescription('Découvrez notre sélection de produits.');
        }
      }
      
      if (result.success) {
        setProducts(result.products);
        // Appliquer les filtres initiaux
        applyFilters(result.products, activeFilters);
      } else {
        setFilteredProducts([]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [categoryType, subcategoryId, location.pathname]);

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

  // Fonction pour appliquer tous les filtres actifs
  const applyFilters = (productsToFilter, filters) => {
    let result = [...productsToFilter];
    
    // Filtre par sous-catégorie si on est sur la page principale
    if (!subcategoryId && filters.subcategory && filters.subcategory !== 'all') {
      result = result.filter(product => 
        product.subcategories && product.subcategories.includes(filters.subcategory)
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
            // Si createdAt est disponible, l'utiliser pour le tri
            if (a.createdAt && b.createdAt) {
              return b.createdAt.seconds - a.createdAt.seconds;
            }
            return 0;
          });
          break;
        default:
          // Tri par défaut (aucun tri spécifique)
          break;
      }
    }
    
    setFilteredProducts(result);
    setCurrentPage(1); // Réinitialiser à la première page après filtrage
  };

  // Gestionnaire pour les changements de filtre
  const handleFilterChange = (filters) => {
    // Si le filtre de sous-catégorie change et que nous ne sommes pas déjà sur une sous-catégorie
    if (filters.subcategory && filters.subcategory !== 'all' && !subcategoryId) {
      // Naviguer vers la page de la sous-catégorie sélectionnée
      navigate(`/${categoryType}/${filters.subcategory}`);
      return;
    }
    
    // Mettre à jour les filtres actifs
    const updatedFilters = { ...activeFilters, ...filters };
    setActiveFilters(updatedFilters);
    
    // Appliquer les filtres mis à jour
    applyFilters(products, updatedFilters);
  };

  // Créer un fil d'Ariane pour la navigation
  const renderBreadcrumb = () => {
    if (!subcategoryId) return null;
    
    return (
      <div className="category-breadcrumb">
        <Link to={`/${categoryType}`} className="breadcrumb-link">
          {categoryType === 'tcg' ? 'TCG' : 
           categoryType === 'retro' ? 'Retro' : 
           categoryType === 'gaming' ? 'Gaming' : 'Goodies'}
        </Link>
        
        <ChevronRight size={14} className="breadcrumb-separator" />
        
        {parentCategory ? (
          <>
            <Link to={`/${categoryType}/${parentCategory.id}`} className="breadcrumb-link">
              {parentCategory.name}
            </Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-current">{title}</span>
          </>
        ) : (
          <span className="breadcrumb-current">{title}</span>
        )}
      </div>
    );
  };

  // Version plus petite de l'en-tête de la page d'accueil
  const renderCategoryHero = () => {
    return (
      <div className="category-hero-section">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    );
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="category-content">
        {renderBreadcrumb()}
        
        {/* Nouvel en-tête inspiré de la page d'accueil */}
        {renderCategoryHero()}
        
        {/* Filtres de catégorie pour toutes les catégories */}
        <CategoryFilter 
          categoryType={categoryType}
          subcategoryId={subcategoryId}
          onFilterChange={handleFilterChange}
        />
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Chargement des produits...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Aucun produit disponible pour le moment.
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

export default CategoryPage;