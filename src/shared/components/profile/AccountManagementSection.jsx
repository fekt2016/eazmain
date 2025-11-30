import styled from "styled-components";

const AccountManagementSection = ({ onDeactivate, isLoading, error }) => (
  <NotificationSection danger>
    <SectionHeader>
      <SectionIcon>⚠️</SectionIcon>
      <SectionTitle>Account Management</SectionTitle>
    </SectionHeader>
    <SectionContent>
      {error && (
        <ErrorMessage>Error deactivating account: {error.message}</ErrorMessage>
      )}
      <DangerZone>
        <SectionSubtitle>Danger Zone</SectionSubtitle>
        <DangerOption>
          <DangerText>
            <strong>Deactivate Account</strong>
            <p>Your account will be disabled and removed from public view</p>
          </DangerText>
          <DangerButton onClick={onDeactivate} disabled={isLoading}>
            {isLoading ? "Processing..." : "Deactivate Account"}
          </DangerButton>
        </DangerOption>

        <DangerOption>
          <DangerText>
            <strong>Delete Account</strong>
            <p>Permanently remove your account and all data</p>
          </DangerText>
          <DangerButton disabled>Delete Account</DangerButton>
        </DangerOption>
      </DangerZone>
    </SectionContent>
  </NotificationSection>
);

export default AccountManagementSection;

const NotificationSection = styled.div`
  background: ${({ danger }) =>
    danger ? 'var(--color-red-50)' : 'var(--color-grey-50)'};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid
    ${({ danger }) =>
      danger ? 'var(--color-red-200)' : 'var(--color-grey-200)'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.75rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-grey-900);
`;

const SectionContent = styled.div`
  padding: 0.5rem 0;
`;

const SectionSubtitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 1rem;
`;

const DangerZone = styled.div`
  background-color: var(--color-red-50);
  border-radius: 8px;
  padding: 1.5rem;
`;

const DangerOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-red-200);

  &:last-child {
    border-bottom: none;
  }
`;

const DangerText = styled.div`
  flex: 1;

  strong {
    font-weight: 600;
    color: var(--color-red-600);
  }

  p {
    font-size: 0.875rem;
    color: var(--color-grey-600);
    margin-top: 0.25rem;
  }
`;

const DangerButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: var(--color-white-0);
  border: 1px solid var(--color-red-600);
  border-radius: 6px;
  color: var(--color-red-600);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--color-red-600);
    color: var(--color-white-0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 0.75rem;
  background-color: var(--color-red-50);
  border: 1px solid var(--color-red-200);
  border-radius: 6px;
  color: var(--color-red-600);
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;
