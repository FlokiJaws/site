import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const displayPageCount = 5; // Nombre de pages à afficher
    
    // Cas où il y a moins de pages que le nombre à afficher
    if (totalPages <= displayPageCount) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Calcul des pages à afficher
    let startPage = Math.max(1, currentPage - Math.floor(displayPageCount / 2));
    let endPage = startPage + displayPageCount - 1;
    
    // Ajustement si on dépasse le nombre total de pages
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - displayPageCount + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
      
      // Faire défiler vers le haut de la page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  const pageNumbers = getPageNumbers();
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="pagination-container">
      <button 
        className="pagination-arrow"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={20} />
      </button>
      
      {pageNumbers[0] > 1 && (
        <>
          <button 
            className="pagination-item"
            onClick={() => handlePageClick(1)}
          >
            1
          </button>
          {pageNumbers[0] > 2 && <span className="pagination-ellipsis">...</span>}
        </>
      )}
      
      {pageNumbers.map(page => (
        <button 
          key={page}
          className={`pagination-item ${currentPage === page ? 'active' : ''}`}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </button>
      ))}
      
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="pagination-ellipsis">...</span>
          )}
          <button 
            className="pagination-item"
            onClick={() => handlePageClick(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button 
        className="pagination-arrow"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;