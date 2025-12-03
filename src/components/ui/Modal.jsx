import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { css } from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--transition-base), visibility var(--transition-base);

  &.open {
    opacity: 1;
    visibility: visible;
  }

  @media ${devicesMax.sm} {
    padding: var(--space-md);
  }
`;

const ModalContent = styled.div`
  background: var(--color-white-0);
  border-radius: var(--radius-lg);
  max-width: 90vw;
  max-height: 90vh;
  width: 500px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
  transform: scale(0.95) translateY(-20px);
  transition: transform var(--transition-base);

  ${ModalOverlay}.open & {
    transform: scale(1) translateY(0);
  }

  @media ${devicesMax.lg} {
    width: 95vw;
    max-width: 600px;
  }

  @media ${devicesMax.sm} {
    width: 100%;
    max-height: 95vh;
    border-radius: var(--radius-md);
  }
`;

const ModalHeader = styled.div`
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h3`
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: var(--text-2xl);
  color: var(--color-grey-500);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: var(--radius-md);
  transition: color var(--transition-base);

  &:hover {
    color: var(--color-grey-700);
    background: var(--color-grey-100);
  }
`;

const ModalBody = styled.div`
  padding: var(--space-lg);
  max-height: 60vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--color-grey-100);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-grey-300);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-grey-400);
  }
`;

const ModalFooter = styled.div`
  padding: var(--space-lg);
  border-top: 1px solid var(--color-grey-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
`;

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  size = 'md',
  ...props 
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <ModalOverlay className={isOpen ? 'open' : ''} onClick={handleOverlayClick} onKeyDown={handleKeyDown} tabIndex={-1}>
      <ModalContent size={size} {...props}>
        {(title || onClose) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {onClose && <CloseButton onClick={onClose}><FaTimes /></CloseButton>}
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
export { ModalOverlay, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter };
