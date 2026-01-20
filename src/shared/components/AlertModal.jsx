import React from "react";
import styled, { css } from "styled-components";
import Modal from "./common/Modal";
import { PrimaryButton } from "./ui/Buttons";

const Message = styled.p`
  margin: 0;
  font-size: var(--font-size-md);
  line-height: 1.5;
  color: var(--color-grey-800);

  ${({ $variant }) =>
    $variant === "error" &&
    css`
      color: var(--color-red-800);
    `}

  ${({ $variant }) =>
    $variant === "success" &&
    css`
      color: var(--color-green-800);
    `}
`;

const IconWrapper = styled.div`
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);

  ${({ $variant }) =>
    $variant === "error" &&
    css`
      color: var(--color-red-600);
    `}

  ${({ $variant }) =>
    $variant === "success" &&
    css`
      color: var(--color-green-600);
    `}
`;

function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
  confirmLabel = "OK",
}) {
  const icon = variant === "error" ? "⚠️" : variant === "success" ? "✅" : "ℹ️";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="420px"
      closeOnOverlayClick={true}
      footer={
        <PrimaryButton $size="sm" onClick={onClose}>
          {confirmLabel}
        </PrimaryButton>
      }
    >
      <IconWrapper $variant={variant}>{icon}</IconWrapper>
      <Message $variant={variant}>{message}</Message>
    </Modal>
  );
}

export default AlertModal;

