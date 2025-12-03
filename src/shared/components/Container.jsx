import styled, { css } from "styled-components";
import { devicesMax } from '../styles/breakpoint';

const Container = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.lg} {
    padding: 0 var(--spacing-lg);
  }

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }

  @media ${devicesMax.sm} {
    padding: 0 var(--spacing-sm);
  }

  ${({ constrained }) => constrained && css`
    max-width: 120rem;

    @media ${devicesMax.md} {
      max-width: 100%;
    }
  `}
`;

export default Container;


