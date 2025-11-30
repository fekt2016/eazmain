import styled from "styled-components";
import { devicesMax } from '../styles/breakpoint';

const Section = styled.section`
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  background: var(--color-white-0);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);

  @media ${devicesMax.sm} {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export default Section;


