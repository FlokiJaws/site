import React from 'react';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import './CategoryPage.css';

const RetroPage = () => {
  // Données temporaires pour les produits rétro
  const retroProducts = [
    { id: 1, title: "Nintendo 64", price: 129.99, image: "/api/placeholder/300/300", badge: "Rare" },
    { id: 2, title: "SEGA Megadrive", price: 99.99, image: "/api/placeholder/300/300" },
    { id: 3, title: "Game Boy Color", price: 79.99, image: "/api/placeholder/300/300", badge: "Collector" },
    { id: 4, title: "Super Nintendo", price: 119.99, image: "/api/placeholder/300/300" },
    { id: 5, title: "PlayStation 1", price: 89.99, image: "/api/placeholder/300/300" },
    { id: 6, title: "Zelda: Ocarina of Time", price: 49.99, image: "/api/placeholder/300/300", badge: "Classique" },
    { id: 7, title: "Final Fantasy VII (PS1)", price: 39.99, image: "/api/placeholder/300/300" },
    { id: 8, title: "Tetris (Game Boy)", price: 24.99, image: "/api/placeholder/300/300" },
    { id: 9, title: "Sonic the Hedgehog 2", price: 29.99, image: "/api/placeholder/300/300" }
  ];
  
  return (
    <div className="page-container">
      <Navbar />
      <div className="category-content">
        <h1>Catégorie Retro</h1>
        <p>Découvrez notre collection de jeux et consoles rétro. Une plongée dans la nostalgie des jeux vidéo.</p>
        <div className="products-grid">
          {retroProducts.map(product => (
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

export default RetroPage;