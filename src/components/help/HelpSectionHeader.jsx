import styled from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  
  @media ${devicesMax.md} {
    margin-bottom: var(--spacing-xl);
  }
`;

const Title = styled.h2`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-md);
  font-family: var(--font-heading);
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-2xl);
  }
  
  @media ${devicesMax.sm} {
    font-size: var(--font-size-xl);
  }
`;

const Subtitle = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-grey-600);
  max-width: 70rem;
  margin: 0 auto;
  line-height: 1.6;
  
  @media ${devicesMax.md} {
    font-size: var(--font-size-base);
  }
`;

const HelpSectionHeader = ({ title, subtitle }) => {
  return (
    <SectionHeader>
      {title && <Title>{title}</Title>}
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </SectionHeader>
  );
};

export default HelpSectionHeader;

