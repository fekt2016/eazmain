import styled from 'styled-components';
import { motion } from 'framer-motion';
import { devicesMax } from '../../styles/breakpoint';

// Hero Section
export const HeroSection = styled(motion.section)`
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: var(--color-white-0);
  padding: 8rem 0 6rem;
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
    padding: 5rem 0 4rem;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media ${devicesMax.md} {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
`;

export const HeroLeft = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

export const HeroButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-top: 1rem;

  @media ${devicesMax.md} {
    justify-content: center;
  }
`;

export const HeroButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 2.4rem;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;

  svg {
    font-size: 1.4rem;
  }
`;

export const HeroButtonPrimary = styled(HeroButton)`
  background: linear-gradient(135deg, #ffc400 0%, #e29800 100%);
  color: var(--color-white-0);
  box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);

  &:hover {
    box-shadow: 0 6px 20px rgba(255, 196, 0, 0.4);
  }
`;

export const HeroButtonSecondary = styled(HeroButton)`
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white-0);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

export const HeroRight = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const HeroIllustration = styled.div`
  width: 100%;
  max-width: 400px;
  height: 400px;

  svg {
    width: 100%;
    height: 100%;
  }

  @media ${devicesMax.md} {
    max-width: 300px;
    height: 300px;
  }
`;

// Why Section
export const WhySection = styled(motion.section)`
  padding: 6rem 0;
  background: var(--color-white-0);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const WhyContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const WhyTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const WhyDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const WhyGrid = styled.div`
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

export const WhyCard = styled(motion.div)`
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

export const WhyCardIcon = styled.div`
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

export const WhyCardTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-lg);
  }
`;

export const WhyCardText = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
`;

// Categories Section
export const CategoriesSection = styled(motion.section)`
  padding: 6rem 0;
  background: var(--color-grey-50);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const CategoriesContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const CategoriesTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const CategoriesDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const CategoriesGrid = styled.div`
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

export const CategoryCard = styled(motion.div)`
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

export const CategoryIcon = styled.div`
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

export const CategoryTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-lg);
  }
`;

export const CategoryText = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
  flex: 1;
`;

export const CategoryButton = styled(motion.button)`
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

// How It Works Section
export const HowItWorksSection = styled(motion.section)`
  padding: 6rem 0;
  background: var(--color-white-0);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const HowItWorksContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const HowItWorksTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const HowItWorksDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const StepsContainer = styled.div`
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

export const StepDescription = styled.p`
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

// Requirements Section
export const RequirementsSection = styled(motion.section)`
  padding: 6rem 0;
  background: var(--color-grey-50);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const RequirementsContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const RequirementsTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const RequirementsDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const RequirementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;

  @media ${devicesMax.md} {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
`;

export const RequirementItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.5rem;
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--color-primary-500);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

export const RequirementIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  background: var(--color-green-700);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  font-size: 1.2rem;
  flex-shrink: 0;
`;

export const RequirementText = styled.span`
  font-size: var(--font-size-md);
  color: var(--color-grey-700);
  font-weight: var(--font-medium);
`;

// CTA Section
export const CTASection = styled(motion.section)`
  padding: 6rem 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: var(--color-white-0);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 80% 20%, rgba(255, 196, 0, 0.1) 0%, transparent 50%);
  }

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const CTAContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  position: relative;
  z-index: 1;

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const CTATitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-white-0);
  margin: 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const CTASubtitle = styled.p`
  font-size: var(--font-size-lg);
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
  }
`;

export const CTAButtons = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

export const CTAButtonPrimary = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.4rem 3rem;
  background: linear-gradient(135deg, #ffc400 0%, #e29800 100%);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);

  svg {
    font-size: 1.2rem;
  }

  &:hover {
    box-shadow: 0 6px 20px rgba(255, 196, 0, 0.4);
  }
`;

export const CTAButtonSecondary = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.4rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white-0);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all var(--transition-base);

  svg {
    font-size: 1.2rem;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

