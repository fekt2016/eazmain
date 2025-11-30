import React from "react";
import styled from "styled-components";
import { SecondaryButton, DangerButton } from '../ui/Buttons';
import { fadeIn, zoomIn } from "../../styles/animations";

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete the selected items?",
  itemCount = 0,
  warning = "This action cannot be undone and will permanently remove these items.",
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>
          <ModalIcon>⚠️</ModalIcon>
          <ModalMessage>
            {message} {itemCount > 0 && `(${itemCount} items)`}
          </ModalMessage>
          <ModalWarning>{warning}</ModalWarning>
        </ModalBody>
        <ModalFooter>
          <SecondaryButton $size="sm" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <DangerButton $size="sm" onClick={onConfirm}>Delete Items</DangerButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: ${fadeIn} 0.4s ease-out;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 500px;
  max-width: 90%;
  overflow: hidden;
  animation: ${zoomIn} 0.4s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.6rem 2.4rem;
  background-color: var(--color-white-0);
  border-bottom: 1px solid var(--color-grey-200);
`;

const ModalTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-grey-900);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2.4rem;
  cursor: pointer;
  color: var(--color-grey-500);
  padding: 0.5rem;
  line-height: 1;
  transition: var(--transition-base);

  &:hover {
    color: var(--color-grey-700);
  }
`;

const ModalBody = styled.div`
  padding: 2.4rem;
  text-align: center;
`;

const ModalIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.6rem;
`;

const ModalMessage = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-800);
  margin-bottom: 1.2rem;
  line-height: 1.5;
`;

const ModalWarning = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  margin-top: 1.6rem;
  line-height: 1.5;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  padding: 1.6rem 2.4rem;
  background-color: var(--color-grey-50);
  border-top: 1px solid var(--color-grey-200);
`;


export default DeleteModal;
