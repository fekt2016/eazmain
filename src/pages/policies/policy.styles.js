import styled from 'styled-components';
import { motion } from 'framer-motion';
import { devicesMax } from '../../shared/styles/breakpoint';

/**
 * Styled components for Policy Pages
 * Clean, professional legal page styling inspired by Temu, Amazon, and Shopify
 */

// Main Container
export const PolicyContainer = styled.div`
  min-height: 100vh;
  background: var(--color-white-0);
  padding: var(--spacing-3xl) var(--spacing-lg);
  
  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const PolicyContent = styled(motion.article)`
  max-width: 90rem;
  margin: 0 auto;
  background: var(--color-white-0);
`;

// Header Section
export const PolicyHeader = styled.header`
  margin-bottom: var(--spacing-3xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--color-grey-200);
  
  @media ${devicesMax.md} {
    margin-bottom: var(--spacing-2xl);
    padding-bottom: var(--spacing-lg);
  }
`;

export const PolicyTitle = styled.h1`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-heading);
  line-height: 1.2;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-3xl);
  }
  
  @media ${devicesMax.sm} {
    font-size: var(--font-size-2xl);
  }
`;

export const LastUpdated = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  margin-bottom: var(--spacing-lg);
  font-style: italic;
`;

export const IntroText = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-700);
  line-height: 1.7;
  margin-top: var(--spacing-lg);
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
  }
`;

// Section Styling
export const PolicySection = styled(motion.section)`
  margin-bottom: var(--spacing-3xl);
  
  @media ${devicesMax.md} {
    margin-bottom: var(--spacing-2xl);
  }
`;

export const SectionTitle = styled.h2`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
  font-family: var(--font-heading);
  line-height: 1.3;
  
  &:first-of-type {
    margin-top: 0;
  }
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-md);
  }
`;

export const SectionContent = styled.div`
  font-size: var(--font-size-md);
  color: var(--color-grey-700);
  line-height: 1.8;
  
  p {
    margin-bottom: var(--spacing-md);
  }
`;

// Numbered List Styling
export const NumberedList = styled.ol`
  list-style: none;
  counter-reset: section-counter;
  padding: 0;
  margin: var(--spacing-lg) 0;
  
  > li {
    counter-increment: section-counter;
    margin-bottom: var(--spacing-lg);
    padding-left: var(--spacing-xl);
    position: relative;
    
    &::before {
      content: counter(section-counter) '.';
      position: absolute;
      left: 0;
      font-weight: var(--font-bold);
      color: var(--color-grey-900);
      font-size: var(--font-size-lg);
    }
  }
`;

export const LetteredList = styled.ol`
  list-style: none;
  counter-reset: letter-counter;
  padding: 0;
  margin: var(--spacing-md) 0 var(--spacing-lg);
  padding-left: var(--spacing-lg);
  
  > li {
    counter-increment: letter-counter;
    margin-bottom: var(--spacing-md);
    padding-left: var(--spacing-xl);
    position: relative;
    
    &::before {
      content: counter(letter-counter, upper-roman) '.';
      position: absolute;
      left: 0;
      font-weight: var(--font-semibold);
      color: var(--color-grey-700);
      font-size: var(--font-size-md);
    }
  }
`;

export const BulletList = styled.ul`
  list-style: none;
  padding: 0;
  margin: var(--spacing-md) 0 var(--spacing-lg);
  padding-left: var(--spacing-lg);
  
  > li {
    margin-bottom: var(--spacing-sm);
    padding-left: var(--spacing-lg);
    position: relative;
    
    &::before {
      content: '•';
      position: absolute;
      left: 0;
      font-weight: var(--font-bold);
      color: var(--color-primary-500);
      font-size: var(--font-size-lg);
    }
  }
`;

// Text Styling
export const Paragraph = styled.p`
  margin-bottom: var(--spacing-md);
  line-height: 1.8;
  
  strong {
    font-weight: var(--font-bold);
    color: var(--color-grey-900);
  }
  
  em {
    font-style: italic;
  }
`;

export const ImportantNotice = styled.div`
  background: var(--color-yellow-100);
  border-left: 4px solid var(--color-yellow-700);
  padding: var(--spacing-md) var(--spacing-lg);
  margin: var(--spacing-lg) 0;
  border-radius: var(--border-radius-md);
  
  p {
    margin: 0;
    font-weight: var(--font-semibold);
    color: var(--color-grey-800);
    
    strong {
      color: var(--color-grey-900);
    }
  }
`;

export const WarningBox = styled.div`
  background: var(--color-red-100);
  border-left: 4px solid var(--color-red-600);
  padding: var(--spacing-md) var(--spacing-lg);
  margin: var(--spacing-lg) 0;
  border-radius: var(--border-radius-md);
  
  p {
    margin: 0;
    font-weight: var(--font-semibold);
    color: var(--color-grey-800);
    
    strong {
      color: var(--color-grey-900);
    }
  }
`;

// Help Section
export const HelpSection = styled(motion.section)`
  background: var(--color-grey-50);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  margin-top: var(--spacing-3xl);
  text-align: center;
  
  @media ${devicesMax.md} {
    padding: var(--spacing-lg);
    margin-top: var(--spacing-2xl);
  }
`;

export const HelpTitle = styled.h2`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-heading);
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-xl);
  }
`;

export const HelpText = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-700);
  margin-bottom: var(--spacing-lg);
  line-height: 1.7;
`;

export const HelpButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--color-primary-500);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  text-decoration: none;
  transition: all var(--transition-base);
  font-family: var(--font-heading);
  
  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);
  }
`;

// Divider
export const SectionDivider = styled.hr`
  border: none;
  border-top: 1px solid var(--color-grey-200);
  margin: var(--spacing-2xl) 0;
  
  @media ${devicesMax.md} {
    margin: var(--spacing-xl) 0;
  }
`;

