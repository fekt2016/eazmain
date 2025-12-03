import styled from "styled-components";
import { ButtonSpinner } from "../../../components/loading";

const SecuritySettingsSection = ({
  onPasswordChange,
  onPasswordSubmit,
  passwordForm,
  isLoading,
  error,
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
                name="passwordCurrent"
                value={passwordForm.passwordCurrent}
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
              {isLoading ? <ButtonSpinner size="sm" /> : "Change Password"}
            </SaveButton>
          </FormRow>
        </FormGroup>
      </PasswordForm>
    </SectionContent>
  </NotificationSection>
);

export default SecuritySettingsSection;

const NotificationSection = styled.div`
  background: ${({ danger }) =>
    danger ? 'var(--color-red-100)' : 'var(--color-grey-50)'};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid
    ${({ danger }) =>
      danger ? 'var(--color-red-500)' : 'var(--color-grey-200)'};
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
  color: var(--color-grey-700);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-grey-200);
  border-radius: 6px;
  background-color: var(--color-white-0);
  font-size: 0.875rem;
  color: var(--color-grey-900);
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }

  &:disabled {
    background-color: var(--color-grey-100);
    cursor: not-allowed;
  }
`;

const PasswordForm = styled.form`
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  /* border-bottom: 1px solid var(--color-grey-200); */
`;

const SectionSubtitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 1rem;
`;

const SaveButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: var(--color-brand-500);
  color: var(--color-white-0);
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--color-brand-600);
  }

  &:disabled {
    background-color: var(--color-grey-400);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 0.75rem;
  background-color: var(--color-grey-100);
  border: 1px solid var(--color-grey-300);
  border-radius: 6px;
  color: var(--color-grey-700);
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;
