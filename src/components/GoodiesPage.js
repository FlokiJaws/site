import React from 'react';
import Navbar from './Navbar';
import './CategoryPage.css';

const GoodiesPage = () => {
  return (
    <div className="page-container">
      <Navbar />
      <div className="category-content">
        <h1>Catégorie Goodies</h1>
        <p>Trouvez vos figurines, posters, vêtements et autres accessoires de vos franchises préférées.</p>
        <div className="placeholder-content">
          <div className="placeholder-box"></div>
          <div className="placeholder-box"></div>
          <div className="placeholder-box"></div>
        </div>
      </div>
    </div>
  );
};

export default GoodiesPage;