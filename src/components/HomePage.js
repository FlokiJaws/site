import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import { getProductsByCategory } from '../firebase/products';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const result = await getProductsByCategory('home');
      if (result.success) {
        setProducts(result.products);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="home-container">
        <div className="hero-section">
          <h2>Bienvenue sur GameCash</h2>
          <p>Votre destination pour tous les produits gaming, rétro, cartes et goodies</p>
        </div>
        
        <div className="featured-products">
          <h2>Produits en vedette</h2>
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
                  title={product.name}
                  price={product.price}
                  image={product.imageUrls && product.imageUrls.length > 0 
                    ? product.imageUrls[0] 
                    : "/api/placeholder/300/300"}
                  badge={product.badge}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;