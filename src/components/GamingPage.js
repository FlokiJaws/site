import React from 'react';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import './CategoryPage.css';

const GamingPage = () => {
  // Données temporaires pour les produits de gaming
  const gamingProducts = [
    { id: 1, title: "PlayStation 5", price: 499.99, image: "/api/placeholder/300/300", badge: "Nouveau" },
    { id: 2, title: "Xbox Series X", price: 459.99, image: "/api/placeholder/300/300", badge: "Populaire" },
    { id: 3, title: "Nintendo Switch OLED", price: 349.99, image: "/api/placeholder/300/300", badge: "Stock limité" },
    { id: 4, title: "Steam Deck", price: 419.99, image: "/api/placeholder/300/300" },
    { id: 5, title: "Manette PS5", price: 69.99, image: "/api/placeholder/300/300" },
    { id: 6, title: "Casque Gaming", price: 129.99, image: "/api/placeholder/300/300", badge: "Promo" },
    { id: 7, title: "Gaming PC Alienware", price: 1299.99, image: "/api/placeholder/300/300" },
    { id: 8, title: "Elden Ring", price: 59.99, image: "/api/placeholder/300/300", badge: "Nouveau" },
    { id: 9, title: "God of War Ragnarök", price: 69.99, image: "/api/placeholder/300/300" }
  ];
  
  return (
    <div className="page-container">
      <Navbar />
      <div className="category-content">
        <h1>Catégorie Gaming</h1>
        <p>Bienvenue dans notre section Gaming. Ici vous trouverez les dernières consoles et jeux vidéo.</p>
        <div className="products-grid">
          {gamingProducts.map(product => (
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

export default GamingPage;