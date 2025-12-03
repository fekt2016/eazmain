import styled from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

export const NewArrivalsPageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-grey-50);
  padding-bottom: 4rem;
`;

export const ContentContainer = styled.div`
  max-width: 140rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }
`;

