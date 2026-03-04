import { useState } from "react";
import styled from "styled-components";
import { keyframes } from "styled-components";
import useAuth from "../../shared/hooks/useAuth";
import { ShimmerAddressCards } from "../../components/loading";
import ErrorDisplay from "../../shared/components/ErrorDisplay";
import useDynamicPageTitle from "../../shared/hooks/useDynamicPageTitle";

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
import OrdersTab from "./tabs/OrdersTab";
import AddressTab from "./tabs/AddressTab";
import NotificationTab from "./tabs/NotificationTab";
import PaymentTab from "./tabs/PaymentTab";

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


const ProfilePage = () => {
  useDynamicPageTitle({ title: "My Account | Saiisai", defaultTitle: "My Account | Saiisai" });

  const {
    profileData,
    isProfileLoading,
    profileError: profileErrorFromHook,
    userData,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("account");

  // Show loading state (shimmer skeleton)
  if (isProfileLoading) {
    return (
      <PageContainer>
        <ShimmerAddressCards />
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
              <SecurityTab userInfo={userInfo} connectedAccounts={profileData.connectedAccounts} />
            </TabPanelContainer>

            <TabPanelContainer active={activeTab === "twofactor"}>
              <TwoFactorTab />
            </TabPanelContainer>

            <TabPanelContainer active={activeTab === "devices"}>
              <DevicesTab />
            </TabPanelContainer>

            <TabPanelContainer active={activeTab === "orders"}>
              <OrdersTab />
            </TabPanelContainer>

            <TabPanelContainer active={activeTab === "address"}>
              <AddressTab userInfo={userInfo} />
            </TabPanelContainer>

            <TabPanelContainer active={activeTab === "notifications"}>
              <NotificationTab />
            </TabPanelContainer>

            <TabPanelContainer active={activeTab === "payment"}>
              <PaymentTab />
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
