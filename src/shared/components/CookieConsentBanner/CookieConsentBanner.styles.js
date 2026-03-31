import styled from 'styled-components';
import { devicesMax } from '../../styles/breakpoint';

export const Overlay = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: var(--spacing-lg);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

export const Banner = styled.div`
  max-width: 48rem;
  width: 100%;
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg, 0.75rem);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-grey-200);
  overflow: hidden;

  @media ${devicesMax.sm} {
    max-width: 100%;
  }
`;

export const BannerContent = styled.div`
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);

  @media ${devicesMax.sm} {
    padding: var(--spacing-lg);
  }
`;

export const BannerText = styled.div``;

export const BannerTitle = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: var(--font-bold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-xs);

  @media ${devicesMax.sm} {
    font-size: var(--font-size-md);
  }
`;

export const BannerDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-700);
  line-height: 1.6;
  margin: 0;

  a {
    color: var(--primary-600, var(--color-primary-500));
    text-decoration: underline;
    font-weight: 500;

    &:hover {
      color: var(--primary-700, var(--color-primary-600));
    }
  }
`;

export const BannerActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
`;

export const PrimaryButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-md, 0.5rem);
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;

  &:hover {
    opacity: 0.95;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const SecondaryButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-white-0);
  color: var(--color-grey-700);
  border: 2px solid var(--color-grey-300);
  border-radius: var(--border-radius-md, 0.5rem);
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: var(--color-grey-50);
    border-color: var(--color-grey-400);
  }
`;

export const TertiaryButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  color: var(--primary-600, var(--color-primary-500));
  border: none;
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  text-decoration: underline;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

export const CustomizePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-grey-200);
`;

export const CustomizeRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  small {
    font-size: var(--font-size-xs);
    color: var(--color-grey-500);
    margin-left: 1.75rem;
  }
`;

export const CustomizeLabel = styled.label`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-grey-800);
  cursor: pointer;
  font-weight: 500;
`;

export const CustomizeCheckbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: var(--primary-500);
`;
