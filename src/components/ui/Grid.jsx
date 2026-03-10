import styled, { css } from 'styled-components';
import { devicesMax, devicesMin } from '../../shared/styles/breakpoint';

const Grid = styled.div`
  display: grid;
  gap: var(--space-md);
  width: 100%;

  ${({ columns }) => {
    if (typeof columns === 'number') {
      return css`
        grid-template-columns: repeat(${columns}, 1fr);

        @media (max-width: 900px) {
          grid-template-columns: repeat(3, 1fr);
        }

        @media ${devicesMax.md} {
          grid-template-columns: repeat(2, 1fr);
        }

        @media ${devicesMax.xs} {
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-xs);
        }
      `;
    }
    return '';
  }}

  ${({ responsiveColumns }) => responsiveColumns && css`
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));

    @media (max-width: 900px) {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }

    @media ${devicesMax.md} {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-sm);
    }

    @media ${devicesMax.xs} {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-xs);
    }
  `}

  ${({ gap }) => gap && css`
    gap: ${gap === 'sm' ? 'var(--space-sm)' :
      gap === 'lg' ? 'var(--space-lg)' :
        gap === 'xl' ? 'var(--space-xl)' :
          'var(--space-md)'};
  `}

  ${({ justifyItems }) => justifyItems && css`
    justify-items: ${justifyItems};
  `}

  ${({ alignItems }) => alignItems && css`
    align-items: ${alignItems};
  `}
`;

export default Grid;
