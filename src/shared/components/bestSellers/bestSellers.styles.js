import styled from 'styled-components';
import { motion } from 'framer-motion';
import { devicesMax } from '../../../shared/styles/breakpoint';

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
  max-width: 100%;
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

export const SellerCount = styled.p`
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
  gap: 1rem;
`;

export const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const SortLabel = styled.span`
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-xs);

  svg {
    font-size: var(--text-sm);
  }
`;

export const SortSelect = styled.select`
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--radius-md);
  background: var(--color-white-0);
  color: var(--color-grey-900);
  font-size: var(--text-sm);
  cursor: pointer;
  min-width: 140px;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.1);
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const FilterLabel = styled.span`
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-xs);

  svg {
    font-size: var(--text-sm);
  }
`;

export const FilterSelect = styled.select`
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--radius-md);
  background: var(--color-white-0);
  color: var(--color-grey-900);
  font-size: var(--text-sm);
  cursor: pointer;
  min-width: 160px;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.1);
  }

  &:disabled {
    background: var(--color-grey-50);
    color: var(--color-grey-500);
    cursor: not-allowed;
  }
`;
