import styled from 'styled-components';
import { motion } from 'framer-motion';
import { devicesMax } from '../../styles/breakpoint';

// Hero Section
export const HeroSection = styled(motion.section)`
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: var(--color-white-0);
  padding: 4rem 0 3rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(255, 196, 0, 0.1) 0%, transparent 50%);
  }

  @media ${devicesMax.md} {
    padding: 3rem 0 2rem;
  }
`;

export const HeroContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  position: relative;
  z-index: 1;

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const HeroTitle = styled.h1`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-bold);
  color: var(--color-white-0);
  line-height: 1.2;
  margin: 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-3xl);
  }

  @media ${devicesMax.sm} {
    font-size: var(--font-size-2xl);
  }
`;

export const HeroSubtitle = styled.p`
  font-size: var(--font-size-lg);
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
  }
`;

export const ProductCount = styled.p`
  font-size: var(--font-size-md);
  color: rgba(255, 255, 255, 0.7);
  margin: 0.5rem 0 0 0;
  font-weight: var(--font-medium);
`;

// Toolbar
export const ToolbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
  gap: 2rem;
  flex-wrap: wrap;

  @media ${devicesMax.md} {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
`;

export const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

export const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

export const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const SortLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  white-space: nowrap;

  svg {
    color: var(--color-grey-500);
  }
`;

export const SortSelect = styled.select`
  padding: 0.8rem 1.2rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  color: var(--color-grey-900);
  background: var(--color-white-0);
  cursor: pointer;
  transition: all var(--transition-base);
  min-width: 180px;

  &:hover {
    border-color: var(--color-primary-500);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.1);
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  white-space: nowrap;

  svg {
    color: var(--color-grey-500);
  }
`;

export const FilterSelect = styled.select`
  padding: 0.8rem 1.2rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  color: var(--color-grey-900);
  background: var(--color-white-0);
  cursor: pointer;
  transition: all var(--transition-base);
  min-width: 180px;

  &:hover {
    border-color: var(--color-primary-500);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.1);
  }
`;

// Products Grid
export const GridContainer = styled(motion.div)`
  margin: 2rem 0;
`;

export const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md);
  }

  @media ${devicesMax.md} {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }

  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }
`;

// Pagination
export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 1px solid var(--color-grey-200);
  flex-wrap: wrap;
  gap: 1.5rem;

  @media ${devicesMax.md} {
    flex-direction: column;
    align-items: center;
  }
`;

export const PaginationInfo = styled.span`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  font-weight: var(--font-medium);
`;

export const PaginationNumbers = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-lg);
  background: var(--color-white-0);
  color: var(--color-grey-700);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover:not(:disabled) {
    background: var(--color-primary-500);
    color: var(--color-white-0);
    border-color: var(--color-primary-500);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media ${devicesMax.sm} {
    width: 3rem;
    height: 3rem;
  }
`;

export const PaginationNumber = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 3.5rem;
  height: 3.5rem;
  padding: 0 1rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-lg);
  background: ${props => props.$active ? 'var(--color-primary-500)' : 'var(--color-white-0)'};
  color: ${props => props.$active ? 'var(--color-white-0)' : 'var(--color-grey-700)'};
  font-size: var(--font-size-md);
  font-weight: ${props => props.$active ? 'var(--font-bold)' : 'var(--font-medium)'};
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover {
    background: ${props => props.$active ? 'var(--color-primary-600)' : 'var(--color-grey-50)'};
    border-color: ${props => props.$active ? 'var(--color-primary-600)' : 'var(--color-primary-500)'};
    transform: translateY(-2px);
  }

  @media ${devicesMax.sm} {
    min-width: 3rem;
    height: 3rem;
    padding: 0 0.8rem;
  }
`;

