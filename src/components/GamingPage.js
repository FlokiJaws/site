import React from 'react';
import Navbar from './Navbar';
import './CategoryPage.css';

const GamingPage = () => {
  return (
    <div className="page-container">
      <Navbar />
      <div className="category-content">
        <h1>Catégorie Gaming</h1>
        <p>Bienvenue dans notre section Gaming. Ici vous trouverez les dernières consoles et jeux vidéo.</p>
        <div className="placeholder-content">
          <div className="placeholder-box"></div>
          <div className="placeholder-box"></div>
          <div className="placeholder-box"></div>
        </div>
      </div>
    </div>
  );
};

export default GamingPage;