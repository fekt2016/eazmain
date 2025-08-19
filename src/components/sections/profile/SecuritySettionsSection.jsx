import styled from "styled-components";
import TwoFactorSetup from "../../TwoFactorSetup";
import SessionManager from "../../SessionManager";

const SecuritySettingsSection = ({
  security,
  onPasswordChange,
  onPasswordSubmit,
  passwordForm,
  isLoading,
  error,
  enableTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
}) => (
  <NotificationSection>
    <SectionHeader>
      <SectionIcon>🔒</SectionIcon>
      <SectionTitle>Security Settings</SectionTitle>
    </SectionHeader>
    <SectionContent>
      {error && (
        <ErrorMessage>Error changing password: {error.message}</ErrorMessage>
      )}

      <PasswordForm onSubmit={onPasswordSubmit}>
        <FormGroup>
          <SectionSubtitle>Change Password</SectionSubtitle>
          <FormRow>
            <InputGroup>
              <Label>Current Password</Label>
              <Input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={onPasswordChange}
                required
              />
            </InputGroup>
          </FormRow>
          <FormRow>
            <InputGroup>
              <Label>New Password</Label>
              <Input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={onPasswordChange}
                minLength="8"
                required
              />
            </InputGroup>
            <InputGroup>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={onPasswordChange}
                minLength="8"
                required
              />
            </InputGroup>
          </FormRow>
          <FormRow>
            <SaveButton type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Change Password"}
            </SaveButton>
          </FormRow>
        </FormGroup>
      </PasswordForm>

      <TwoFactorSection>
        <SectionSubtitle>Two-Factor Authentication</SectionSubtitle>
        <TwoFactorSetup
          isEnabled={security?.twoFactorEnabled}
          enableTwoFactor={enableTwoFactor}
          verifyTwoFactor={verifyTwoFactor}
          disableTwoFactor={disableTwoFactor}
        />
      </TwoFactorSection>

      <SessionSection>
        <SectionSubtitle>Active Sessions</SectionSubtitle>
        <SessionManager />
      </SessionSection>
    </SectionContent>
  </NotificationSection>
);

export default SecuritySettingsSection;

const NotificationSection = styled.div`
  background: ${({ danger, theme }) =>
    danger ? theme.colors.red[50] : theme.colors.gray[50]};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid
    ${({ danger, theme }) =>
      danger ? theme.colors.red[200] : theme.colors.gray[200]};
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
  color: ${({ theme }) => theme.colors.gray[900]};
`;

const SectionContent = styled.div`
  padding: 0.5rem 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -0.5rem 1rem;
`;

const InputGroup = styled.div`
  flex: 1 1 100%;
  padding: 0 0.5rem;
  margin-bottom: 1rem;

  @media (min-width: 640px) {
    flex: 1 1 50%;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[700]};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.white};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.gray[900]};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.blue[500]};
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[100]};
    cursor: not-allowed;
  }
`;

const PasswordForm = styled.form`
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const TwoFactorSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const SessionSection = styled.div``;

const SectionSubtitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin-bottom: 1rem;
`;

const SaveButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.blue[500]};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.blue[600]};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[400]};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.red[50]};
  border: 1px solid ${({ theme }) => theme.colors.red[200]};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.red[600]};
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;
