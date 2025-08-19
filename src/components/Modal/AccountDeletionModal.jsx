import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useScheduleAccountDeletion } from "../../hooks/usePermission";

const AccountDeletionModal = ({
  isOpen,
  onClose,
  onDeletionScheduled,
  title = "Delete Your Account",
}) => {
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const deleteAccountMutation = useScheduleAccountDeletion();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setReason("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await deleteAccountMutation.mutateAsync({
        password,
        reason,
      });
      onDeletionScheduled(response.data.deletionDate);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to schedule deletion. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <ModalIcon>⚠️</ModalIcon>
            <ModalMessage>
              This will schedule your account for deletion after 30 days.
            </ModalMessage>
            <ModalWarning>
              You can cancel the deletion at any time during the 30-day period.
              After that, all your data will be permanently deleted.
            </ModalWarning>

            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password to confirm"
                autoComplete="current-password"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="reason">Reason (optional)</Label>
              <ReasonTextarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Help us improve our service..."
                rows="3"
              />
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}
          </ModalBody>

          <ModalFooter>
            <CancelButton type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </CancelButton>
            <DeleteButton
              type="submit"
              disabled={isLoading || !password}
              $loading={isLoading}
            >
              {isLoading ? "Scheduling..." : "Schedule Deletion"}
            </DeleteButton>
          </ModalFooter>
        </Form>
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
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 500px;
  max-width: 90%;
  overflow: hidden;
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
  color: var(--color-red-700);
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
  transition: color 0.2s;

  &:hover {
    color: var(--color-grey-700);
  }
`;

const ModalBody = styled.div`
  padding: 2.4rem;
`;

const ModalIcon = styled.div`
  font-size: 4rem;
  margin: 0 auto 1.6rem;
  text-align: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--color-red-50);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalMessage = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-800);
  margin-bottom: 1.2rem;
  line-height: 1.5;
  text-align: center;
`;

const ModalWarning = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  margin: 1.6rem 0;
  padding: 1.2rem;
  background-color: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border-left: 3px solid var(--color-grey-400);
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

const BaseButton = styled.button`
  padding: 0.8rem 1.6rem;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  font-size: 1.4rem;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CancelButton = styled(BaseButton)`
  background-color: var(--color-grey-100);
  color: var(--color-grey-700);
  border-color: var(--color-grey-300);

  &:hover {
    background-color: var(--color-grey-200);
    border-color: var(--color-grey-400);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled(BaseButton)`
  background-color: ${({ $loading }) =>
    $loading ? "var(--color-grey-300)" : "var(--color-red-100)"};
  color: ${({ $loading }) =>
    $loading ? "var(--color-grey-600)" : "var(--color-red-700)"};
  border-color: ${({ $loading }) =>
    $loading ? "var(--color-grey-400)" : "var(--color-red-300)"};

  &:hover:not(:disabled) {
    background-color: ${({ $loading }) =>
      $loading ? "var(--color-grey-300)" : "var(--color-red-200)"};
    border-color: ${({ $loading }) =>
      $loading ? "var(--color-grey-400)" : "var(--color-red-400)"};
  }

  &:disabled {
    cursor: ${({ $loading }) => ($loading ? "wait" : "not-allowed")};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1.6rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 500;
  color: var(--color-grey-700);
  font-size: 1.4rem;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: 1.4rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-blue-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const ReasonTextarea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: 1.4rem;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-blue-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
`;

const ErrorMessage = styled.div`
  color: var(--color-red-600);
  background-color: var(--color-red-50);
  padding: 1rem;
  border-radius: var(--border-radius-md);
  margin-top: 1rem;
  font-size: 1.4rem;
  border-left: 3px solid var(--color-red-500);
`;

export default AccountDeletionModal;
