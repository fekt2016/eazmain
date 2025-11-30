import styled from "styled-components";
import { devicesMax } from "../../styles/breakpoint";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { fadeIn, zoomIn } from "../../styles/animations";

const Overlay = styled.div`
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
  padding: var(--spacing-md);
  animation: ${fadeIn} 0.4s ease-out;
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-sm);
  }
`;

const ModalContent = styled.div`
  background: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: ${({ $maxWidth }) => $maxWidth || "50rem"};
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: ${zoomIn} 0.4s ease-out;
  
  @media ${devicesMax.sm} {
    max-width: 100%;
    border-radius: var(--border-radius-md);
  }
`;

const ModalHeader = styled.div`
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-md);
  }
`;

const ModalBody = styled.div`
  padding: var(--spacing-lg);
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-md);
  }
`;

const ModalFooter = styled.div`
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  
  @media ${devicesMax.sm} {
    padding: var(--spacing-md);
    flex-direction: column-reverse;
    
    button {
      width: 100%;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  color: var(--color-grey-500);
  cursor: pointer;
  padding: 0;
  width: 3.2rem;
  height: 3.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  transition: var(--transition-base);
  
  &:hover {
    background: var(--color-grey-100);
    color: var(--color-grey-700);
  }
`;

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth,
  closeOnOverlayClick = true,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <Overlay onClick={handleOverlayClick}>
      <ModalContent $maxWidth={maxWidth}>
        {title && (
          <ModalHeader>
            <h2 style={{ margin: 0, fontFamily: "var(--font-heading)" }}>{title}</h2>
            <CloseButton onClick={onClose} aria-label="Close modal">
              ×
            </CloseButton>
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Overlay>,
    document.body
  );
}

export { ModalHeader, ModalBody, ModalFooter };

