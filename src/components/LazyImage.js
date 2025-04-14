import React, { useState, useEffect, useRef } from 'react';
import './LazyImage.css';

const LazyImage = ({ src, alt, className, placeholderColor = '#f0f0f0' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  
  useEffect(() => {
    // Observer pour détecter quand l'image entre dans le viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Charge un peu avant que l'image soit visible
        threshold: 0.01
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);
  
  const handleImageLoad = () => {
    setIsLoaded(true);
  };
  
  return (
    <div 
      ref={imgRef}
      className={`lazy-image-container ${className || ''}`}
      style={{ backgroundColor: placeholderColor }}
    >
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`lazy-image ${isLoaded ? 'loaded' : ''}`}
          onLoad={handleImageLoad}
        />
      )}
      
      {!isLoaded && (
        <div className="lazy-image-placeholder">
          <div className="lazy-image-skeleton"></div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;