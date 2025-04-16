import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import Pagination from './Pagination';
import GlobalReviews from './GlobalReviews';
import { getProductsByCategory } from '../firebase/products';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10); // Nombre de produits par page
  const [paginatedProducts, setPaginatedProducts] = useState([]);

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
  
  // Mise à jour des produits paginés lorsque les produits ou la page changent
  // Mise à jour des produits paginés lorsque les produits ou la page changent
  useEffect(() => {
    // Calculer le nombre total de pages
    const totalPages = Math.ceil(products.length / productsPerPage);
    
    // Ajuster la page courante si nécessaire
    const adjustedCurrentPage = Math.min(currentPage, totalPages || 1);
    if (adjustedCurrentPage !== currentPage) {
      setCurrentPage(adjustedCurrentPage);
    }
    
    // Calculer les indices pour la pagination
    const indexOfLastProduct = adjustedCurrentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    
    // Extraire les produits pour la page courante
    setPaginatedProducts(products.slice(indexOfFirstProduct, indexOfLastProduct));
  }, [products, currentPage, productsPerPage]);

  return (
    <div>
      <Navbar />
      <div className="home-container">
        <div className="hero-section">
          <h2>Bienvenue sur GamerClash</h2>
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
                totalPages={Math.ceil(products.length / productsPerPage)}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </>
          )}
        </div>
        
        {/* Ajout de la section avis globaux */}
        <GlobalReviews />
      </div>
    </div>
  );
};

export default HomePage;