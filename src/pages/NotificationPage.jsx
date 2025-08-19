import React from "react";
import styled from "styled-components";
import { devicesMax } from "../styles/breakpoint";
import {
  useNotificationSettings,
  useUpdateNotificationSetting,
  useResetNotificationSettings,
} from "../hooks/useNotification";

const NotificationSettingsPage = () => {
  const { data: settings, isLoading, isError } = useNotificationSettings();
  const updateSetting = useUpdateNotificationSetting();
  const resetSettings = useResetNotificationSettings();

  // Toggle notification setting
  const toggleSetting = (channel, type) => {
    console.log("channel", channel, "type", type);
    const path = `${channel}.${type}`;
    updateSetting.mutate({ path, value: !settings[channel][type] });
  };

  // Toggle quiet hours
  const toggleQuietHours = () => {
    const path = "quietHours.enabled";
    updateSetting.mutate({ path, value: !settings.quietHours.enabled });
  };

  // Change quiet hours time
  const changeQuietHoursTime = (field, value) => {
    const path = `quietHours.${field}`;
    updateSetting.mutate({ path, value });
  };

  // Save preferences
  const savePreferences = () => {
    alert("Your preferences have been saved!");
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset to default settings?")) {
      resetSettings.mutate();
    }
  };

  if (isLoading) {
    return (
      <LoadingContainer>Loading notification settings...</LoadingContainer>
    );
  }

  if (isError) {
    return (
      <ErrorContainer>
        Failed to load notification settings. Please try again later.
      </ErrorContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>Notification Settings</Title>
        <Subtitle>Manage how and when we notify you</Subtitle>
      </Header>

      <NotificationGrid>
        {/* Email Notifications */}
        <NotificationSection>
          <SectionHeader>
            <SectionIcon>✉️</SectionIcon>
            <SectionTitle>Email Notifications</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <NotificationItem>
              <NotificationLabel>
                <NotificationName>Order Updates</NotificationName>
                <NotificationDesc>
                  Shipping confirmations and delivery updates
                </NotificationDesc>
              </NotificationLabel>
              <ToggleSwitch
                checked={settings.email.orderUpdates}
                onChange={() => toggleSetting("email", "orderUpdates")}
              />
            </NotificationItem>

            <NotificationItem>
              <NotificationLabel>
                <NotificationName>Promotions</NotificationName>
                <NotificationDesc>
                  Special offers and discounts
                </NotificationDesc>
              </NotificationLabel>
              <ToggleSwitch
                checked={settings.email.promotions}
                onChange={() => toggleSetting("email", "promotions")}
              />
            </NotificationItem>

            <NotificationItem>
              <NotificationLabel>
                <NotificationName>Account Activity</NotificationName>
                <NotificationDesc>
                  Security alerts and account changes
                </NotificationDesc>
              </NotificationLabel>
              <ToggleSwitch
                checked={settings.email.accountActivity}
                onChange={() => toggleSetting("email", "accountActivity")}
              />
            </NotificationItem>
          </SectionContent>
        </NotificationSection>

        {/* Push Notifications */}
        <NotificationSection>
          <SectionHeader>
            <SectionIcon>📱</SectionIcon>
            <SectionTitle>Push Notifications</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <NotificationItem>
              <NotificationLabel>
                <NotificationName>Order Updates</NotificationName>
                <NotificationDesc>
                  Real-time order status changes
                </NotificationDesc>
              </NotificationLabel>
              <ToggleSwitch
                checked={settings.push.orderUpdates}
                onChange={() => toggleSetting("push", "orderUpdates")}
              />
            </NotificationItem>

            <NotificationItem>
              <NotificationLabel>
                <NotificationName>Price Alerts</NotificationName>
                <NotificationDesc>
                  Notifications for price drops
                </NotificationDesc>
              </NotificationLabel>
              <ToggleSwitch
                checked={settings.push.priceAlerts}
                onChange={() => toggleSetting("push", "priceAlerts")}
              />
            </NotificationItem>

            <NotificationItem>
              <NotificationLabel>
                <NotificationName>New Features</NotificationName>
                <NotificationDesc>
                  Updates about app improvements
                </NotificationDesc>
              </NotificationLabel>
              <ToggleSwitch
                checked={settings.push.newFeatures}
                onChange={() => toggleSetting("push", "newFeatures")}
              />
            </NotificationItem>
          </SectionContent>
        </NotificationSection>

        {/* SMS Notifications */}
        <NotificationSection>
          <SectionHeader>
            <SectionIcon>💬</SectionIcon>
            <SectionTitle>SMS Notifications</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <NotificationItem>
              <NotificationLabel>
                <NotificationName>Order Updates</NotificationName>
                <NotificationDesc>
                  Critical delivery notifications
                </NotificationDesc>
              </NotificationLabel>
              <ToggleSwitch
                checked={settings.sms.orderUpdates}
                onChange={() => toggleSetting("sms", "orderUpdates")}
              />
            </NotificationItem>

            <NotificationItem>
              <NotificationLabel>
                <NotificationName>Security Alerts</NotificationName>
                <NotificationDesc>
                  Important account security notifications
                </NotificationDesc>
              </NotificationLabel>
              <ToggleSwitch
                checked={settings.sms.securityAlerts}
                onChange={() => toggleSetting("sms", "securityAlerts")}
              />
            </NotificationItem>
          </SectionContent>
        </NotificationSection>

        {/* Quiet Hours */}
        <NotificationSection>
          <SectionHeader>
            <SectionIcon>🌙</SectionIcon>
            <SectionTitle>Quiet Hours</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <QuietHoursToggle>
              <ToggleSwitch
                checked={settings.quietHours.enabled}
                onChange={toggleQuietHours}
              />
              <QuietHoursLabel>
                <QuietHoursName>Enable Quiet Hours</QuietHoursName>
                <QuietHoursDesc>
                  Mute non-urgent notifications during these hours
                </QuietHoursDesc>
              </QuietHoursLabel>
            </QuietHoursToggle>

            {settings.quietHours.enabled && (
              <TimePicker>
                <TimePickerGroup>
                  <TimeLabel>From</TimeLabel>
                  <TimeInput
                    type="time"
                    value={settings.quietHours.startTime}
                    onChange={(e) =>
                      changeQuietHoursTime("startTime", e.target.value)
                    }
                  />
                </TimePickerGroup>

                <TimePickerGroup>
                  <TimeLabel>To</TimeLabel>
                  <TimeInput
                    type="time"
                    value={settings.quietHours.endTime}
                    onChange={(e) =>
                      changeQuietHoursTime("endTime", e.target.value)
                    }
                  />
                </TimePickerGroup>
              </TimePicker>
            )}
          </SectionContent>
        </NotificationSection>
      </NotificationGrid>

      <ActionBar>
        <ResetButton
          onClick={resetToDefaults}
          disabled={resetSettings.isPending}
        >
          {resetSettings.isPending ? "Resetting..." : "Reset to Defaults"}
        </ResetButton>
        <SaveButton onClick={savePreferences}>Save Preferences</SaveButton>
      </ActionBar>

      <InfoNote>
        <InfoIcon>ℹ️</InfoIcon>
        <InfoText>
          Urgent notifications about your orders and account security will
          always be sent, regardless of your preferences.
        </InfoText>
      </InfoNote>
    </PageContainer>
  );
};

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange }) => (
  <SwitchContainer>
    <SwitchInput
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={false}
    />
    <SwitchSlider checked={checked} />
  </SwitchContainer>
);

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
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

const NotificationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2.4rem;
  margin-bottom: 3.2rem;

  @media ${devicesMax.lg} {
    grid-template-columns: 1fr;
  }
`;

const NotificationSection = styled.div`
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

const NotificationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.6rem 0;
  border-bottom: 1px solid var(--color-grey-100);

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationLabel = styled.div`
  flex: 1;
  margin-right: 2rem;
`;

const NotificationName = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 0.4rem;
`;

const NotificationDesc = styled.p`
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

const QuietHoursToggle = styled.div`
  display: flex;
  align-items: center;
  padding: 1.6rem 0;
  border-bottom: 1px solid var(--color-grey-100);
`;

const QuietHoursLabel = styled.div`
  flex: 1;
  margin-left: 1.2rem;
`;

const QuietHoursName = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 0.4rem;
`;

const QuietHoursDesc = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-500);
`;

const TimePicker = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1.6rem;
  padding: 1.6rem;
  background-color: var(--color-grey-50);
  border-radius: var(--border-radius-md);

  @media ${devicesMax.sm} {
    flex-direction: column;
    gap: 1rem;
  }
`;

const TimePickerGroup = styled.div`
  flex: 1;
`;

const TimeLabel = styled.label`
  display: block;
  margin-bottom: 0.8rem;
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-grey-700);
`;

const TimeInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-size: 1.6rem;

  &:focus {
    outline: none;
    border-color: var(--color-brand-600);
    box-shadow: 0 0 0 2px var(--color-brand-100);
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 3.2rem;
  gap: 1.6rem;

  @media ${devicesMax.sm} {
    flex-direction: column;
  }
`;

const ResetButton = styled.button`
  padding: 1.4rem 2.4rem;
  background-color: var(--color-grey-100);
  color: var(--color-grey-700);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-grey-200);
    border-color: var(--color-grey-400);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SaveButton = styled.button`
  padding: 1.4rem 2.4rem;
  background-color: var(--color-brand-600);
  color: var(--color-white-0);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-brand-700);
  }
`;

const InfoNote = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 1.6rem;
  background-color: var(--color-blue-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-blue-200);
`;

const InfoIcon = styled.span`
  font-size: 1.8rem;
  margin-right: 1.2rem;
  margin-top: 0.3rem;
`;

const InfoText = styled.p`
  font-size: 1.4rem;
  color: var(--color-blue-800);
  line-height: 1.6;
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

export default NotificationSettingsPage;
