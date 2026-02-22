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
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
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

export const HeroButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1.4rem 3rem;
  background: linear-gradient(135deg, #ffc400 0%, #e29800 100%);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);
  margin: 1rem auto 0;

  svg {
    font-size: 1.2rem;
  }

  &:hover {
    box-shadow: 0 6px 20px rgba(255, 196, 0, 0.4);
  }
`;

// Culture Section
export const CultureSection = styled(motion.section)`
  padding: 6rem 0;
  background: var(--color-white-0);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const CultureContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const CultureTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const CultureDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const CultureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;

  @media ${devicesMax.md} {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

export const CultureCard = styled(motion.div)`
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

export const CultureIcon = styled.div`
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

export const CultureCardTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-lg);
  }
`;

export const CultureCardText = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
`;

// Benefits Section
export const BenefitsSection = styled(motion.section)`
  padding: 6rem 0;
  background: var(--color-grey-50);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const BenefitsContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const BenefitsTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const BenefitsDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;

  @media ${devicesMax.lg} {
    grid-template-columns: repeat(3, 1fr);
  }

  @media ${devicesMax.md} {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const BenefitCard = styled(motion.div)`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary-500);
  }

  @media ${devicesMax.md} {
    padding: 1.5rem;
  }
`;

export const BenefitIcon = styled.div`
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #ffc400 0%, #e29800 100%);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  font-size: 1.8rem;
  flex-shrink: 0;

  @media ${devicesMax.md} {
    width: 3.5rem;
    height: 3.5rem;
    font-size: 1.6rem;
  }
`;

export const BenefitTitle = styled.h3`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0;
`;

// Departments Section
export const DepartmentsSection = styled(motion.section)`
  padding: 6rem 0;
  background: var(--color-white-0);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const DepartmentsContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const DepartmentsTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const DepartmentsDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const DepartmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;

  @media ${devicesMax.lg} {
    grid-template-columns: repeat(3, 1fr);
  }

  @media ${devicesMax.md} {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const DepartmentCard = styled(motion.div)`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-xl);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  transition: all var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary-500);
  }

  @media ${devicesMax.md} {
    padding: 1.5rem;
  }
`;

export const DepartmentIcon = styled.div`
  width: 4rem;
  height: 4rem;
  background: ${props => props.$color ? `${props.$color}15` : 'var(--color-primary-500)15'};
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color || 'var(--color-primary-500)'};
  font-size: 2rem;
  flex-shrink: 0;

  @media ${devicesMax.md} {
    width: 3.5rem;
    height: 3.5rem;
    font-size: 1.8rem;
  }
`;

export const DepartmentTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
  }
`;

export const DepartmentText = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
  flex: 1;
`;

export const DepartmentButton = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  background: var(--color-primary-500);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  margin-top: auto;

  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);
  }
`;

// Jobs Section
export const JobsSection = styled.section`
  padding: 6rem 0;
  background: var(--color-grey-50);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const JobsContainer = styled(motion.div)`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const JobsTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const JobsDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const JobsGrid = styled.div`
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

// Job Card
export const JobCardContainer = styled(motion.div)`
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
    border-color: var(--color-primary-500);
  }

  @media ${devicesMax.md} {
    padding: 2rem;
  }
`;

export const JobHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const JobTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-lg);
  }
`;

export const JobDepartment = styled.span`
  font-size: var(--font-size-sm);
  color: var(--primary-700);
  font-weight: var(--font-semibold);
`;

export const JobDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

export const JobDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

export const JobDetailIcon = styled.div`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  flex-shrink: 0;
`;

export const JobDetailText = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
`;

export const JobDescription = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
  flex: 1;
`;

export const JobButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1rem 2rem;
  background: var(--color-primary-500);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  margin-top: auto;

  svg {
    font-size: 1rem;
  }

  &:hover {
    background: var(--color-primary-600);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);
  }
`;

// Life Section
export const LifeSection = styled(motion.section)`
  padding: 6rem 0;
  background: var(--color-white-0);

  @media ${devicesMax.md} {
    padding: 4rem 0;
  }
`;

export const LifeContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

export const LifeTitle = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  text-align: center;
  margin: 0 0 1rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
`;

export const LifeDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  text-align: center;
  margin: 0 0 4rem 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-md);
    margin-bottom: 3rem;
  }
`;

export const LifeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;

  @media ${devicesMax.md} {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

export const LifeCard = styled(motion.div)`
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

export const LifeIcon = styled.div`
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

export const LifeCardTitle = styled.h3`
  font-size: var(--font-size-xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0;

  @media ${devicesMax.md} {
    font-size: var(--font-size-lg);
  }
`;

export const LifeCardText = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.6;
  margin: 0;
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

