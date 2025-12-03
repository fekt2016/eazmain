import React from 'react';
import styled from 'styled-components';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 3rem 0;
  flex-wrap: wrap;
`;

const PageButton = styled.button`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.active ? '#667eea' : '#e2e8f0'};
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: ${props => props.active ? '600' : '500'};

  &:hover:not(:disabled) {
    background: ${props => props.active ? '#5a67d8' : '#f7fafc'};
    border-color: ${props => props.active ? '#5a67d8' : '#cbd5e0'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const NavButton = styled(PageButton)`
  padding: 0.75rem;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 1rem;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 0.25rem;
  align-items: center;
`;

const Ellipsis = styled.span`
  padding: 0.75rem 0.5rem;
  color: #a0aec0;
`;

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i += 1
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    range.forEach((i) => rangeWithDots.push(i));

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <PaginationContainer>
      <NavButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FaChevronLeft />
      </NavButton>

      <PageNumbers>
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <Ellipsis>...</Ellipsis>
            ) : (
              <PageButton
                key={page}
                active={page === currentPage}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PageButton>
            )}
          </React.Fragment>
        ))}
      </PageNumbers>

      <NavButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <FaChevronRight />
      </NavButton>
    </PaginationContainer>
  );
};

export default Pagination;
