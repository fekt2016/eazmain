import styled, { css } from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-xl);
  max-width: 100%;

  @media ${devicesMax.lg} {
    padding: 0 var(--space-lg);
  }

  @media ${devicesMax.md} {
    padding: 0 var(--space-md);
  }

  @media ${devicesMax.sm} {
    padding: 0 var(--space-sm);
  }

  ${({ constrained }) => constrained && css`
    max-width: 1200px;

    @media ${devicesMax.lg} {
      max-width: 1000px;
    }

    @media ${devicesMax.md} {
      max-width: 800px;
    }

    @media ${devicesMax.sm} {
      max-width: 100%;
    }
  `}

  ${({ center }) => center && css`
    text-align: center;
  `}
`;

export default Container;
