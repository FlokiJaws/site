import React from 'react';

const ProductCard = ({ title, price, image, badge }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={image} alt={title} />
        {badge && <div className="product-badge">{badge}</div>}
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

export default ProductCard;