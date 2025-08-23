import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";

import useAuth from "../hooks/useAuth";
import TwoFactorSetup from "../components/TwoFactorSetup";
import SessionManager from "../components/SessionManager";
import PersonalInfoSection from "../components/sections/profile/PersonalInfoSection";
import AccountManagementSection from "../components/sections/profile/AccountManagementSection";
import ConnectedAccountsSection from "../components/sections/profile/ConnectedAccountsSection";
import SecuritySettingsSection from "../components/sections/profile/SecuritySettionsSection";
import ErrorDisplay from "../components/ErrorDisplay";
import { compressImage } from "../utils/imageCompressor";

const ProfilePage = () => {
  const {
    updateProfile,
    changePassword,
    deactivateAccount,
    enableTwoFactor,
    verifyTwoFactor,
    disableTwoFactor,
    uploadAvatar,
    profileData,
  } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [newProfileData, setNewProfileData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    passwordCurrent: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Create a ref for the file input
  const fileInputRef = useRef(null);

  // Initialize data when profileData is available
  useEffect(() => {
    if (profileData) {
      setIsLoading(false);
      setProfileError(null);
      setNewProfileData(profileData.userInfo || {});
      setAvatarPreview(profileData.userInfo?.photo || null);
    }
  }, [profileData]);

  // Handle input changes for profile data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProfileData((prev) => ({
      ...prev,
      [name]: value,
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

  // Save profile preferences
  const savePreferences = () => {
    updateProfile.mutate(newProfileData);
    setDirty(false);
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    changePassword.mutate({
      passwordCurrent: passwordForm.passwordCurrent,
      newPassword: passwordForm.newPassword,
    });
    setPasswordForm({
      passwordCurrentd: "",
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

  // Handle avatar selection and immediate upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setAvatarFile(file);

    // Immediately upload the file after selection
    await handleAvatarUpload(file);
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file = null) => {
    const uploadFile = file || avatarFile;

    if (!uploadFile) {
      alert("Please select an image first");
      return;
    }

    try {
      const compressedCover = await compressImage(uploadFile, {
        quality: 0.7,
        maxWidth: 1024,
      });

      const formData = new FormData();
      formData.append("photo", compressedCover);

      await uploadAvatar.mutateAsync(formData);
      setAvatarFile(null);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      alert("Avatar uploaded successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Error uploading avatar. Please try again.");
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Show loading state
  if (isLoading) return <LoadingSpinner />;

  // Show error state
  if (profileError) return <ErrorDisplay message={profileError.message} />;

  // Don't render if no profile data
  if (!profileData || !profileData.userInfo) return null;

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
          newProfileData={newProfileData}
          avatarPreview={avatarPreview}
          onAvatarChange={handleAvatarChange}
          onAvatarUpload={triggerFileInput} // Pass the trigger function
          onChange={handleInputChange}
          onSavePersonalInfo={savePreferences}
          avatarFile={avatarFile}
          isUploading={uploadAvatar.isLoading}
          error={updateProfile.error}
          fileInputRef={fileInputRef} // Pass the ref
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
          {updateProfile.isLoading ? "Saving..." : "Save Profile Changes"}
        </SaveButton>
      </ActionBar>

      <InfoNote>
        <InfoIcon>ℹ️</InfoIcon>
        <InfoText>Changes may take up to 24 hours to propagate</InfoText>
      </InfoNote>
    </PageContainer>
  );
};

export default ProfilePage;

// Styled Components
const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #7f8c8d;
`;

const NotificationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
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
