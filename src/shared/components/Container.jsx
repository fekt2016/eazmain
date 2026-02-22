import styled, { css } from "styled-components";
import { devicesMax } from '../styles/breakpoint';

const Container = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;

  ${({ constrained }) => constrained && css`
    max-width: 1200px;
  `}
`;

export default Container;


