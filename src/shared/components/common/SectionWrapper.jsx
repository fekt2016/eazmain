import styled from "styled-components";
import { devicesMax } from "../../styles/breakpoint";

const SectionWrapper = styled.section`
  padding: ${({ $padding }) => $padding || "var(--spacing-xl)"};
  margin-bottom: ${({ $marginBottom }) => $marginBottom || "var(--spacing-lg)"};
  background: ${({ $bg }) => $bg || "var(--color-white-0)"};
  border-radius: ${({ $radius }) => $radius || "var(--border-radius-md)"};
  box-shadow: ${({ $shadow }) => $shadow || "var(--shadow-md)"};
  width: 100%;
  
  @media ${devicesMax.sm} {
    padding: ${({ $padding }) => $padding || "var(--spacing-md)"};
    margin-bottom: ${({ $marginBottom }) => $marginBottom || "var(--spacing-md)"};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export default SectionWrapper;

