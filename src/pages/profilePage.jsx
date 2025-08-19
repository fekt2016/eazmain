import React, { useState } from "react";
import styled from "styled-components";
import { theme } from "../styles/theme";

import useAuth from "../hooks/useAuth";
import TwoFactorSetup from "../components/TwoFactorSetup";
import SessionManager from "../components/SessionManager";

const ProfilePage = () => {
  const {
    userData,
    updateProfile,
    changePassword,
    deactivateAccount,
    enableTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    profileData,
  } = useAuth();

  const [dirty, setDirty] = useState(false);
  const [setProfileData] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  console.log(userData);
  const { userInfo, securitySettings, connectedAccounts } = profileData || {};
  console.log("profile", userInfo, securitySettings, connectedAccounts);
  // Fetch full profile data

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      userInfo: {
        ...prev.userInfo,
        [name]: value,
      },
    }));
    setDirty(true);
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save preferences
  const savePreferences = () => {
    if (profileData) {
      updateProfile.mutate(profileData.userInfo);
      setDirty(false);
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }
    changePassword.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Handle account deactivation
  const handleDeactivateAccount = () => {
    if (window.confirm("Are you sure you want to deactivate your account?")) {
      deactivateAccount.mutate();
    }
  };

  // if (isLoading) return <LoadingSpinner />;
  // if (profileError) return <ErrorDisplay message={profileError.message} />;
  // if (!profileData?.userInfo) return null;

  return (
    <PageContainer>
      <Header>
        <Title>Account Settings</Title>
        <Subtitle>
          Manage your personal information and security settings
        </Subtitle>
      </Header>

      <NotificationGrid>
        <PersonalInfoSection
          userInfo={profileData.userInfo}
          onChange={handleInputChange}
          error={updateProfile.error}
          theme={theme}
        />

        <SecuritySettingsSection
          security={profileData.securitySettings}
          onPasswordChange={handlePasswordChange}
          onPasswordSubmit={handlePasswordSubmit}
          passwordForm={passwordForm}
          isLoading={changePassword.isLoading}
          error={changePassword.error}
          enableTwoFactor={enableTwoFactor}
          verifyTwoFactor={verifyTwoFactor}
          disableTwoFactor={disableTwoFactor}
          theme={theme}
        />

        <ConnectedAccountsSection accounts={profileData.connectedAccounts} />

        <AccountManagementSection
          onDeactivate={handleDeactivateAccount}
          isLoading={deactivateAccount.isLoading}
          error={deactivateAccount.error}
        />
      </NotificationGrid>

      <ActionBar>
        <SaveButton
          onClick={savePreferences}
          disabled={!dirty || updateProfile.isLoading}
        >
          {updateProfile.isLoading ? "Saving..." : "Save All Changes"}
        </SaveButton>
      </ActionBar>

      <InfoNote>
        <InfoIcon>ℹ️</InfoIcon>
        <InfoText>Changes may take up to 24 hours to propagate</InfoText>
      </InfoNote>
    </PageContainer>
  );
};

// =========================================================
// Styled Components
// =========================================================

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Inter", sans-serif;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[900]};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const NotificationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const NotificationSection = styled.div`
  background: ${({ theme, danger }) =>
    danger ? theme.colors.red[50] : theme.colors.gray[50]};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid
    ${({ theme, danger }) =>
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

const SocialConnections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SocialConnection = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 8px;
`;

const SocialIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 50%;
  font-weight: 700;
  margin-right: 1rem;
`;

const SocialName = styled.span`
  flex: 1;
  font-weight: 500;
`;

const ConnectButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
  }
`;

const DangerZone = styled.div`
  background-color: ${({ theme }) => theme.colors.red[50]};
  border-radius: 8px;
  padding: 1.5rem;
`;

const DangerOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.red[200]};

  &:last-child {
    border-bottom: none;
  }
`;

const DangerText = styled.div`
  flex: 1;

  strong {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.red[600]};
  }

  p {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.gray[600]};
    margin-top: 0.25rem;
  }
`;

const DangerButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.red[600]};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.red[600]};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.red[600]};
    color: ${({ theme }) => theme.colors.white};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
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

const InfoNote = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.blue[50]};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.blue[700]};
  font-size: 0.875rem;
`;

const InfoIcon = styled.span`
  margin-right: 0.5rem;
`;

const InfoText = styled.span``;

const ErrorMessage = styled.div`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.red[50]};
  border: 1px solid ${({ theme }) => theme.colors.red[200]};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.red[600]};
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;

  &:after {
    content: "";
    width: 50px;
    height: 50px;
    border: 5px solid ${({ theme }) => theme.colors.gray[200]};
    border-top: 5px solid ${({ theme }) => theme.colors.blue[500]};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorDisplayContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64vh;
`;

const ErrorDisplayContent = styled.div`
  background-color: ${({ theme }) => theme.colors.red[50]};
  border: 1px solid ${({ theme }) => theme.colors.red[200]};
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  max-width: 32rem;
`;

const ErrorDisplayIcon = styled.div`
  color: ${({ theme }) => theme.colors.red[500]};
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const ErrorDisplayMessage = styled.p`
  color: ${({ theme }) => theme.colors.red[700]};
  font-weight: 500;
  margin-bottom: 1.5rem;
`;

const RetryButton = styled.button`
  background-color: ${({ theme }) => theme.colors.red[100]};
  color: ${({ theme }) => theme.colors.red[700]};
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.red[200]};
  }
`;

const ErrorDisplay = ({ message }) => (
  <ErrorDisplayContainer>
    <ErrorDisplayContent>
      <ErrorDisplayIcon>❌</ErrorDisplayIcon>
      <ErrorDisplayMessage>{message}</ErrorDisplayMessage>
      <RetryButton onClick={() => window.location.reload()}>
        Try Again
      </RetryButton>
    </ErrorDisplayContent>
  </ErrorDisplayContainer>
);

// =========================================================
// Sub-components
// =========================================================

const PersonalInfoSection = ({ userInfo, onChange, error }) => (
  <NotificationSection>
    <SectionHeader>
      <SectionIcon>👤</SectionIcon>
      <SectionTitle>Personal Information</SectionTitle>
    </SectionHeader>
    <SectionContent>
      {error && (
        <ErrorMessage>Error updating profile: {error.message}</ErrorMessage>
      )}
      <FormGroup>
        <FormRow>
          <InputGroup>
            <Label>First Name</Label>
            <Input
              type="text"
              name="firstName"
              value={userInfo.firstName || ""}
              onChange={onChange}
            />
          </InputGroup>
          <InputGroup>
            <Label>Last Name</Label>
            <Input
              type="text"
              name="lastName"
              value={userInfo.lastName || ""}
              onChange={onChange}
            />
          </InputGroup>
        </FormRow>

        <FormRow>
          <InputGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={userInfo.email || ""}
              onChange={onChange}
              disabled
            />
          </InputGroup>
        </FormRow>

        <FormRow>
          <InputGroup>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              name="phone"
              value={userInfo.phone || ""}
              onChange={onChange}
            />
          </InputGroup>
        </FormRow>

        {/* Seller-specific fields */}
        {userInfo.role === "seller" && (
          <>
            <FormRow>
              <InputGroup>
                <Label>Business Name</Label>
                <Input
                  type="text"
                  name="businessName"
                  value={userInfo.businessName || ""}
                  onChange={onChange}
                />
              </InputGroup>
            </FormRow>
            <FormRow>
              <InputGroup>
                <Label>Tax ID</Label>
                <Input
                  type="text"
                  name="taxId"
                  value={userInfo.taxId || ""}
                  onChange={onChange}
                />
              </InputGroup>
            </FormRow>
          </>
        )}
      </FormGroup>
    </SectionContent>
  </NotificationSection>
);

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

const ConnectedAccountsSection = ({ accounts }) => (
  <NotificationSection>
    <SectionHeader>
      <SectionIcon>🔗</SectionIcon>
      <SectionTitle>Connected Accounts</SectionTitle>
    </SectionHeader>
    <SectionContent>
      <SocialConnections>
        <SocialConnection connected={accounts?.google}>
          <SocialIcon>G</SocialIcon>
          <SocialName>Google</SocialName>
          <ConnectButton>
            {accounts?.google ? "Connected" : "Connect"}
          </ConnectButton>
        </SocialConnection>

        <SocialConnection connected={accounts?.facebook}>
          <SocialIcon>f</SocialIcon>
          <SocialName>Facebook</SocialName>
          <ConnectButton>
            {accounts?.facebook ? "Connected" : "Connect"}
          </ConnectButton>
        </SocialConnection>
      </SocialConnections>
    </SectionContent>
  </NotificationSection>
);

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

export default ProfilePage;
