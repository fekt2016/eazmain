import styled from 'styled-components';
import { motion } from 'framer-motion';
import { devicesMax } from '../../shared/styles/breakpoint';

/**
 * Styled components for Contact Page
 * Modern, elegant design inspired by Shopify, Stripe, and Notion
 */

// Main Container
export const ContactContainer = styled.div`
  min-height: 100vh;
  background: #f9f7f4;
  overflow-x: hidden;
`;

// Hero Section
export const HeroSection = styled(motion.section)`
  position: relative;
  padding: var(--spacing-3xl) var(--spacing-lg);
  background: linear-gradient(135deg, #1a1f2e 0%, #2d3444 50%, #1a2035 100%);
  text-align: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(212,136,42,0.12) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 50%, rgba(212,136,42,0.2) 0%, transparent 60%);
    pointer-events: none;
  }

  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const HeroContent = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

export const HeroIcon = styled(motion.div)`
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background: rgba(212,136,42,0.2);
  border: 2px solid rgba(212,136,42,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg);
  color: #D4882A;
  font-size: var(--font-size-3xl);
  position: relative;
  z-index: 1;

  @media ${devicesMax.md} {
    width: 6rem;
    height: 6rem;
    font-size: var(--font-size-2xl);
  }
`;

export const HeroTitle = styled(motion.h1)`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-bold);
  color: #ffffff;
  margin-bottom: var(--spacing-md);
  line-height: 1.2;
  position: relative;
  z-index: 1;

  @media ${devicesMax.md} {
    font-size: var(--font-size-3xl);
  }

  @media ${devicesMax.sm} {
    font-size: var(--font-size-2xl);
  }
`;

export const HeroSubtitle = styled(motion.p)`
  font-size: var(--font-size-xl);
  color: rgba(255,255,255,0.7);
  max-width: 80rem;
  margin: 0 auto;
  line-height: 1.6;
  position: relative;
  z-index: 1;

  @media ${devicesMax.md} {
    font-size: var(--font-size-lg);
  }

  @media ${devicesMax.sm} {
    font-size: var(--font-size-md);
  }
`;

// Section Wrapper
export const SectionWrapper = styled(motion.section)`
  padding: var(--spacing-3xl) var(--spacing-lg);
  max-width: 120rem;
  margin: 0 auto;
  
  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
`;

// Contact Options Cards
export const ContactOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
  
  @media ${devicesMax.md} {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const ContactCard = styled(motion.div)`
  background: #ffffff;
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  border: 1px solid #f0e8d8;
  transition: all 0.25s ease;

  &:hover {
    box-shadow: 0 8px 28px rgba(212,136,42,0.12);
    border-color: rgba(212,136,42,0.35);
    transform: translateY(-4px);
  }
`;

export const ContactCardIcon = styled.div`
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  background: ${props => props.$bgColor || 'var(--color-primary-50)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
  color: ${props => props.$iconColor || 'var(--color-primary-500)'};
  font-size: var(--font-size-2xl);
`;

export const ContactCardTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
`;

export const ContactCardDescription = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
`;

export const ContactCardInfo = styled.div`
  font-size: var(--font-size-lg);
  color: #D4882A;
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-md);
`;

export const ContactCardButton = styled(motion.button)`
  padding: var(--spacing-sm) var(--spacing-lg);
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  color: #ffffff;
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 4px 14px rgba(212,136,42,0.3);

  &:hover {
    background: linear-gradient(135deg, #B8711F 0%, #D4882A 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(212,136,42,0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Contact Form
export const FormContainer = styled(motion.div)`
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-grey-200);
  max-width: 80rem;
  margin: 0 auto;
  
  @media ${devicesMax.md} {
    padding: var(--spacing-xl);
  }
`;

export const FormTitle = styled.h2`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-lg);
  text-align: center;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  
  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-lg);
  
  ${props => props.$fullWidth && `
    grid-column: 1 / -1;
  `}
`;

export const FormLabel = styled.label`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  margin-bottom: var(--spacing-xs);
  
  ${props => props.$required && `
    &::after {
      content: ' *';
      color: var(--color-red-600);
    }
  `}
`;

export const FormInput = styled.input`
  padding: var(--spacing-md);
  border: 1px solid ${props => props.$hasError ? 'var(--color-red-500)' : 'var(--color-grey-300)'};
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  transition: all var(--transition-base);
  background: var(--color-white-0);
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? 'var(--color-red-600)' : 'var(--color-primary-500)'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(248, 113, 113, 0.1)' : 'rgba(255, 196, 0, 0.1)'};
  }
  
  &:disabled {
    background: var(--color-grey-100);
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: var(--color-grey-400);
  }
`;

export const FormTextarea = styled.textarea`
  padding: var(--spacing-md);
  border: 1px solid ${props => props.$hasError ? 'var(--color-red-500)' : 'var(--color-grey-300)'};
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  min-height: 15rem;
  resize: vertical;
  transition: all var(--transition-base);
  background: var(--color-white-0);
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? 'var(--color-red-600)' : 'var(--color-primary-500)'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(248, 113, 113, 0.1)' : 'rgba(255, 196, 0, 0.1)'};
  }
  
  &:disabled {
    background: var(--color-grey-100);
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: var(--color-grey-400);
  }
`;

export const FileInputWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

export const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 2px dashed var(--color-grey-300);
  border-radius: var(--border-radius-lg);
  background: var(--color-grey-50);
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: var(--font-size-md);
  color: var(--color-grey-700);
  
  &:hover {
    border-color: #D4882A;
    background: rgba(212,136,42,0.05);
  }
  
  input[type="file"] {
    display: none;
  }
`;

export const FileInputText = styled.span`
  flex: 1;
  text-align: center;
`;

export const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: var(--spacing-md) var(--spacing-xl);
  background: linear-gradient(135deg, #D4882A 0%, #f0a845 100%);
  color: #ffffff;
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  box-shadow: 0 4px 14px rgba(212,136,42,0.3);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #B8711F 0%, #D4882A 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(212,136,42,0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Location Section
export const LocationGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  align-items: center;
  
  @media ${devicesMax.md} {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
`;

export const LocationContent = styled.div`
  h3 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-bold);
    color: var(--color-grey-900);
    margin-bottom: var(--spacing-md);
  }
  
  p {
    font-size: var(--font-size-md);
    color: var(--color-grey-600);
    line-height: 1.7;
    margin-bottom: var(--spacing-sm);
  }
  
  address {
    font-size: var(--font-size-lg);
    color: var(--color-grey-700);
    font-weight: var(--font-semibold);
    font-style: normal;
    margin-top: var(--spacing-md);
  }
`;

export const LocationMap = styled(motion.div)`
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: var(--color-grey-100);
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-400);
  font-size: var(--font-size-lg);
  position: relative;
  
  &::before {
    content: '📍';
    font-size: 4rem;
    position: absolute;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const SectionTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-md);
  text-align: center;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const SectionDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  max-width: 70rem;
  margin: 0 auto var(--spacing-xl);
  line-height: 1.7;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
  }
`;

