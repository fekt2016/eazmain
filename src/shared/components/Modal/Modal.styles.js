import styled, { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: ${fadeIn} 250ms ease-out;
`;

export const ModalCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  position: relative;
  animation: ${slideUp} 250ms ease-out;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);

  @media (max-width: 480px) {
    max-width: 90vw;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6B7280;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #F3F4F6;
    color: #374151;
  }
`;

export const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  background: ${({ type }) =>
        type === 'warning' ? '#FEF3C7' :
            type === 'danger' ? '#FEE2E2' :
                type === 'success' ? '#DCFCE7' :
                    '#EFF6FF'};
  color: ${({ type }) =>
        type === 'warning' ? '#F59E0B' :
            type === 'danger' ? '#EF4444' :
                type === 'success' ? '#22C55E' :
                    '#3B82F6'};
  font-size: 24px;
`;

export const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1A1F2E;
  text-align: center;
  margin: 0 0 8px;
`;

export const Message = styled.p`
  font-size: 14px;
  color: #6B7280;
  text-align: center;
  line-height: 1.6;
  margin: 0 0 24px;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`;

export const ActionButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 150ms ease;

  ${({ variant, $danger }) => variant === 'primary' ? css`
    background: ${$danger ? '#EF4444' : '#D4882A'};
    color: #FFFFFF;
    &:hover { 
      background: ${$danger ? '#DC2626' : '#B8711F'}; 
    }
  ` : css`
    background: #F9FAFB;
    color: #374151;
    border: 1px solid #E5E7EB;
    &:hover { 
      background: #F3F4F6; 
    }
  `}
`;
