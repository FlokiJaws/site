import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import { getProductsByCategory, getProductsBySubcategory } from '../firebase/products';
import { SUBCATEGORIES } from '../utils/categories';
import './CategoryPage.css';

const CategoryPage = ({ categoryType }) => {
  const { subcategoryId } = useParams();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let result;
      
      // Si une sous-catégorie est spécifiée, filtrer par sous-catégorie
      if (subcategoryId) {
        result = await getProductsBySubcategory(categoryType, subcategoryId);
        
        // Définir le titre et la description basés sur la sous-catégorie
        const subcategories = SUBCATEGORIES[categoryType] || [];
        const subcategory = subcategories.find(sub => sub.id === subcategoryId);
        
        if (subcategory) {
          setTitle(`${subcategory.name}`);
          setDescription(`Découvrez notre sélection de produits ${subcategory.name}.`);
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

  return (
    <div className="page-container">
      <Navbar />
      <div className="category-content">
        <h1>{title}</h1>
        <p>{description}</p>
        
        {!subcategoryId && (
          <div className="subcategories-list">
            {SUBCATEGORIES[categoryType]?.map(subcategory => (
              <a 
                key={subcategory.id} 
                href={`/${categoryType}/${subcategory.id}`}
                className="subcategory-link"
              >
                {subcategory.name}
              </a>
            ))}
          </div>
        )}
        
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