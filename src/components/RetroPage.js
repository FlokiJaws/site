import React from 'react';
import Navbar from './Navbar';
import './CategoryPage.css';

const RetroPage = () => {
  return (
    <div className="page-container">
      <Navbar />
      <div className="category-content">
        <h1>Catégorie Retro</h1>
        <p>Découvrez notre collection de jeux et consoles rétro. Une plongée dans la nostalgie des jeux vidéo.</p>
        <div className="placeholder-content">
          <div className="placeholder-box"></div>
          <div className="placeholder-box"></div>
          <div className="placeholder-box"></div>
        </div>
      </div>
    </div>
  );
};

export default RetroPage;