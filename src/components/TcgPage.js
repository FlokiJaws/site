import React from 'react';
import Navbar from './Navbar';
import './CategoryPage.css';

const TcgPage = () => {
  return (
    <div className="page-container">
      <Navbar />
      <div className="category-content">
        <h1>Catégorie Tcg</h1>
        <p>Explorez notre sélection de cartes à collectionner. Pokémon, Magic: The Gathering, Yu-Gi-Oh! et bien plus.</p>
        <div className="placeholder-content">
          <div className="placeholder-box"></div>
          <div className="placeholder-box"></div>
          <div className="placeholder-box"></div>
        </div>
      </div>
    </div>
  );
};

export default TcgPage;