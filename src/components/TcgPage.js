import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import { getProductsByCategory } from '../firebase/products';
import './CategoryPage.css';

const TcgPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const result = await getProductsByCategory('tcg');
      if (result.success) {
        setProducts(result.products);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="page-container">
      <Navbar />
      <div className="category-content">
        <h1>Catégorie TCG</h1>
        <p>Explorez notre sélection de cartes à collectionner. Pokémon, Magic: The Gathering, Yu-Gi-Oh! et bien plus.</p>
        
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

export default TcgPage;