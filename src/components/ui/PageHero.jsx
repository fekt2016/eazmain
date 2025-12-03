import styled, { css } from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

const PageHero = styled.section`
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  text-align: center;
  padding: var(--space-2xl) var(--space-xl);
  margin-bottom: var(--space-xl);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  position: relative;
  overflow: hidden;

  @media ${devicesMax.md} {
    padding: var(--space-xl) var(--space-md);
  }

  ${({ variant }) => variant === 'light' && css`
    background: var(--color-grey-50);
    color: var(--color-grey-900);
  `}
`;

const HeroTitle = styled.h1`
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-md) 0;
  letter-spacing: -0.02em;

  @media ${devicesMax.md} {
    font-size: var(--text-3xl);
  }
`;

const HeroSubtitle = styled.p`
  font-size: var(--text-lg);
  opacity: 0.95;
  max-width: 600px;
  margin: 0 auto var(--space-lg) auto;

  @media ${devicesMax.md} {
    font-size: var(--text-base);
  }
`;

const PageHeroComponent = ({ title, subtitle, children, variant = 'default' }) => {
  return (
    <PageHero variant={variant}>
      <HeroTitle>{title}</HeroTitle>
      {subtitle && <HeroSubtitle>{subtitle}</HeroSubtitle>}
      {children}
    </PageHero>
  );
};

export default PageHeroComponent;
export { HeroTitle, HeroSubtitle };
