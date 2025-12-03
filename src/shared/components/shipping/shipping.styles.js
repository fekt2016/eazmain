import styled from 'styled-components';
import { motion } from 'framer-motion';
import { devicesMax } from '../../styles/breakpoint';

// Hero Section
export const HeroSection = styled(motion.section)`
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: var(--color-white-0);
  padding: 6rem 0 4rem;
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
    padding: 4rem 0 3rem;
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
  gap: 1.5rem;
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

// Options Section
export const OptionsSection = styled(motion.section)`
  padding: 6rem 0;
  background: var(--color-white-0);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const OptionsContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const OptionsTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const OptionsDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;

  @media ${devicesMax.lg} {
    grid-template-columns: repeat(2, 1fr);
  }

  @media ${devicesMax.md} {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

export const OptionCard = styled(motion.div)`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-xl);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary-500);
  }

  @media ${devicesMax.md} {
    padding: 2rem;
  }
`;

export const OptionIcon = styled.div`
  width: 4.5rem;
  height: 4.5rem;
  background: ${props => props.$color ? `${props.$color}15` : 'var(--color-primary-500)15'};
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color || 'var(--color-primary-500)'};
  font-size: 2rem;
  flex-shrink: 0;

  @media ${devicesMax.md} {
    width: 4rem;
    height: 4rem;
    font-size: 1.8rem;
  }
`;

export const OptionTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-lg);
  }
`;

export const OptionTimeline = styled.span`
  font-size: var(--font-size-md);
  color: var(--color-primary-600);
  font-weight: var(--font-semibold);
`;

export const OptionText = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
`;

// Steps Section
export const StepsSection = styled(motion.section)`
  padding: 6rem 0;
  background: var(--color-grey-50);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const StepsContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const StepsTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const StepsDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const StepsGrid = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  position: relative;

  @media ${devicesMax.lg} {
    flex-wrap: wrap;
    justify-content: center;
  }

  @media ${devicesMax.md} {
    flex-direction: column;
    gap: 3rem;
  }
`;

export const StepCard = styled(motion.div)`
  flex: 1;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
  position: relative;

  @media ${devicesMax.lg} {
    max-width: 250px;
  }

  @media ${devicesMax.md} {
    max-width: 100%;
    flex-direction: row;
    text-align: left;
  }
`;

export const StepNumber = styled.div`
  position: absolute;
  top: -1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 3rem;
  height: 3rem;
  background: var(--color-primary-500);
  color: var(--color-white-0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-md);
  font-weight: var(--font-bold);
  z-index: 2;

  @media ${devicesMax.md} {
    position: static;
    transform: none;
    flex-shrink: 0;
  }
`;

export const StepIcon = styled.div`
  width: 5rem;
  height: 5rem;
  background: linear-gradient(135deg, #ffc400 0%, #e29800 100%);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  font-size: 2.5rem;
  margin-top: 1rem;

  @media ${devicesMax.md} {
    width: 4rem;
    height: 4rem;
    font-size: 2rem;
    margin-top: 0;
  }
`;

export const StepTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-lg);
  }
`;

export const StepText = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
`;

export const StepConnector = styled.div`
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-grey-300));
  margin-top: 3rem;
  max-width: 100px;

  @media ${devicesMax.lg} {
    display: none;
  }
`;

// Costs Section
export const CostsSection = styled(motion.section)`
  padding: 6rem 0;
  background: var(--color-white-0);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const CostsContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const CostsTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const CostsDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const CostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
  margin-bottom: 3rem;

  @media ${devicesMax.lg} {
    grid-template-columns: repeat(2, 1fr);
  }

  @media ${devicesMax.md} {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

export const CostCard = styled(motion.div)`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-xl);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary-500);
  }

  @media ${devicesMax.md} {
    padding: 2rem;
  }
`;

export const CostType = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;
`;

export const CostAmount = styled.div`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-primary-600);
  margin: 0.5rem 0;
`;

export const CostDetails = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
`;

export const CostNote = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-500);
  text-align: center;
  line-height: 1.6;
  margin: 0;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
`;

// Tracking Section
export const TrackingSection = styled(motion.section)`
  padding: 6rem 0;
  background: var(--color-grey-50);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const TrackingContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const TrackingTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const TrackingDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const TrackingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;

  @media ${devicesMax.lg} {
    grid-template-columns: repeat(2, 1fr);
  }

  @media ${devicesMax.md} {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

export const TrackingCard = styled(motion.div)`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-xl);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary-500);
  }

  @media ${devicesMax.md} {
    padding: 2rem;
  }
`;

export const TrackingIcon = styled.div`
  width: 4.5rem;
  height: 4.5rem;
  background: linear-gradient(135deg, #ffc400 0%, #e29800 100%);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  font-size: 2rem;
  flex-shrink: 0;

  @media ${devicesMax.md} {
    width: 4rem;
    height: 4rem;
    font-size: 1.8rem;
  }
`;

export const TrackingCardTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-lg);
  }
`;

export const TrackingText = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
  flex: 1;
`;

export const TrackingButton = styled(motion.button)`
  padding: 1rem 2rem;
  background: var(--color-primary-500);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all var(--transition-base);
  margin-top: auto;

  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);
  }
`;

// FAQ Section
export const FAQSection = styled.section`
  padding: 6rem 0;
  background: var(--color-white-0);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const FAQContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const FAQTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const FAQDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FAQItem = styled.div`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--color-primary-500);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

export const FAQQuestion = styled.button`
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-base);

  span {
    font-size: var(--font-size-md);
    font-weight: var(--font-semibold);
    color: var(--color-grey-900);
    flex: 1;
  }

  &:hover {
    background: var(--color-grey-50);
  }
`;

export const FAQIcon = styled.div`
  color: var(--color-grey-600);
  font-size: 1.2rem;
  transition: transform var(--transition-base);
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  flex-shrink: 0;
`;

export const FAQAnswer = styled(motion.div)`
  padding: 0 2rem 2rem;
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
  overflow: hidden;
`;

