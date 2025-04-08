import React from 'react';
import Navbar from './Navbar';
import './HomePage.css';

const ProductCard = ({ title, price, image }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={image} alt={title} />
        <div className="product-badge">Nouveau</div>
      </div>
      <div className="product-info">
        <h3>{title}</h3>
        <div className="product-footer">
          <p className="price">{price} €</p>
          <button className="add-to-cart">+</button>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  // Données temporaires pour les produits
  const sampleProducts = [
    { id: 1, title: "PlayStation 5", price: 499.99, image: "https://placehold.co/300x300" },
    { id: 2, title: "Xbox Series X", price: 459.99, image: "https://placehold.co/300x300" },
    { id: 3, title: "Nintendo Switch OLED", price: 349.99, image: "https://placehold.co/300x300" },
    { id: 4, title: "Pokémon Cartes", price: 49.99, image: "https://placehold.co/300x300" },
    { id: 5, title: "Final Fantasy VII", price: 59.99, image: "https://placehold.co/300x300" },
    { id: 6, title: "Figurine Link", price: 89.99, image: "https://placehold.co/300x300" },
    { id: 7, title: "Steam Deck", price: 419.99, image: "https://placehold.co/300x300" },
    { id: 8, title: "Manette PS5", price: 69.99, image: "https://placehold.co/300x300" },
    { id: 9, title: "Zelda: Tears of the Kingdom", price: 59.99, image: "https://placehold.co/300x300" },
    { id: 10, title: "Casque Gaming", price: 129.99, image: "https://placehold.co/300x300" },
    { id: 11, title: "Game Boy Color", price: 79.99, image: "https://placehold.co/300x300" },
    { id: 12, title: "Mario Kart 8", price: 49.99, image: "https://placehold.co/300x300" },
    { id: 13, title: "Carte Magic Rare", price: 29.99, image: "https://placehold.co/300x300" },
    { id: 14, title: "Funko Pop Sonic", price: 14.99, image: "https://placehold.co/300x300" },
    { id: 15, title: "Clavier Mécanique", price: 89.99, image: "https://placehold.co/300x300" },
  ];
  
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
          <div className="products-grid">
            {sampleProducts.map(product => (
              <ProductCard 
                key={product.id}
                title={product.title}
                price={product.price}
                image={product.image}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;