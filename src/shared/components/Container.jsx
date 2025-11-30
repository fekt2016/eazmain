import styled from "styled-components";
import { devicesMax } from '../styles/breakpoint';

const Container = styled.div`
  width: 100%;
  max-width: 120rem;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);

  @media ${devicesMax.md} {
    padding: 0 var(--spacing-md);
  }

  @media ${devicesMax.sm} {
    padding: 0 var(--spacing-sm);
  }
`;

export default Container;


