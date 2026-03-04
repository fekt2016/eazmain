import styled, { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ $zIndex }) => $zIndex};
  animation: ${fadeIn} 0.2s ease-out;
`;

export const ModalContainer = styled.div`
  background: #ffffff;
  color: #1f2937;
  border-radius: ${({ $theme }) => $theme?.borderRadius || '1.2rem'};
  width: 90%;
  max-width: 420px;
  padding: 2.4rem;
  box-shadow: ${({ $theme }) => $theme?.shadow || '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'};
  animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  position: relative;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 50%;
  flex-shrink: 0;
  font-size: 2rem;
  font-weight: bold;
  
  ${({ $type, $theme }) => {
        switch ($type) {
            case 'success':
                return css`
          background-color: ${$theme?.successColor ? `${$theme.successColor}20` : '#d1fae5'};
          color: ${$theme?.successColor || '#10b981'};
        `;
            case 'error':
                return css`
          background-color: ${$theme?.dangerColor ? `${$theme.dangerColor}20` : '#fee2e2'};
          color: ${$theme?.dangerColor || '#ef4444'};
        `;
            case 'warning':
                return css`
          background-color: ${$theme?.warningColor ? `${$theme.warningColor}20` : '#fef3c7'};
          color: ${$theme?.warningColor || '#f59e0b'};
        `;
            case 'confirm':
            case 'alert':
            default:
                return css`
          background-color: ${$theme?.primaryColor ? `${$theme.primaryColor}20` : '#e0f2fe'};
          color: ${$theme?.primaryColor || '#0ea5e9'};
        `;
        }
    }}
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #111827;
`;

export const Message = styled.div`
  font-size: 1.4rem;
  color: #4b5563;
  line-height: 1.6;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  margin-top: 0.8rem;
`;

const BaseButton = styled.button`
  padding: 1rem 2rem;
  border-radius: ${({ $theme }) => $theme?.borderRadius || '0.8rem'};
  font-size: 1.4rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 8rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const CancelButton = styled(BaseButton)`
  background-color: #f3f4f6;
  color: #374151;

  &:hover:not(:disabled) {
    background-color: #e5e7eb;
  }
`;

export const ConfirmButton = styled(BaseButton)`
  ${({ $type, $theme }) => {
        switch ($type) {
            case 'error':
                return css`
          background-color: ${$theme?.dangerColor || '#ef4444'};
          color: white;
          &:hover:not(:disabled) { background-color: #dc2626; }
        `;
            case 'success':
                return css`
          background-color: ${$theme?.successColor || '#10b981'};
          color: white;
          &:hover:not(:disabled) { background-color: #059669; }
        `;
            case 'warning':
                return css`
          background-color: ${$theme?.warningColor || '#f59e0b'};
          color: white;
          &:hover:not(:disabled) { background-color: #d97706; }
        `;
            default:
                return css`
          background-color: ${$theme?.primaryColor || '#0ea5e9'};
          color: white;
          &:hover:not(:disabled) { filter: brightness(0.9); }
        `;
        }
    }}
`;

export const Spinner = styled.div`
  border: 0.2rem solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  width: 1.6rem;
  height: 1.6rem;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
