import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import { getProductsByCategory, getProductsBySubcategory } from '../firebase/products';
import { SUBCATEGORIES, getParentSubcategory } from '../utils/categories';
import { ChevronRight } from 'lucide-react';
import './CategoryPage.css';

const CategoryPage = ({ categoryType }) => {
  const { subcategoryId } = useParams();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState(null);

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
      }
      setLoading(false);
    };

    fetchProducts();
  }, [categoryType, subcategoryId, location.pathname]);

  // Si c'est une sous-catégorie TCG avec des sous-sous-catégories, afficher ces sous-sous-catégories
  const renderTcgSubcategories = () => {
    if (categoryType !== 'tcg' || !subcategoryId) return null;
    
    const mainCategory = SUBCATEGORIES.tcg.find(cat => cat.id === subcategoryId);
    if (!mainCategory || !mainCategory.subCategories) return null;
    
    return (
      <div className="subcategories-list">
        {mainCategory.subCategories.map(subcategory => (
          <Link 
            key={subcategory.id} 
            to={`/tcg/${subcategory.id}`}
            className="subcategory-link"
          >
            {subcategory.name}
          </Link>
        ))}
      </div>
    );
  };

  // Afficher des liens de navigation pour les sous-catégories principales
  const renderSubcategories = () => {
    if (subcategoryId) return null; // Ne pas afficher la liste si on est déjà dans une sous-catégorie
    
    return (
      <div className="subcategories-list">
        {SUBCATEGORIES[categoryType]?.map(subcategory => (
          <Link 
            key={subcategory.id} 
            to={`/${categoryType}/${subcategory.id}`}
            className="subcategory-link"
          >
            {subcategory.name}
          </Link>
        ))}
      </div>
    );
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

  return (
    <div className="page-container">
      <Navbar />
      <div className="category-content">
        {renderBreadcrumb()}
        <h1>{title}</h1>
        <p>{description}</p>
        
        {/* Afficher les sous-catégories principales si on est dans la page catégorie principale */}
        {renderSubcategories()}
        
        {/* Afficher les sous-sous-catégories pour TCG si on est dans une sous-catégorie principale */}
        {renderTcgSubcategories()}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Chargement des produits...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Aucun produit disponible pour le moment.
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
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
        )}
      </div>
    </div>
  );
};

export default CategoryPage;