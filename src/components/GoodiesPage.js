import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import { getProductsByCategory } from '../firebase/products';
import './CategoryPage.css';

const GoodiesPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const result = await getProductsByCategory('goodies');
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
        <h1>Catégorie Goodies</h1>
        <p>Trouvez vos figurines, posters, vêtements et autres accessoires de vos franchises préférées.</p>
        
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

export default GoodiesPage;