import { useState, useEffect } from "react";
import styled from "styled-components";
import { keyframes } from "styled-components";
import { createGlobalStyle } from "styled-components";
import useAuth from "../../shared/hooks/useAuth";
import { LoadingState } from "../../components/loading";
import ErrorDisplay from "../../shared/components/ErrorDisplay";

// Components
import ProfileHeader from "./components/ProfileHeader";
import SidebarTabs from "./components/SidebarTabs";
import MobileTabBar from "./components/MobileTabBar";
import TabPanelContainer from "./components/TabPanelContainer";

// Tabs
import AccountTab from "./tabs/AccountTab";
import SecurityTab from "./tabs/SecurityTab";
import TwoFactorTab from "./tabs/TwoFactorTab";
import DevicesTab from "./tabs/DevicesTab";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Global styles for profile page
const GlobalProfileStyles = createGlobalStyle`
  :root {
    --color-primary: var(--color-primary-500);
    --color-primary-hover: var(--color-primary-600);
    --color-accent: #00C896;
    --color-text-dark: #1A1A1A;
    --color-text-light: #6B7280;
    --color-bg-light: #F7F9FC;
    --color-bg-card: #FFFFFF;
    --color-border: #E5E7EB;
    --color-danger: #EF4444;
    --color-success: #22C55E;
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
  }
`;

const ProfilePage = () => {
  const {
    profileData,
    isProfileLoading,
    profileError: profileErrorFromHook,
    userData,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("account");

  // Show loading state
  if (isProfileLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading profile..." />
      </PageContainer>
    );
  }
  
  // Show error state if profile failed to load and user is authenticated
  if (profileErrorFromHook && userData) {
    return (
      <PageContainer>
      <ErrorDisplay
          message={
            profileErrorFromHook?.message ||
            "Failed to load profile data. Please try refreshing the page."
          }
        onRetry={() => window.location.reload()}
      />
      </PageContainer>
    );
  }

  // Don't render if no profile data
  if (!profileData || !profileData.userInfo) {
    return (
      <PageContainer>
        <ErrorDisplay message="Profile data not available. Please try refreshing the page." />
      </PageContainer>
    );
  }

  const userInfo = profileData.userInfo;

  return (
    <>
      <GlobalProfileStyles />
    <PageContainer>
        <ProfileHeader userInfo={userInfo} />

      <ContentWrapper>
        <SidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <MainContent>
          <TabPanelContainer active={activeTab === "account"}>
            <AccountTab userInfo={userInfo} />
          </TabPanelContainer>

          <TabPanelContainer active={activeTab === "security"}>
            <SecurityTab userInfo={userInfo} />
          </TabPanelContainer>

          <TabPanelContainer active={activeTab === "twofactor"}>
            <TwoFactorTab />
          </TabPanelContainer>

          <TabPanelContainer active={activeTab === "devices"}>
            <DevicesTab />
          </TabPanelContainer>
        </MainContent>
      </ContentWrapper>
    </PageContainer>
    </>
  );
};

export default ProfilePage;

// Styled Components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: var(--space-xl);
  font-family: "Inter", sans-serif;
  color: var(--color-text-dark);
  background: var(--color-bg-light);
  animation: ${fadeIn} 0.3s ease;

  @media (max-width: 768px) {
    padding: var(--space-md);
  }
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--space-xl);
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
`;

const MainContent = styled.div`
  min-width: 0;
  animation: ${slideInLeft} 0.3s ease;
`;
