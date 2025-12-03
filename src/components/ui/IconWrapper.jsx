import styled from 'styled-components';
import { css } from 'styled-components';

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  cursor: pointer;

  svg {
    font-size: 1.2rem;
  }

  ${({ size }) => size === 'sm' && css`
    width: 32px;
    height: 32px;

    svg {
      font-size: 1rem;
    }
  `}

  ${({ size }) => size === 'lg' && css`
    width: 48px;
    height: 48px;

    svg {
      font-size: 1.4rem;
    }
  `}

  ${({ color }) => color && css`
    color: ${color === 'primary' ? 'var(--color-primary-500)' : 
            color === 'secondary' ? 'var(--color-grey-600)' : 
            color === 'success' ? 'var(--color-green-700)' : 
            color === 'error' ? 'var(--color-red-600)' : 
            color};

    &:hover {
      background: var(--color-grey-100);
    }
  `}

  ${({ background }) => background && css`
    background: var(--color-grey-50);

    &:hover {
      background: var(--color-grey-100);
    }
  `}

  ${({ clickable }) => clickable && css`
    &:hover {
      transform: scale(1.05);
    }
  `}
`;

export default IconWrapper;
