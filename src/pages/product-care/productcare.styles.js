import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { devicesMax } from '../../shared/styles/breakpoint';

/**
 * Product Care — editorial layout aligned with Saiisai brand (gold / navy / warm neutrals)
 */

export const ProductCareContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, var(--color-black-100, #f9fafb) 0%, var(--color-white-0) 18%);
  overflow-x: hidden;
`;

export const BreadcrumbBar = styled.nav`
  max-width: 112rem;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-lg) 0;
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);

  @media ${devicesMax.md} {
    padding: var(--spacing-md) var(--spacing-md) 0;
  }
`;

export const BreadcrumbLink = styled.span`
  a {
    color: var(--color-grey-600);
    text-decoration: none;
    transition: color var(--transition-base);

    &:hover {
      color: var(--color-primary-600);
    }
  }
`;

export const BreadcrumbSep = styled.span`
  margin: 0 var(--spacing-xs);
  color: var(--color-grey-400);
`;

export const HeroSection = styled(motion.section)`
  position: relative;
  padding: var(--spacing-3xl) var(--spacing-lg) var(--spacing-2xl);
  text-align: center;
  overflow: hidden;
  background: linear-gradient(
    165deg,
    var(--primary-50) 0%,
    var(--color-white-0) 42%,
    #f7f4ef 100%
  );
  border-bottom: 1px solid var(--color-grey-200);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 50% -20%, rgba(212, 136, 42, 0.12), transparent 55%),
      radial-gradient(circle at 90% 80%, rgba(26, 31, 46, 0.04), transparent 40%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.35;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4882A' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md) var(--spacing-xl);
  }
`;

export const HeroInner = styled.div`
  max-width: 72rem;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

export const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 0.5rem 1.2rem;
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-primary-700);
  background: var(--color-white-0);
  border: 1px solid rgba(212, 136, 42, 0.35);
  border-radius: 999px;
  box-shadow: var(--shadow-sm);
`;

export const HeroIcon = styled(motion.div)`
  font-size: 3.2rem;
  color: var(--color-primary-500);
  margin-bottom: var(--spacing-md);
  display: flex;
  justify-content: center;
  filter: drop-shadow(0 4px 12px rgba(212, 136, 42, 0.2));

  @media ${devicesMax.md} {
    font-size: 2.6rem;
  }
`;

export const HeroTitle = styled(motion.h1)`
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: var(--font-bold);
  color: var(--color-navy, #1a1f2e);
  margin: 0 0 var(--spacing-md);
  line-height: 1.15;
  letter-spacing: -0.02em;
`;

export const HeroSubtitle = styled(motion.p)`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  max-width: 38rem;
  margin: 0 auto var(--spacing-xl);
  line-height: 1.65;

  @media ${devicesMax.sm} {
    font-size: var(--font-size-md);
  }
`;

export const HeroActions = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  justify-content: center;
  margin-bottom: var(--spacing-2xl);
`;

export const HeroPrimaryButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 1rem 1.75rem;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-700) 100%);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(212, 136, 42, 0.35);
  transition: box-shadow var(--transition-base), transform var(--transition-base);

  &:hover {
    box-shadow: 0 6px 20px rgba(212, 136, 42, 0.45);
  }

  svg {
    font-size: 1.1rem;
  }
`;

export const HeroSecondaryLink = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 1rem 1.5rem;
  color: var(--color-navy, #1a1f2e);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  text-decoration: none;
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--color-grey-300);
  background: var(--color-white-0);
  transition:
    border-color var(--transition-base),
    background var(--transition-base);

  &:hover {
    border-color: var(--color-primary-500);
    background: var(--primary-50);
  }
`;

export const HeroStats = styled(motion.ul)`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-lg);
  list-style: none;
  margin: 0;
  padding: var(--spacing-lg) 0 0;
  border-top: 1px solid rgba(212, 136, 42, 0.15);
`;

export const HeroStat = styled.li`
  text-align: center;
  min-width: 9rem;
`;

export const HeroStatValue = styled.span`
  display: block;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-primary-600);
  line-height: 1.2;
`;

export const HeroStatLabel = styled.span`
  display: block;
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-grey-500);
  margin-top: 0.25rem;
`;

export const SectionDivider = styled.div`
  height: 1px;
  max-width: 112rem;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, var(--color-grey-200), transparent);
`;

export const SectionWrapper = styled(motion.section)`
  padding: var(--spacing-3xl) var(--spacing-lg);
  max-width: 112rem;
  margin: 0 auto;

  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const SectionIntro = styled.div`
  text-align: center;
  max-width: 40rem;
  margin: 0 auto var(--spacing-2xl);
`;

export const SectionEyebrow = styled.p`
  font-size: var(--font-size-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-primary-600);
  margin: 0 0 var(--spacing-sm);
`;

export const SectionTitle = styled.h2`
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: var(--font-bold);
  color: var(--color-navy, #1a1f2e);
  margin: 0 0 var(--spacing-md);
  line-height: 1.2;
`;

export const SectionDescription = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  margin: 0;
  line-height: 1.65;
`;

export const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
  gap: var(--spacing-lg);
`;

export const CategoryCard = styled(motion.button)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  width: 100%;
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
  font: inherit;
  color: inherit;

  &:hover {
    border-color: rgba(212, 136, 42, 0.55);
    box-shadow: var(--shadow-md);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
`;

export const CategoryIcon = styled.div`
  width: 5.6rem;
  height: 5.6rem;
  border-radius: 1.2rem;
  background: ${(props) => props.$bgColor || 'var(--color-primary-50)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
  color: ${(props) => props.$iconColor || 'var(--color-primary-500)'};
  font-size: 2rem;
  transition: transform 0.2s ease;
`;

export const CategoryTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin: 0 0 var(--spacing-xs);
  line-height: 1.3;
`;

export const CategoryDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  line-height: 1.55;
  margin: 0 0 var(--spacing-md);
  flex: 1;
`;

export const CategoryCardFooter = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-primary-600);

  svg {
    font-size: 0.85rem;
    transition: transform 0.2s ease;
  }

  ${CategoryCard}:hover & svg {
    transform: translateY(2px);
  }
`;

export const DetailedSectionBand = styled.div`
  background: linear-gradient(180deg, var(--color-grey-50) 0%, var(--color-white-0) 100%);
  border-top: 1px solid var(--color-grey-200);
  border-bottom: 1px solid var(--color-grey-200);
`;

export const CareSection = styled(motion.section)`
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-2xl);
  background: var(--color-white-0);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--color-grey-200);
  box-shadow: var(--shadow-sm);

  &:last-of-type {
    margin-bottom: 0;
  }

  @media ${devicesMax.md} {
    padding: var(--spacing-xl);
  }
`;

export const CareSectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-grey-100);

  @media ${devicesMax.sm} {
    flex-direction: column;
    text-align: center;
  }
`;

export const CareSectionIcon = styled.div`
  width: 5.6rem;
  height: 5.6rem;
  border-radius: 1.2rem;
  background: ${(props) => props.$bgColor || 'var(--color-primary-50)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$iconColor || 'var(--color-primary-500)'};
  font-size: 1.85rem;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
`;

export const CareSectionTitle = styled.h3`
  font-size: clamp(1.35rem, 2.5vw, 1.65rem);
  font-weight: var(--font-bold);
  color: var(--color-navy, #1a1f2e);
  margin: 0;
`;

export const CareTipsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--spacing-md);

  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

export const CareTip = styled.li`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border-left: 3px solid var(--color-primary-500);
`;

export const CareTipMark = styled.span`
  flex-shrink: 0;
  width: 1.35rem;
  height: 1.35rem;
  margin-top: 0.15rem;
  border-radius: 50%;
  background: rgba(212, 136, 42, 0.15);
  color: var(--color-primary-700);
  font-size: 0.75rem;
  font-weight: var(--font-bold);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CareTipText = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-700);
  line-height: 1.65;
  margin: 0;
`;

export const FAQSection = styled(motion.section)`
  padding: var(--spacing-3xl) var(--spacing-lg);
  max-width: 112rem;
  margin: 0 auto;

  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
`;

export const FAQList = styled.div`
  max-width: 48rem;
  margin: 0 auto;
`;

export const FAQItem = styled(motion.div)`
  margin-bottom: var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
  background: var(--color-white-0);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

export const FAQToggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: var(--color-grey-900);

  &:hover {
    background: var(--color-grey-50);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: -2px;
  }
`;

export const FAQQuestionText = styled.span`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  line-height: 1.45;
  padding-right: var(--spacing-sm);
`;

export const FAQChevronWrap = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  color: var(--color-primary-600);
  transition: transform 0.2s ease;
  transform: rotate(${(props) => (props.$open ? '180deg' : '0deg')});

  svg {
    font-size: 0.95rem;
  }
`;

export const FAQAnswerPanel = styled.div`
  padding: 0 var(--spacing-lg) var(--spacing-lg);
  border-top: 1px solid var(--color-grey-100);
`;

export const FAQAnswer = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-grey-600);
  line-height: 1.65;
  margin: var(--spacing-md) 0 0;
`;

export const CTASection = styled(motion.section)`
  background: linear-gradient(135deg, var(--color-navy, #1a1f2e) 0%, #2d3548 100%);
  padding: var(--spacing-3xl) var(--spacing-lg);
  text-align: center;
  color: var(--color-white-0);
  margin: var(--spacing-2xl) var(--spacing-lg) var(--spacing-3xl);
  max-width: 112rem;
  margin-left: auto;
  margin-right: auto;
  border-radius: var(--border-radius-xl);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-lg);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 50%, rgba(212, 136, 42, 0.15), transparent 50%);
    pointer-events: none;
  }

  @media ${devicesMax.md} {
    padding: var(--spacing-2xl) var(--spacing-md);
    margin: var(--spacing-xl) var(--spacing-md) var(--spacing-2xl);
  }
`;

export const CTAInner = styled.div`
  position: relative;
  z-index: 1;
`;

export const CTATitle = styled.h2`
  font-size: clamp(1.65rem, 3vw, 2.25rem);
  font-weight: var(--font-bold);
  margin: 0 0 var(--spacing-md);
`;

export const CTASubtitle = styled.p`
  font-size: var(--font-size-md);
  margin: 0 auto var(--spacing-xl);
  opacity: 0.88;
  max-width: 36rem;
  line-height: 1.6;
`;

export const CTAButtons = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
`;

const ctaButtonStyles = css`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  text-decoration: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
  border: 2px solid transparent;

  svg {
    font-size: 1.05rem;
  }
`;

export const CTAButton = styled(motion.a)`
  ${ctaButtonStyles}
  background: linear-gradient(135deg, #ffc400 0%, var(--color-primary-600) 100%);
  color: var(--color-navy, #1a1f2e);
  box-shadow: 0 4px 14px rgba(255, 196, 0, 0.35);

  &:hover {
    box-shadow: 0 6px 20px rgba(255, 196, 0, 0.45);
  }
`;

export const CTAButtonOutline = styled(motion.a)`
  ${ctaButtonStyles}
  background: transparent;
  color: var(--color-white-0);
  border-color: rgba(255, 255, 255, 0.45);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.65);
  }
`;
