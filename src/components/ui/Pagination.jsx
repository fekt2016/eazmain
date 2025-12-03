import React from 'react';
import styled, { css } from 'styled-components';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Button from './Button';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-sm);
  margin: var(--space-2xl) 0;
  flex-wrap: wrap;
`;

const PageButton = styled(Button)`
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-sm);
  min-width: 44px;

  ${({ active }) => active && css`
    background: var(--color-primary-500);
    color: var(--color-white-0);
  `}
`;

const NavButton = styled(PageButton)`
  padding: var(--space-sm);
`;

const Ellipsis = styled.span`
  padding: var(--space-sm) var(--space-md);
  color: var(--color-grey-500);
`;

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i += 1) {
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
      <NavButton variant="outline" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <FaChevronLeft />
      </NavButton>

      {getVisiblePages().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <Ellipsis>...</Ellipsis>
          ) : (
            <PageButton
              key={page}
              variant={page === currentPage ? 'primary' : 'outline'}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PageButton>
          )}
        </React.Fragment>
      ))}

      <NavButton variant="outline" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <FaChevronRight />
      </NavButton>
    </PaginationContainer>
  );
};

export default Pagination;
