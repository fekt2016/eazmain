import styled from "styled-components";

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => $size || "2.4rem"};
  height: ${({ $size }) => $size || "2.4rem"};
  color: ${({ $color }) => $color || "var(--color-grey-700)"};
  transition: var(--transition-base);
  
  ${({ $hover }) =>
    $hover &&
    `
    &:hover {
      color: var(--color-primary-500);
      transform: scale(1.1);
    }
  `}
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

export default IconWrapper;

