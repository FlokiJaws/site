import React from 'react';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import './CategoryPage.css';

const TcgPage = () => {
  // Données temporaires pour les produits TCG
  const tcgProducts = [
    { id: 1, title: "Booster Pokémon", price: 4.99, image: "/api/placeholder/300/300", badge: "Nouveau" },
    { id: 2, title: "Deck Magic Starter", price: 14.99, image: "/api/placeholder/300/300" },
    { id: 3, title: "Carte Charizard Rare", price: 99.99, image: "/api/placeholder/300/300", badge: "Rare" },
    { id: 4, title: "Yu-Gi-Oh! Starter Deck", price: 12.99, image: "/api/placeholder/300/300" },
    { id: 5, title: "Boîte de boosters Magic", price: 89.99, image: "/api/placeholder/300/300", badge: "Edition limitée" },
    { id: 6, title: "Pokémon Elite Trainer Box", price: 44.99, image: "/api/placeholder/300/300" },
    { id: 7, title: "Carte Mewtwo Holo", price: 59.99, image: "/api/placeholder/300/300" },
    { id: 8, title: "Deck One Piece TCG", price: 14.99, image: "/api/placeholder/300/300", badge: "Nouveau" },
    { id: 9, title: "Album de cartes", price: 19.99, image: "/api/placeholder/300/300" }
  ];
  
  return (
    <div className="page-container">
      <Navbar />
      <div className="category-content">
        <h1>Catégorie TCG</h1>
        <p>Explorez notre sélection de cartes à collectionner. Pokémon, Magic: The Gathering, Yu-Gi-Oh! et bien plus.</p>
        <div className="products-grid">
          {tcgProducts.map(product => (
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

export default TcgPage;