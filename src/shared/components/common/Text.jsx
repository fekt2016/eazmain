import styled from "styled-components";
import { devicesMax } from "../../styles/breakpoint";

const Text = styled.p`
  font-weight: ${({ $weight }) => $weight || 400};
  font-size: ${({ $size }) => $size || "var(--font-size-md)"};
  color: ${({ $color }) => $color || "var(--color-grey-700)"};
  line-height: 1.5;
  margin: 0;
  
  ${({ $truncate }) =>
    $truncate &&
    `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}
  
  ${({ $center }) => $center && "text-align: center;"}
  ${({ $bold }) => $bold && "font-weight: 600;"}
  
  @media ${devicesMax.sm} {
    font-size: ${({ $size }) => $size || "var(--font-size-sm)"};
  }
`;

export default Text;

