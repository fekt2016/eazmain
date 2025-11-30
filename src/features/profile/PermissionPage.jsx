import React, { useMemo, useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { devicesMax } from '../../shared/styles/breakpoint';
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
} from '../../shared/hooks/usePermission';
import AccountDeletionModal from '../../shared/components/modals/AccountDeletionModal';
import useAuth from '../../shared/hooks/useAuth';
import {
  FaEnvelope,
  FaComment,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaShareAlt,
  FaUser,
  FaDatabase,
  FaDownload,
  FaTrash,
  FaLock,
  FaBell,
  FaChartBar,
  FaUsers,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaInfoCircle
} from "react-icons/fa";

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
    return <LoadingState message="Loading your privacy settings..." />;
  }

  if (isError) {
    return (
      <ErrorState 
        title="Error loading preferences" 
        message="Please try again later."
      />
    );
  }

  return (
    <PageContainer>
      {/* Account Deletion Modal */}
      {isDeleteModalOpen && (
        <AccountDeletionModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeletionScheduled={handleDeletionScheduled}
        />
      )}

      <HeaderSection>
        <HeaderContent>
          <TitleSection>
            <Title>Privacy & Permissions</Title>
            <Subtitle>Control your data and communication preferences</Subtitle>
          </TitleSection>
          
          <StatsCard>
            <StatItem>
              <StatValue>
                {Object.values(permissions.emailPreferences || {}).filter(Boolean).length +
                 Object.values(permissions.smsPreferences || {}).filter(Boolean).length}
              </StatValue>
              <StatLabel>Active Notifications</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem>
              <StatValue>
                {permissions.accountVisibility === 'hidden' ? 'Private' : 'Public'}
              </StatValue>
              <StatLabel>Profile Status</StatLabel>
            </StatItem>
          </StatsCard>
        </HeaderContent>
      </HeaderSection>

      <ContentSection>
        <PermissionsGrid>
          {/* Communication Preferences */}
          <PermissionSection>
            <SectionHeader>
              <SectionIcon $color="primary">
                <FaBell />
              </SectionIcon>
              <SectionInfo>
                <SectionTitle>Communication</SectionTitle>
                <SectionDescription>
                  Choose how we communicate with you
                </SectionDescription>
              </SectionInfo>
            </SectionHeader>

            <SectionContent>
              {/* Email Preferences */}
              <SubSection>
                <SubSectionHeader>
                  <FaEnvelope />
                  <SubSectionTitle>Email Notifications</SubSectionTitle>
                </SubSectionHeader>
                <PreferenceList>
                  {[
                    { type: "promotions", label: "Promotions & Offers", desc: "Special offers and discounts" },
                    { type: "newsletters", label: "Newsletters", desc: "Company updates and news" },
                    { type: "accountUpdates", label: "Account Updates", desc: "Important account notifications" }
                  ].map((item) => (
                    <PreferenceItem key={item.type}>
                      <PreferenceInfo>
                        <PreferenceName>{item.label}</PreferenceName>
                        <PreferenceDesc>{item.desc}</PreferenceDesc>
                      </PreferenceInfo>
                      <ToggleSwitch
                        checked={permissions.emailPreferences?.[item.type]}
                        onChange={() => toggleEmailPreference(item.type)}
                      />
                    </PreferenceItem>
                  ))}
                </PreferenceList>
              </SubSection>

              {/* SMS Preferences */}
              <SubSection>
                <SubSectionHeader>
                  <FaComment />
                  <SubSectionTitle>SMS Notifications</SubSectionTitle>
                </SubSectionHeader>
                <PreferenceList>
                  {[
                    { type: "promotions", label: "Promotional Messages", desc: "Special offers via SMS" },
                    { type: "orderUpdates", label: "Order Updates", desc: "Shipping and delivery updates" }
                  ].map((item) => (
                    <PreferenceItem key={item.type}>
                      <PreferenceInfo>
                        <PreferenceName>{item.label}</PreferenceName>
                        <PreferenceDesc>{item.desc}</PreferenceDesc>
                      </PreferenceInfo>
                      <ToggleSwitch
                        checked={permissions.smsPreferences?.[item.type]}
                        onChange={() => toggleSMSPreference(item.type)}
                      />
                    </PreferenceItem>
                  ))}
                </PreferenceList>
              </SubSection>
            </SectionContent>
          </PermissionSection>

          {/* Data & Privacy */}
          <PermissionSection>
            <SectionHeader>
              <SectionIcon $color="green">
                <FaShieldAlt />
              </SectionIcon>
              <SectionInfo>
                <SectionTitle>Data & Privacy</SectionTitle>
                <SectionDescription>
                  Control how your data is used and shared
                </SectionDescription>
              </SectionInfo>
            </SectionHeader>

            <SectionContent>
              {/* Data Sharing */}
              <SubSection>
                <SubSectionHeader>
                  <FaChartBar />
                  <SubSectionTitle>Data Sharing</SubSectionTitle>
                </SubSectionHeader>
                <PreferenceList>
                  {[
                    { type: "analytics", label: "Help Improve Services", desc: "Share usage data to help us improve" },
                    { type: "personalizedAds", label: "Personalized Advertising", desc: "See ads tailored to your interests" },
                    { type: "thirdParties", label: "Share with Partners", desc: "Allow trusted partners to offer services" }
                  ].map((item) => (
                    <PreferenceItem key={item.type}>
                      <PreferenceInfo>
                        <PreferenceName>{item.label}</PreferenceName>
                        <PreferenceDesc>{item.desc}</PreferenceDesc>
                      </PreferenceInfo>
                      <ToggleSwitch
                        checked={permissions.dataSharing?.[item.type]}
                        onChange={() => toggleDataSharing(item.type)}
                      />
                    </PreferenceItem>
                  ))}
                </PreferenceList>
              </SubSection>

              {/* Location Access */}
              <SubSection>
                <SubSectionHeader>
                  <FaMapMarkerAlt />
                  <SubSectionTitle>Location Access</SubSectionTitle>
                </SubSectionHeader>
                <RadioGroup>
                  {[
                    { value: "full", label: "Full Access", desc: "Allow precise location for all services", icon: FaMapMarkerAlt },
                    { value: "limited", label: "Limited Access", desc: "Only when using location features", icon: FaMapMarkerAlt },
                    { value: "none", label: "No Access", desc: "Don't allow location access", icon: FaTimes }
                  ].map((option) => (
                    <RadioOption 
                      key={option.value}
                      selected={permissions.locationAccess === option.value}
                      onClick={() => changeLocationAccess(option.value)}
                    >
                      <RadioIndicator selected={permissions.locationAccess === option.value}>
                        {permissions.locationAccess === option.value && <FaCheck />}
                      </RadioIndicator>
                      <RadioContent>
                        <RadioLabel>{option.label}</RadioLabel>
                        <RadioDesc>{option.desc}</RadioDesc>
                      </RadioContent>
                    </RadioOption>
                  ))}
                </RadioGroup>
              </SubSection>
            </SectionContent>
          </PermissionSection>

          {/* Social & Visibility */}
          <PermissionSection>
            <SectionHeader>
              <SectionIcon $color="blue">
                <FaUsers />
              </SectionIcon>
              <SectionInfo>
                <SectionTitle>Social & Visibility</SectionTitle>
                <SectionDescription>
                  Manage your social sharing and profile visibility
                </SectionDescription>
              </SectionInfo>
            </SectionHeader>

            <SectionContent>
              {/* Social Sharing */}
              <SubSection>
                <SubSectionHeader>
                  <FaShareAlt />
                  <SubSectionTitle>Social Sharing</SubSectionTitle>
                </SubSectionHeader>
                <PreferenceItem>
                  <PreferenceInfo>
                    <PreferenceName>Share Activity</PreferenceName>
                    <PreferenceDesc>Share your purchases and reviews on social media</PreferenceDesc>
                  </PreferenceInfo>
                  <ToggleSwitch
                    checked={permissions.socialMediaSharing}
                    onChange={toggleSocialSharing}
                  />
                </PreferenceItem>
              </SubSection>

              {/* Account Visibility */}
              <SubSection>
                <SubSectionHeader>
                  <FaUser />
                  <SubSectionTitle>Account Visibility</SubSectionTitle>
                </SubSectionHeader>
                <RadioGroup>
                  {[
                    { value: "standard", label: "Standard Visibility", desc: "Profile visible to other users", icon: FaEye },
                    { value: "private", label: "Private Account", desc: "Only approved followers can see profile", icon: FaEyeSlash },
                    { value: "hidden", label: "Hidden Account", desc: "Profile not visible to anyone", icon: FaUser }
                  ].map((option) => (
                    <RadioOption 
                      key={option.value}
                      selected={permissions.accountVisibility === option.value}
                      onClick={() => changeAccountVisibility(option.value)}
                    >
                      <RadioIndicator selected={permissions.accountVisibility === option.value}>
                        {permissions.accountVisibility === option.value && <FaCheck />}
                      </RadioIndicator>
                      <RadioContent>
                        <RadioLabel>{option.label}</RadioLabel>
                        <RadioDesc>{option.desc}</RadioDesc>
                      </RadioContent>
                    </RadioOption>
                  ))}
                </RadioGroup>
              </SubSection>
            </SectionContent>
          </PermissionSection>

          {/* Data Management */}
          <PermissionSection>
            <SectionHeader>
              <SectionIcon $color="purple">
                <FaDatabase />
              </SectionIcon>
              <SectionInfo>
                <SectionTitle>Data Management</SectionTitle>
                <SectionDescription>
                  Manage your personal data and account
                </SectionDescription>
              </SectionInfo>
            </SectionHeader>

            <SectionContent>
              {/* Data Export */}
              <DataAction>
                <DataActionInfo>
                  <DataActionIcon $status={exportStatus}>
                    <FaDownload />
                  </DataActionIcon>
                  <DataActionContent>
                    <DataActionName>Download Your Data</DataActionName>
                    <DataActionDesc>Get a copy of all your personal data in a readable format</DataActionDesc>
                  </DataActionContent>
                </DataActionInfo>
                <DownloadButton
                  onClick={downloadData}
                  disabled={exportStatus === "pending"}
                  $status={exportStatus}
                >
                  {exportStatus === "pending" ? (
                    <>
                      <ButtonSpinner />
                      Processing...
                    </>
                  ) : exportStatus === "success" ? (
                    <>
                      <FaCheck />
                      Download Sent!
                    </>
                  ) : exportStatus === "error" ? (
                    <>
                      <FaTimes />
                      Try Again
                    </>
                  ) : (
                    <>
                      <FaDownload />
                      Request Download
                    </>
                  )}
                </DownloadButton>
              </DataAction>

              {/* Account Deletion */}
              <DataAction $danger>
                <DataActionInfo>
                  <DataActionIcon $danger>
                    <FaTrash />
                  </DataActionIcon>
                  <DataActionContent>
                    <DataActionName>Delete Your Account</DataActionName>
                    <DataActionDesc>
                      {deletionStatus === "pending" ? (
                        <CountdownText>
                          Account will be deleted in: <strong>{countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s</strong>
                        </CountdownText>
                      ) : (
                        "Permanently remove your account and all associated data"
                      )}
                    </DataActionDesc>
                  </DataActionContent>
                </DataActionInfo>
                
                {deletionStatus === "pending" ? (
                  <CancelButton onClick={handleCancelDeletion}>
                    <FaTimes />
                    Cancel Deletion
                  </CancelButton>
                ) : (
                  <DeleteButton onClick={handleDeleteAccount}>
                    <FaTrash />
                    Delete Account
                  </DeleteButton>
                )}
              </DataAction>
            </SectionContent>
          </PermissionSection>
        </PermissionsGrid>

        <PrivacySection>
          <PrivacyContent>
            <PrivacyIcon>
              <FaLock />
            </PrivacyIcon>
            <PrivacyText>
              We respect your privacy and are committed to protecting your personal data. 
              For more information, please review our{" "}
              <PrivacyLink href="#">Privacy Policy</PrivacyLink>.
            </PrivacyText>
          </PrivacyContent>
        </PrivacySection>
      </ContentSection>
    </PageContainer>
  );
};

// Modern Toggle Switch Component
const ToggleSwitch = ({ checked, onChange }) => (
  <SwitchContainer>
    <SwitchInput
      type="checkbox"
      checked={checked}
      onChange={onChange}
    />
    <SwitchSlider checked={checked}>
      <SwitchKnob checked={checked} />
    </SwitchSlider>
  </SwitchContainer>
);

// Button Spinner Component
const ButtonSpinner = styled.div`
  width: 1.6rem;
  height: 1.6rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Modern Styled Components
const PageContainer = styled.div`
  max-width: 120rem;
  margin: 0 auto;
  padding: 2.4rem;

  @media ${devicesMax.md} {
    padding: 1.6rem;
  }
`;

const HeaderSection = styled.section`
  margin-bottom: 3.2rem;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.4rem;

  @media ${devicesMax.lg} {
    flex-direction: column;
    gap: 2rem;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--color-grey-900);
  margin-bottom: 0.8rem;
  background: linear-gradient(135deg, var(--color-grey-900) 0%, var(--color-grey-700) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media ${devicesMax.md} {
    font-size: 2.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
  max-width: 50rem;
`;

const StatsCard = styled.div`
  display: flex;
  background: var(--color-white-0);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);
  min-width: 25rem;

  @media ${devicesMax.sm} {
    min-width: auto;
    width: 100%;
  }
`;

const StatItem = styled.div`
  flex: 1;
  text-align: center;
  padding: 0 1.2rem;
`;

const StatValue = styled.div`
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--color-primary-600);
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-600);
  margin-top: 0.4rem;
  font-weight: 500;
`;

const StatDivider = styled.div`
  width: 1px;
  background: var(--color-grey-200);
  margin: 0.4rem 0;
`;

const ContentSection = styled.section`
  background: var(--color-white-0);
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);
  overflow: hidden;
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2.4rem;
  padding: 3.2rem;

  @media ${devicesMax.lg} {
    grid-template-columns: 1fr;
    padding: 2.4rem;
  }
`;

const PermissionSection = styled.div`
  background: var(--color-white-0);
  border: 1px solid var(--color-grey-200);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--color-primary-200);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 2.4rem;
  background: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-200);
  gap: 1.6rem;
`;

const SectionIcon = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 14px;
  background: ${props => {
    switch (props.$color) {
      case 'green': return 'linear-gradient(135deg, var(--color-green-500) 0%, var(--color-green-600) 100%)';
      case 'blue': return 'linear-gradient(135deg, var(--color-blue-500) 0%, var(--color-blue-600) 100%)';
      case 'purple': return 'linear-gradient(135deg, var(--color-purple-500) 0%, var(--color-purple-600) 100%)';
      case 'primary':
      default: return 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  font-size: 2rem;
`;

const SectionInfo = styled.div`
  flex: 1;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 0.4rem;
`;

const SectionDescription = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const SectionContent = styled.div`
  padding: 0;
`;

const SubSection = styled.div`
  padding: 2rem 2.4rem;
  border-bottom: 1px solid var(--color-grey-100);

  &:last-child {
    border-bottom: none;
  }
`;

const SubSectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.6rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);

  svg {
    color: var(--color-grey-500);
    font-size: 1.6rem;
  }
`;

const SubSectionTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
`;

const PreferenceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const PreferenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.6rem;
`;

const PreferenceInfo = styled.div`
  flex: 1;
`;

const PreferenceName = styled.h4`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 0.4rem;
`;

const PreferenceDesc = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-500);
  line-height: 1.4;
`;

// Modern Toggle Switch Styles
const SwitchContainer = styled.label`
  position: relative;
  display: inline-block;
  width: 5rem;
  height: 2.6rem;
  cursor: pointer;
  flex-shrink: 0;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  }

  &:checked + span > span {
    transform: translateX(2.4rem);
  }
`;

const SwitchSlider = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-grey-300);
  transition: all 0.3s ease;
  border-radius: 3.4rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SwitchKnob = styled.span`
  position: absolute;
  content: "";
  height: 1.8rem;
  width: 1.8rem;
  left: 0.4rem;
  bottom: 0.4rem;
  background: var(--color-white-0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RadioOption = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  padding: 1.2rem;
  border: 2px solid ${props => props.selected ? 'var(--color-primary-200)' : 'var(--color-grey-200)'};
  border-radius: 12px;
  background: ${props => props.selected ? 'var(--color-primary-50)' : 'var(--color-white-0)'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary-300);
    background: var(--color-primary-25);
  }
`;

const RadioIndicator = styled.div`
  width: 2rem;
  height: 2rem;
  border: 2px solid ${props => props.selected ? 'var(--color-primary-500)' : 'var(--color-grey-400)'};
  border-radius: 50%;
  background: ${props => props.selected ? 'var(--color-primary-500)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 0.2rem;
`;

const RadioContent = styled.div`
  flex: 1;
`;

const RadioLabel = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 0.2rem;
`;

const RadioDesc = styled.div`
  font-size: 1.2rem;
  color: var(--color-grey-500);
`;

const DataAction = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.4rem;
  border-bottom: 1px solid var(--color-grey-100);
  background: ${props => props.$danger ? 'var(--color-red-50)' : 'transparent'};

  &:last-child {
    border-bottom: none;
  }

  @media ${devicesMax.sm} {
    flex-direction: column;
    gap: 1.6rem;
    align-items: stretch;
  }
`;

const DataActionInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  flex: 1;
`;

const DataActionIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 10px;
  background: ${props => {
    if (props.$danger) return 'var(--color-red-100)';
    if (props.$status === 'success') return 'var(--color-green-100)';
    if (props.$status === 'error') return 'var(--color-red-100)';
    if (props.$status === 'pending') return 'var(--color-blue-100)';
    return 'var(--color-grey-100)';
  }};
  color: ${props => {
    if (props.$danger) return 'var(--color-red-600)';
    if (props.$status === 'success') return 'var(--color-green-600)';
    if (props.$status === 'error') return 'var(--color-red-600)';
    if (props.$status === 'pending') return 'var(--color-blue-600)';
    return 'var(--color-grey-600)';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  flex-shrink: 0;
`;

const DataActionContent = styled.div`
  flex: 1;
`;

const DataActionName = styled.h4`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 0.4rem;
`;

const DataActionDesc = styled.p`
  font-size: 1.3rem;
  color: var(--color-grey-500);
  line-height: 1.4;
`;

const CountdownText = styled.span`
  font-size: 1.3rem;
  color: var(--color-red-600);

  strong {
    font-weight: 700;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.6rem;
  border-radius: 8px;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 16rem;
  justify-content: center;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media ${devicesMax.sm} {
    width: 100%;
  }

  svg {
    font-size: 1.4rem;
  }
`;

const DownloadButton = styled(ActionButton)`
  background: ${props => {
    switch (props.$status) {
      case 'success': return 'var(--color-green-100)';
      case 'error': return 'var(--color-red-100)';
      case 'pending': return 'var(--color-blue-100)';
      default: return 'var(--color-primary-100)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'success': return 'var(--color-green-700)';
      case 'error': return 'var(--color-red-700)';
      case 'pending': return 'var(--color-blue-700)';
      default: return 'var(--color-primary-700)';
    }
  }};

  &:hover:not(:disabled) {
    background: ${props => {
      switch (props.$status) {
        case 'success': return 'var(--color-green-200)';
        case 'error': return 'var(--color-red-200)';
        case 'pending': return 'var(--color-blue-200)';
        default: return 'var(--color-primary-200)';
      }
    }};
    transform: translateY(-1px);
  }
`;

const DeleteButton = styled(ActionButton)`
  background: var(--color-red-100);
  color: var(--color-red-700);

  &:hover:not(:disabled) {
    background: var(--color-red-200);
    transform: translateY(-1px);
  }
`;

const CancelButton = styled(ActionButton)`
  background: var(--color-grey-100);
  color: var(--color-grey-700);

  &:hover:not(:disabled) {
    background: var(--color-grey-200);
    transform: translateY(-1px);
  }
`;

const PrivacySection = styled.div`
  padding: 2.4rem 3.2rem;
  background: var(--color-grey-50);
  border-top: 1px solid var(--color-grey-200);
`;

const PrivacyContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  max-width: 60rem;
  margin: 0 auto;
`;

const PrivacyIcon = styled.div`
  color: var(--color-grey-500);
  font-size: 1.6rem;
`;

const PrivacyText = styled.span`
  font-size: 1.4rem;
  color: var(--color-grey-600);
  text-align: center;
`;

const PrivacyLink = styled.a`
  color: var(--color-primary-600);
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

// Loading and Error States (simplified versions)
const LoadingState = ({ message }) => (
  <LoadingContainer>
    <Spinner />
    <LoadingText>{message}</LoadingText>
  </LoadingContainer>
);

const ErrorState = ({ title, message }) => (
  <ErrorContainer>
    <ErrorTitle>{title}</ErrorTitle>
    <ErrorMessage>{message}</ErrorMessage>
  </ErrorContainer>
);

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1.6rem;
`;

const Spinner = styled.div`
  width: 4rem;
  height: 4rem;
  border: 3px solid var(--color-grey-200);
  border-top: 3px solid var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const LoadingText = styled.div`
  font-size: 1.6rem;
  color: var(--color-grey-600);
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1.6rem;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  font-size: 2rem;
  color: var(--color-red-600);
  margin-bottom: 0.8rem;
`;

const ErrorMessage = styled.p`
  font-size: 1.6rem;
  color: var(--color-grey-600);
`;

export default PermissionsPage;