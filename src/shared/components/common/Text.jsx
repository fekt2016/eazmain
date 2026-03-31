import styled, { css } from "styled-components";
import { devicesMax } from "../../styles/breakpoint";
import { textVariants } from "../../styles/variants";

const variantStyles = Object.fromEntries(
  Object.entries(textVariants).map(([key, v]) => [
    key,
    css`
      font-size: ${v.fontSize} !important;
      color: ${v.color} !important;
      font-weight: ${v.fontWeight} !important;
    `,
  ])
);

const Text = styled.p`
  line-height: 1.5;
  margin: 0;
  font-weight: ${({ $weight }) => $weight || 400};
  font-size: ${({ $size }) => $size || "var(--font-size-md)"};
  color: ${({ $color }) => $color || "var(--color-grey-700)"};

  ${({ $variant }) => $variant && variantStyles[$variant]}
  
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

