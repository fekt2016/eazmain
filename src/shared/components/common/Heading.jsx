import styled from "styled-components";
import { devicesMax } from "../../styles/breakpoint";

const Heading = styled.h1`
  font-weight: ${({ $weight }) => $weight || 500};
  font-size: ${({ $size, $as }) => {
    if ($size) return $size;
    const sizes = {
      h1: "var(--font-size-3xl)",
      h2: "var(--font-size-2xl)",
      h3: "var(--font-size-xl)",
      h4: "var(--font-size-lg)",
      h5: "var(--font-size-md)",
      h6: "var(--font-size-sm)",
    };
    return sizes[$as || "h1"];
  }};
  color: ${({ $color }) => $color || "var(--color-grey-900)"};
  line-height: 1.2;
  margin: 0;
  
  @media ${devicesMax.sm} {
    font-size: ${({ $size, $as }) => {
      if ($size) return `calc(${$size} * 0.9)`;
      const sizes = {
        h1: "var(--font-size-2xl)",
        h2: "var(--font-size-xl)",
        h3: "var(--font-size-lg)",
        h4: "var(--font-size-md)",
        h5: "var(--font-size-sm)",
        h6: "var(--font-size-xs)",
      };
      return sizes[$as || "h1"];
    }};
  }
`;

export default Heading;

