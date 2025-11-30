import styled from "styled-components";
import { devicesMax } from "../../styles/breakpoint";

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${({ $cols }) => $cols || "repeat(auto-fit, minmax(250px, 1fr))"};
  gap: ${({ $gap }) => $gap || "var(--spacing-lg)"};
  width: 100%;
  
  @media ${devicesMax.md} {
    grid-template-columns: ${({ $cols, $colsMd }) => $colsMd || "repeat(auto-fit, minmax(200px, 1fr))"};
    gap: ${({ $gap }) => $gap || "var(--spacing-md)"};
  }
  
  @media ${devicesMax.sm} {
    grid-template-columns: ${({ $cols, $colsMd, $colsSm }) => $colsSm || "1fr"};
    gap: ${({ $gap }) => $gap || "var(--spacing-sm)"};
  }
`;

export default Grid;

