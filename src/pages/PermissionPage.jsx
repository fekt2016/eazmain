import React, { useMemo, useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { devicesMax } from "../styles/breakpoint";
import {
  useGetPermissions,
  useRequestDataDownload,
  useUpdateEmailPrefs,
  useUpdateSMSPrefs,
  useUpdateDataSharing,
  useUpdateLocationAccess,
  useUpdateSocialSharing,
  useUpdateAccountVisibility,
  useCancelAccountDeletion,
} from "../hooks/usePermission";
import AccountDeletionModal from "../components/Modal/AccountDeletionModal";
import useAuth from "../hooks/useAuth";

const PermissionsPage = () => {
  // State for all permission settings
  const [exportStatus, setExportStatus] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState(null);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  console.log("countdown", countdown);

  // Use ref for interval to avoid dependency issues
  const intervalRef = useRef(null);
  const { userData } = useAuth();

  const user = useMemo(() => {
    return userData?.user || userData?.data || null;
  }, [userData]);

  const {
    data: permissionData,
    isLoading,
    isError,
    refetch,
  } = useGetPermissions();

  // Extract permissions with proper fallback
  const permissions = useMemo(() => {
    return permissionData?.data || permissionData?.data?.data || {};
  }, [permissionData]);

  // Hooks for updating preferences
  const updateEmailPrefs = useUpdateEmailPrefs();
  const updateSMSPrefs = useUpdateSMSPrefs();
  const updateDataSharing = useUpdateDataSharing();
  const updateLocation = useUpdateLocationAccess();
  const updateSocial = useUpdateSocialSharing();
  const updateVisibility = useUpdateAccountVisibility();
  const downloadDataMutation = useRequestDataDownload();
  const cancelDeletionMutation = useCancelAccountDeletion();

  // Start countdown timer when deletion is pending
  const startCountdown = () => {
    console.log("user", user.accountDeletion);
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const calculateTime = () => {
      // Check if user and deletion date exist
      if (!user || !user.accountDeletion || !user.accountDeletion.scheduledAt) {
        return;
      }

      const deletionDate = new Date(user.accountDeletion.scheduledAt);
      const now = new Date();
      const diffInMs = deletionDate - now;

      // If time has expired
      if (diffInMs <= 0) {
        clearInterval(intervalRef.current);
        setDeletionStatus(null);
        return;
      }

      // Calculate time units
      const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    // Run immediately and set interval
    calculateTime();
    intervalRef.current = setInterval(calculateTime, 1000);
  };

  // Check if deletion is pending when user data loads
  useEffect(() => {
    if (user?.accountDeletion?.status === "pending") {
      setDeletionStatus("pending");
      startCountdown();
    }

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?.accountDeletion?.status, user]);

  // Toggle handlers
  const toggleEmailPreference = (type) => {
    if (!permissions) return;
    updateEmailPrefs.mutate({
      ...permissions.emailPreferences,
      [type]: !permissions.emailPreferences[type],
    });
  };

  const toggleSMSPreference = (type) => {
    if (!permissions) return;
    updateSMSPrefs.mutate({
      ...permissions.smsPreferences,
      [type]: !permissions.smsPreferences[type],
    });
  };

  const toggleDataSharing = (type) => {
    if (!permissions) return;
    updateDataSharing.mutate({
      ...permissions.dataSharing,
      [type]: !permissions.dataSharing[type],
    });
  };

  const changeLocationAccess = (level) => {
    if (!permissions) return;
    updateLocation.mutate(level);
  };

  const toggleSocialSharing = () => {
    if (!permissions) return;
    updateSocial.mutate(!permissions.socialMediaSharing);
  };

  const changeAccountVisibility = (level) => {
    if (!permissions) return;
    updateVisibility.mutate(level);
  };

  const downloadData = () => {
    if (exportStatus === "pending") return;
    setExportStatus("pending");
    downloadDataMutation.mutate(null, {
      onSuccess: () => {
        setExportStatus("success");
        setTimeout(() => setExportStatus(null), 5000);
      },
      onError: () => {
        setExportStatus("error");
        setTimeout(() => setExportStatus(null), 5000);
      },
    });
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeletionScheduled = () => {
    setDeletionStatus("pending");
    refetch(); // Refresh permissions data
  };

  const handleCancelDeletion = () => {
    cancelDeletionMutation.mutate(null, {
      onSuccess: () => {
        setDeletionStatus(null);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        refetch(); // Refresh permissions data
      },
      onError: () => {
        alert("Failed to cancel account deletion. Please try again.");
      },
    });
  };

  if (isLoading) {
    return <LoadingContainer>Loading your preferences...</LoadingContainer>;
  }

  if (isError) {
    return (
      <ErrorContainer>
        Error loading preferences. Please try again later.
      </ErrorContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>Your Privacy & Permissions</Title>
        <Subtitle>
          Control how we use your data and communicate with you
        </Subtitle>
      </Header>

      <PermissionsContainer>
        {/* Email Preferences Section */}
        <PermissionSection>
          <SectionHeader>
            <SectionIcon>✉️</SectionIcon>
            <SectionTitle>Email Preferences</SectionTitle>
          </SectionHeader>
          <SectionContent>
            {["promotions", "newsletters", "accountUpdates"].map((type) => (
              <PreferenceItem key={type}>
                <PreferenceLabel>
                  <PreferenceName>
                    {type === "promotions" && "Promotions & Offers"}
                    {type === "newsletters" && "Newsletters"}
                    {type === "accountUpdates" && "Account Updates"}
                  </PreferenceName>
                  <PreferenceDesc>
                    {type === "promotions" &&
                      "Receive special offers and discounts"}
                    {type === "newsletters" &&
                      "Company updates and industry news"}
                    {type === "accountUpdates" &&
                      "Important notifications about your account"}
                  </PreferenceDesc>
                </PreferenceLabel>
                <ToggleSwitch
                  checked={permissions.emailPreferences[type]}
                  onChange={() => toggleEmailPreference(type)}
                />
              </PreferenceItem>
            ))}
          </SectionContent>
        </PermissionSection>

        {/* SMS Preferences Section */}
        <PermissionSection>
          <SectionHeader>
            <SectionIcon>📱</SectionIcon>
            <SectionTitle>SMS Preferences</SectionTitle>
          </SectionHeader>
          <SectionContent>
            {["promotions", "orderUpdates"].map((type) => (
              <PreferenceItem key={type}>
                <PreferenceLabel>
                  <PreferenceName>
                    {type === "promotions" && "Promotional Messages"}
                    {type === "orderUpdates" && "Order Updates"}
                  </PreferenceName>
                  <PreferenceDesc>
                    {type === "promotions" && "Special offers via text message"}
                    {type === "orderUpdates" &&
                      "Shipping notifications and delivery updates"}
                  </PreferenceDesc>
                </PreferenceLabel>
                <ToggleSwitch
                  checked={permissions.smsPreferences[type]}
                  onChange={() => toggleSMSPreference(type)}
                />
              </PreferenceItem>
            ))}
          </SectionContent>
        </PermissionSection>

        {/* Data Sharing Preferences Section */}
        <PermissionSection>
          <SectionHeader>
            <SectionIcon>🔒</SectionIcon>
            <SectionTitle>Data Sharing Preferences</SectionTitle>
          </SectionHeader>
          <SectionContent>
            {["analytics", "personalizedAds", "thirdParties"].map((type) => (
              <PreferenceItem key={type}>
                <PreferenceLabel>
                  <PreferenceName>
                    {type === "analytics" && "Help Improve Our Services"}
                    {type === "personalizedAds" && "Personalized Advertising"}
                    {type === "thirdParties" && "Share with Trusted Partners"}
                  </PreferenceName>
                  <PreferenceDesc>
                    {type === "analytics" &&
                      "Share usage data to help us improve"}
                    {type === "personalizedAds" &&
                      "See ads tailored to your interests"}
                    {type === "thirdParties" &&
                      "Allow selected partners to offer relevant services"}
                  </PreferenceDesc>
                </PreferenceLabel>
                <ToggleSwitch
                  checked={permissions.dataSharing[type]}
                  onChange={() => toggleDataSharing(type)}
                />
              </PreferenceItem>
            ))}
          </SectionContent>
        </PermissionSection>

        {/* Location Access Section */}
        <PermissionSection>
          <SectionHeader>
            <SectionIcon>📍</SectionIcon>
            <SectionTitle>Location Access</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <RadioGroup>
              {[
                {
                  value: "full",
                  name: "Full Access",
                  desc: "Allow precise location for all services",
                },
                {
                  value: "limited",
                  name: "Limited Access",
                  desc: "Only when using location-based features",
                },
                {
                  value: "none",
                  name: "No Access",
                  desc: "Don't allow location access at all",
                },
              ].map((option) => (
                <RadioOption key={option.value}>
                  <RadioInput
                    type="radio"
                    name="locationAccess"
                    checked={permissions.locationAccess === option.value}
                    onChange={() => changeLocationAccess(option.value)}
                  />
                  <RadioLabel>
                    <RadioName>{option.name}</RadioName>
                    <RadioDesc>{option.desc}</RadioDesc>
                  </RadioLabel>
                </RadioOption>
              ))}
            </RadioGroup>
          </SectionContent>
        </PermissionSection>

        {/* Social Media & Sharing Section */}
        <PermissionSection>
          <SectionHeader>
            <SectionIcon>👥</SectionIcon>
            <SectionTitle>Social Media & Sharing</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <PreferenceItem>
              <PreferenceLabel>
                <PreferenceName>Share Activity</PreferenceName>
                <PreferenceDesc>
                  Share your purchases and reviews on social media
                </PreferenceDesc>
              </PreferenceLabel>
              <ToggleSwitch
                checked={permissions.socialMediaSharing}
                onChange={toggleSocialSharing}
              />
            </PreferenceItem>
          </SectionContent>
        </PermissionSection>

        {/* Account Visibility Section */}
        <PermissionSection>
          <SectionHeader>
            <SectionIcon>👤</SectionIcon>
            <SectionTitle>Account Visibility</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <RadioGroup>
              {[
                {
                  value: "standard",
                  name: "Standard Visibility",
                  desc: "Your profile is visible to other users",
                },
                {
                  value: "private",
                  name: "Private Account",
                  desc: "Only approved followers can see your profile",
                },
                {
                  value: "hidden",
                  name: "Hidden Account",
                  desc: "Your profile is not visible to anyone",
                },
              ].map((option) => (
                <RadioOption key={option.value}>
                  <RadioInput
                    type="radio"
                    name="accountVisibility"
                    checked={permissions.accountVisibility === option.value}
                    onChange={() => changeAccountVisibility(option.value)}
                  />
                  <RadioLabel>
                    <RadioName>{option.name}</RadioName>
                    <RadioDesc>{option.desc}</RadioDesc>
                  </RadioLabel>
                </RadioOption>
              ))}
            </RadioGroup>
          </SectionContent>
        </PermissionSection>

        {/* Your Data Section */}
        <PermissionSection>
          <SectionHeader>
            <SectionIcon>💾</SectionIcon>
            <SectionTitle>Your Data</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <DataAction>
              <DataActionLabel>
                <DataActionName>Download Your Data</DataActionName>
                <DataActionDesc>
                  Get a copy of all your personal data
                </DataActionDesc>
              </DataActionLabel>
              <DownloadButton
                onClick={downloadData}
                disabled={exportStatus === "pending"}
              >
                {exportStatus === "pending"
                  ? "Processing..."
                  : exportStatus === "success"
                  ? "✓ Sent!"
                  : exportStatus === "error"
                  ? "Error! Try Again"
                  : "Request Download"}
              </DownloadButton>
            </DataAction>

            <DataAction>
              <DataActionLabel>
                <DataActionName>Delete Your Account</DataActionName>
                <DataActionDesc>
                  {deletionStatus === "pending"
                    ? `Account will be deleted in: ${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`
                    : "Permanently remove your account and data"}
                </DataActionDesc>
              </DataActionLabel>

              {deletionStatus === "pending" ? (
                <CancelButton onClick={handleCancelDeletion}>
                  Cancel Deletion
                </CancelButton>
              ) : (
                <DeleteButton onClick={handleDeleteAccount}>
                  Delete Account
                </DeleteButton>
              )}
            </DataAction>
          </SectionContent>

          {isDeleteModalOpen && (
            <AccountDeletionModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onDeletionScheduled={handleDeletionScheduled}
            />
          )}
        </PermissionSection>
      </PermissionsContainer>

      <PrivacyInfo>
        <PrivacyText>
          We respect your privacy and are committed to protecting your personal
          data. For more information, please review our{" "}
          <PrivacyLink href="#">Privacy Policy</PrivacyLink>.
        </PrivacyText>
      </PrivacyInfo>
    </PageContainer>
  );
};

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange }) => (
  <SwitchContainer>
    <SwitchInput type="checkbox" checked={checked} onChange={onChange} />
    <SwitchSlider checked={checked} />
  </SwitchContainer>
);

// Styled Components
const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 3.2rem 2.4rem;

  @media ${devicesMax.md} {
    padding: 2.4rem 1.6rem;
  }
`;

const Header = styled.div`
  margin-bottom: 3.2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 1.2rem;

  @media ${devicesMax.md} {
    font-size: 2.4rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-500);
  max-width: 600px;
  margin: 0 auto;
`;

const PermissionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  margin-bottom: 3.2rem;
`;

const PermissionSection = styled.div`
  background-color: var(--color-white-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1.6rem 2.4rem;
  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-200);
`;

const SectionIcon = styled.span`
  font-size: 2.4rem;
  margin-right: 1.2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const SectionContent = styled.div`
  padding: 2rem 2.4rem;
`;

const PreferenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.6rem 0;
  border-bottom: 1px solid var(--color-grey-100);

  &:last-child {
    border-bottom: none;
  }
`;

const PreferenceLabel = styled.div`
  flex: 1;
  margin-right: 2rem;
`;

const PreferenceName = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 0.4rem;
`;

const PreferenceDesc = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const SwitchContainer = styled.label`
  position: relative;
  display: inline-block;
  width: 5rem;
  height: 2.6rem;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: var(--color-brand-600);
  }

  &:checked + span:before {
    transform: translateX(2.4rem);
  }
`;

const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-grey-300);
  transition: 0.4s;
  border-radius: 3.4rem;

  &:before {
    position: absolute;
    content: "";
    height: 1.8rem;
    width: 1.8rem;
    left: 0.4rem;
    bottom: 0.4rem;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const RadioOption = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 1.6rem 0;
  border-bottom: 1px solid var(--color-grey-100);

  &:last-child {
    border-bottom: none;
  }
`;

const RadioInput = styled.input`
  margin-right: 1.2rem;
  margin-top: 0.4rem;
  accent-color: var(--color-brand-600);
`;

const RadioLabel = styled.div`
  flex: 1;
`;

const RadioName = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 0.4rem;
`;

const RadioDesc = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const DataAction = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.6rem 0;
  border-bottom: 1px solid var(--color-grey-100);

  &:last-child {
    border-bottom: none;
  }
`;

const DataActionLabel = styled.div`
  flex: 1;
  margin-right: 2rem;
`;

const DataActionName = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 0.4rem;
`;

const DataActionDesc = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const DownloadButton = styled.button`
  padding: 0.8rem 1.6rem;
  background-color: var(--color-brand-100);
  color: var(--color-brand-700);
  border: 1px solid var(--color-brand-300);
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;

  &:hover:not(:disabled) {
    background-color: var(--color-brand-200);
    border-color: var(--color-brand-400);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled.button`
  padding: 0.8rem 1.6rem;
  background-color: var(--color-red-100);
  color: var(--color-red-700);
  border: 1px solid var(--color-red-300);
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;

  &:hover {
    background-color: var(--color-red-200);
    border-color: var(--color-red-400);
  }
`;

const CancelButton = styled.button`
  padding: 0.8rem 1.6rem;
  background-color: var(--color-grey-100);
  color: var(--color-grey-700);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;

  &:hover {
    background-color: var(--color-grey-200);
    border-color: var(--color-grey-400);
  }
`;

const PrivacyInfo = styled.div`
  padding: 2rem;
  background-color: var(--color-grey-100);
  border-radius: var(--border-radius-md);
  text-align: center;
`;

const PrivacyText = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  line-height: 1.6;
`;

const PrivacyLink = styled.a`
  color: var(--color-brand-600);
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.6rem;
  color: var(--color-grey-600);
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.6rem;
  color: var(--color-red-600);
  background-color: var(--color-red-50);
  border-radius: var(--border-radius-md);
  margin: 2rem;
`;

export default PermissionsPage;
