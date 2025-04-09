import React from 'react';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import './CategoryPage.css';

const GoodiesPage = () => {
  // Données temporaires pour les produits goodies
  const goodiesProducts = [
    { id: 1, title: "Figurine Link", price: 89.99, image: "/api/placeholder/300/300", badge: "Collector" },
    { id: 2, title: "Poster Zelda", price: 19.99, image: "/api/placeholder/300/300" },
    { id: 3, title: "T-shirt Pokémon", price: 24.99, image: "/api/placeholder/300/300" },
    { id: 4, title: "Mug Mario", price: 14.99, image: "/api/placeholder/300/300", badge: "Promo" },
    { id: 5, title: "Funko Pop Sonic", price: 14.99, image: "/api/placeholder/300/300" },
    { id: 6, title: "Peluche Pikachu", price: 29.99, image: "/api/placeholder/300/300" },
    { id: 7, title: "Porte-clés Triforce", price: 9.99, image: "/api/placeholder/300/300" },
    { id: 8, title: "Casquette Nintendo", price: 19.99, image: "/api/placeholder/300/300" },
    { id: 9, title: "Statue Final Fantasy", price: 149.99, image: "/api/placeholder/300/300", badge: "Edition limitée" }
  ];
  
  return (
    <div className="page-container">
      <Navbar />
      <div className="category-content">
        <h1>Catégorie Goodies</h1>
        <p>Trouvez vos figurines, posters, vêtements et autres accessoires de vos franchises préférées.</p>
        <div className="products-grid">
          {goodiesProducts.map(product => (
            <ProductCard 
              key={product.id}
              title={product.title}
              price={product.price}
              image={product.image}
              badge={product.badge}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoodiesPage;