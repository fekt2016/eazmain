import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {
  PaginationContainer,
  PaginationButton,
  PaginationNumber,
  PaginationNumbers,
  PaginationInfo,
} from './newArrivals.styles';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      // Adjust start if we're near the end
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <PaginationContainer>
      <PaginationInfo>
        Page {currentPage} of {totalPages}
      </PaginationInfo>
      
      <PaginationNumbers>
        <PaginationButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <FaChevronLeft />
        </PaginationButton>
        
        {pageNumbers.map((pageNum) => (
          <PaginationNumber
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            $active={pageNum === currentPage}
          >
            {pageNum}
          </PaginationNumber>
        ))}
        
        <PaginationButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <FaChevronRight />
        </PaginationButton>
      </PaginationNumbers>
    </PaginationContainer>
  );
};

export default Pagination;

