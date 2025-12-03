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

        @media (max-width: 1400px) {
          grid-template-columns: repeat(3, 1fr);
        }

        @media ${devicesMax.md} {
          grid-template-columns: repeat(2, 1fr);
        }

        @media ${devicesMax.sm} {
          grid-template-columns: 1fr;
        }
      `;
    }
    return '';
  }}

  ${({ responsiveColumns }) => responsiveColumns && css`
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

    @media ${devicesMax.lg} {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }

    @media ${devicesMax.md} {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }

    @media ${devicesMax.sm} {
      grid-template-columns: 1fr;
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
