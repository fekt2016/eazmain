import styled from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

export const NewArrivalsPageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-grey-50);
  padding-bottom: 4rem;
`;

export const ContentContainer = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;

  @media ${devicesMax.md} {
    padding: 0;
  }
`;

