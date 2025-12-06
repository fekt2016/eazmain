import React from "react";
import styled, { keyframes } from "styled-components";
import { devicesMax } from '../../shared/styles/breakpoint';
import {
  useNotificationSettings,
  useUpdateNotificationSetting,
  useResetNotificationSettings,
} from '../../shared/hooks/useNotification';
import { LoadingState, ErrorState, ButtonSpinner } from '../../components/loading';
import { 
  FaBell, 
  FaEnvelope, 
  FaMobile, 
  FaComment, 
  FaMoon,
  FaSave,
  FaUndo,
  FaUserShield,
  FaShoppingBag,
  FaTag,
  FaRocket,
  FaInfoCircle
} from "react-icons/fa";

const NotificationSettingsPage = () => {
  const { data: settings, isLoading, isError } = useNotificationSettings();
  const updateSetting = useUpdateNotificationSetting();
  const resetSettings = useResetNotificationSettings();

  // Toggle notification setting
  const toggleSetting = (channel, type) => {
    // Toggling notification setting
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
    return <LoadingState message="Loading notification settings..." />;
  }

  if (isError) {
    return (
      <ErrorState 
        title="Failed to load notification settings" 
        message="Please try again later."
      />
    );
  }

  return (
    <PageContainer>
      <HeaderSection>
        <HeaderContent>
          <TitleSection>
            <Title>Notification Settings</Title>
            <Subtitle>Customize how and when you receive notifications</Subtitle>
          </TitleSection>
          
          <StatsCard>
            <StatItem>
              <StatValue>
                {Object.values(settings.email).filter(Boolean).length +
                 Object.values(settings.push).filter(Boolean).length +
                 Object.values(settings.sms).filter(Boolean).length}
              </StatValue>
              <StatLabel>Active Notifications</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem>
              <StatValue>
                {settings.quietHours.enabled ? "On" : "Off"}
              </StatValue>
              <StatLabel>Quiet Hours</StatLabel>
            </StatItem>
          </StatsCard>
        </HeaderContent>
      </HeaderSection>

      <ContentSection>
        <NotificationGrid>
          {/* Email Notifications */}
          <NotificationSection>
            <SectionHeader>
              <SectionIcon $color="primary">
                <FaEnvelope />
              </SectionIcon>
              <SectionInfo>
                <SectionTitle>Email Notifications</SectionTitle>
                <SectionDescription>
                  Receive updates via email
                </SectionDescription>
              </SectionInfo>
            </SectionHeader>
            <SectionContent>
              <NotificationItem>
                <NotificationInfo>
                  <NotificationIcon>
                    <FaShoppingBag />
                  </NotificationIcon>
                  <NotificationText>
                    <NotificationName>Order Updates</NotificationName>
                    <NotificationDesc>
                      Shipping confirmations and delivery updates
                    </NotificationDesc>
                  </NotificationText>
                </NotificationInfo>
                <ToggleSwitch
                  checked={settings.email.orderUpdates}
                  onChange={() => toggleSetting("email", "orderUpdates")}
                />
              </NotificationItem>

              <NotificationItem>
                <NotificationInfo>
                  <NotificationIcon>
                    <FaTag />
                  </NotificationIcon>
                  <NotificationText>
                    <NotificationName>Promotions & Offers</NotificationName>
                    <NotificationDesc>
                      Special offers, discounts, and deals
                    </NotificationDesc>
                  </NotificationText>
                </NotificationInfo>
                <ToggleSwitch
                  checked={settings.email.promotions}
                  onChange={() => toggleSetting("email", "promotions")}
                />
              </NotificationItem>

              <NotificationItem>
                <NotificationInfo>
                  <NotificationIcon>
                    <FaUserShield />
                  </NotificationIcon>
                  <NotificationText>
                    <NotificationName>Account Activity</NotificationName>
                    <NotificationDesc>
                      Security alerts and account changes
                    </NotificationDesc>
                  </NotificationText>
                </NotificationInfo>
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
              <SectionIcon $color="green">
                <FaBell />
              </SectionIcon>
              <SectionInfo>
                <SectionTitle>Push Notifications</SectionTitle>
                <SectionDescription>
                  App notifications on your device
                </SectionDescription>
              </SectionInfo>
            </SectionHeader>
            <SectionContent>
              <NotificationItem>
                <NotificationInfo>
                  <NotificationIcon>
                    <FaShoppingBag />
                  </NotificationIcon>
                  <NotificationText>
                    <NotificationName>Order Updates</NotificationName>
                    <NotificationDesc>
                      Real-time order status changes
                    </NotificationDesc>
                  </NotificationText>
                </NotificationInfo>
                <ToggleSwitch
                  checked={settings.push.orderUpdates}
                  onChange={() => toggleSetting("push", "orderUpdates")}
                />
              </NotificationItem>

              <NotificationItem>
                <NotificationInfo>
                  <NotificationIcon>
                    <FaTag />
                  </NotificationIcon>
                  <NotificationText>
                    <NotificationName>Price Alerts</NotificationName>
                    <NotificationDesc>
                      Notifications for price drops on watched items
                    </NotificationDesc>
                  </NotificationText>
                </NotificationInfo>
                <ToggleSwitch
                  checked={settings.push.priceAlerts}
                  onChange={() => toggleSetting("push", "priceAlerts")}
                />
              </NotificationItem>

              <NotificationItem>
                <NotificationInfo>
                  <NotificationIcon>
                    <FaRocket />
                  </NotificationIcon>
                  <NotificationText>
                    <NotificationName>New Features</NotificationName>
                    <NotificationDesc>
                      Updates about app improvements and features
                    </NotificationDesc>
                  </NotificationText>
                </NotificationInfo>
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
              <SectionIcon $color="blue">
                <FaComment />
              </SectionIcon>
              <SectionInfo>
                <SectionTitle>SMS Notifications</SectionTitle>
                <SectionDescription>
                  Text messages for urgent updates
                </SectionDescription>
              </SectionInfo>
            </SectionHeader>
            <SectionContent>
              <NotificationItem>
                <NotificationInfo>
                  <NotificationIcon>
                    <FaShoppingBag />
                  </NotificationIcon>
                  <NotificationText>
                    <NotificationName>Order Updates</NotificationName>
                    <NotificationDesc>
                      Critical delivery and shipping notifications
                    </NotificationDesc>
                  </NotificationText>
                </NotificationInfo>
                <ToggleSwitch
                  checked={settings.sms.orderUpdates}
                  onChange={() => toggleSetting("sms", "orderUpdates")}
                />
              </NotificationItem>

              <NotificationItem>
                <NotificationInfo>
                  <NotificationIcon>
                    <FaUserShield />
                  </NotificationIcon>
                  <NotificationText>
                    <NotificationName>Security Alerts</NotificationName>
                    <NotificationDesc>
                      Important account security notifications
                    </NotificationDesc>
                  </NotificationText>
                </NotificationInfo>
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
              <SectionIcon $color="purple">
                <FaMoon />
              </SectionIcon>
              <SectionInfo>
                <SectionTitle>Quiet Hours</SectionTitle>
                <SectionDescription>
                  Mute non-urgent notifications during specific hours
                </SectionDescription>
              </SectionInfo>
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
                    Pause non-essential notifications during your chosen hours
                  </QuietHoursDesc>
                </QuietHoursLabel>
              </QuietHoursToggle>

              {settings.quietHours.enabled && (
                <TimePickerContainer>
                  <TimePickerTitle>Quiet Hours Schedule</TimePickerTitle>
                  <TimePickerGrid>
                    <TimePickerGroup>
                      <TimeLabel>Start Time</TimeLabel>
                      <TimeInput
                        type="time"
                        value={settings.quietHours.startTime}
                        onChange={(e) =>
                          changeQuietHoursTime("startTime", e.target.value)
                        }
                      />
                    </TimePickerGroup>

                    <TimePickerGroup>
                      <TimeLabel>End Time</TimeLabel>
                      <TimeInput
                        type="time"
                        value={settings.quietHours.endTime}
                        onChange={(e) =>
                          changeQuietHoursTime("endTime", e.target.value)
                        }
                      />
                    </TimePickerGroup>
                  </TimePickerGrid>
                  <TimePickerNote>
                    Non-urgent notifications will be paused during these hours
                  </TimePickerNote>
                </TimePickerContainer>
              )}
            </SectionContent>
          </NotificationSection>
        </NotificationGrid>

        <ActionSection>
          <ActionButtons>
            <ResetButton
              onClick={resetToDefaults}
              disabled={resetSettings.isPending}
            >
              <FaUndo />
              {resetSettings.isPending ? <ButtonSpinner size="sm" /> : "Reset to Defaults"}
            </ResetButton>
            <SaveButton onClick={savePreferences}>
              <FaSave />
              Save Preferences
            </SaveButton>
          </ActionButtons>
        </ActionSection>

        <InfoSection>
          <InfoHeader>
            <FaInfoCircle />
            Important Note
          </InfoHeader>
          <InfoContent>
            Urgent notifications about your orders and account security will always be sent, 
            regardless of your notification preferences or quiet hours settings.
          </InfoContent>
        </InfoSection>
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

const NotificationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2.4rem;
  padding: 3.2rem;

  @media ${devicesMax.lg} {
    grid-template-columns: 1fr;
    padding: 2.4rem;
  }
`;

const NotificationSection = styled.div`
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

const NotificationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.4rem;
  border-bottom: 1px solid var(--color-grey-100);
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-grey-50);
  }
`;

const NotificationInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  flex: 1;
`;

const NotificationIcon = styled.div`
  width: 4rem;
  height: 4rem;
  background: var(--color-grey-100);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-600);
  font-size: 1.6rem;
  flex-shrink: 0;
`;

const NotificationText = styled.div`
  flex: 1;
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
  line-height: 1.4;
`;

// Modern Toggle Switch Styles
const SwitchContainer = styled.label`
  position: relative;
  display: inline-block;
  width: 6rem;
  height: 3.2rem;
  cursor: pointer;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  }

  &:checked + span > span {
    transform: translateX(2.8rem);
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
  height: 2.4rem;
  width: 2.4rem;
  left: 0.4rem;
  bottom: 0.4rem;
  background: var(--color-white-0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const QuietHoursToggle = styled.div`
  display: flex;
  align-items: center;
  padding: 2rem 2.4rem;
  border-bottom: 1px solid var(--color-grey-100);
  gap: 1.6rem;
`;

const QuietHoursLabel = styled.div`
  flex: 1;
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

const TimePickerContainer = styled.div`
  padding: 2rem 2.4rem;
  background: var(--color-grey-50);
  margin: 0 2.4rem 2.4rem;
  border-radius: 12px;
`;

const TimePickerTitle = styled.h4`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
  margin-bottom: 1.6rem;
`;

const TimePickerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.6rem;

  @media ${devicesMax.sm} {
    grid-template-columns: 1fr;
  }
`;

const TimePickerGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const TimeLabel = styled.label`
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--color-grey-700);
`;

const TimeInput = styled.input`
  padding: 1.2rem 1.6rem;
  border: 1px solid var(--color-grey-300);
  border-radius: 12px;
  font-size: 1.6rem;
  background: var(--color-white-0);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const TimePickerNote = styled.p`
  font-size: 1.2rem;
  color: var(--color-grey-500);
  margin-top: 1.2rem;
  font-style: italic;
`;

const ActionSection = styled.div`
  padding: 2.4rem 3.2rem;
  border-top: 1px solid var(--color-grey-200);
  background: var(--color-grey-50);
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.6rem;

  @media ${devicesMax.sm} {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 2.4rem;
  border-radius: 12px;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 18rem;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media ${devicesMax.sm} {
    width: 100%;
    justify-content: center;
  }
`;

const ResetButton = styled(ActionButton)`
  background: var(--color-white-0);
  color: var(--color-grey-700);
  border: 1px solid var(--color-grey-300);

  &:hover:not(:disabled) {
    background: var(--color-grey-50);
    border-color: var(--color-grey-400);
    transform: translateY(-1px);
  }
`;

const SaveButton = styled(ActionButton)`
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--color-white-0);
  border: none;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
  }
`;

const InfoSection = styled.div`
  padding: 2.4rem 3.2rem;
  background: var(--color-blue-50);
  border-top: 1px solid var(--color-blue-200);
`;

const InfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-blue-700);
  margin-bottom: 0.8rem;

  svg {
    font-size: 1.8rem;
  }
`;

const InfoContent = styled.p`
  font-size: 1.4rem;
  color: var(--color-blue-700);
  line-height: 1.6;
  margin: 0;
`;

export default NotificationSettingsPage;