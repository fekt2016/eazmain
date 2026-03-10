import styled, { css } from "styled-components";
import { devicesMax } from '../styles/breakpoint';

const Container = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 2rem;

  ${({ constrained }) => constrained && css`
    max-width: 1400px;
  `}
`;

export default Container;


