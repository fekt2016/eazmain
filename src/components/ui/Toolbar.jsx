import styled, { css } from 'styled-components';
import { devicesMax } from '../../shared/styles/breakpoint';

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-white-0);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin: var(--space-2xl) 0;
  flex-wrap: wrap;
  gap: var(--space-md);

  @media ${devicesMax.md} {
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-md);
    gap: var(--space-sm);
  }

  ${({ sticky }) => sticky && css`
    position: sticky;
    top: var(--header-height);
    z-index: 10;
    margin-top: 0;
  `}
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-md);

  @media ${devicesMax.md} {
    justify-content: center;
  }
`;

export default Toolbar;
export { Toolbar, ToolbarSection };
