import styled from "styled-components";
import { devicesMax } from "../../styles/breakpoint";

const Flex = styled.div`
  display: flex;
  flex-direction: ${({ $direction }) => $direction || "row"};
  align-items: ${({ $align }) => $align || "stretch"};
  justify-content: ${({ $justify }) => $justify || "flex-start"};
  gap: ${({ $gap }) => $gap || "var(--spacing-md)"};
  flex-wrap: ${({ $wrap }) => $wrap || "nowrap"};
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  
  @media ${devicesMax.sm} {
    flex-direction: ${({ $direction, $directionSm }) => $directionSm || $direction || "column"};
    gap: ${({ $gap }) => $gap || "var(--spacing-sm)"};
  }
`;

export default Flex;

