import styled from 'styled-components';

const SectionTitle = styled.h2`
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin-bottom: var(--space-lg);
  text-align: center;

  ${({ variant }) => variant === 'small' && css`
    font-size: var(--text-lg);
    margin-bottom: var(--space-md);
  `}

  ${({ variant }) => variant === 'large' && css`
    font-size: var(--text-3xl);
    margin-bottom: var(--space-xl);
  `}

  ${({ align }) => align === 'left' && css`
    text-align: left;
  `}

  ${({ align }) => align === 'right' && css`
    text-align: right;
  `}

  ${({ noMargin }) => noMargin && css`
    margin-bottom: 0;
  `}
`;

export default SectionTitle;
