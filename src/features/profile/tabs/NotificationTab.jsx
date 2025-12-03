import { useState } from "react";
import {
  ContentCard,
  CardTitle,
  CardDescription,
  FormGroup,
  Label,
  Button,
} from "../components/TabPanelContainer";
import { ButtonSpinner } from "../../../components/loading";
import styled from "styled-components";

const NotificationTab = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    securityAlerts: true,
    newsletter: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert("Notification settings saved!");
    }, 1000);
  };

  return (
    <ContentCard>
      <CardTitle>Notification Preferences</CardTitle>
      <CardDescription>
        Choose how you want to receive notifications and updates.
      </CardDescription>

      <FormGroup>
        <NotificationItem>
          <NotificationInfo>
            <NotificationLabel>Email Notifications</NotificationLabel>
            <NotificationDescription>
              Receive updates via email
            </NotificationDescription>
          </NotificationInfo>
          <ToggleSwitch
            checked={settings.emailNotifications}
            onChange={() => handleToggle("emailNotifications")}
          />
        </NotificationItem>

        <NotificationItem>
          <NotificationInfo>
            <NotificationLabel>SMS Notifications</NotificationLabel>
            <NotificationDescription>
              Receive updates via SMS
            </NotificationDescription>
          </NotificationInfo>
          <ToggleSwitch
            checked={settings.smsNotifications}
            onChange={() => handleToggle("smsNotifications")}
          />
        </NotificationItem>

        <NotificationItem>
          <NotificationInfo>
            <NotificationLabel>Order Updates</NotificationLabel>
            <NotificationDescription>
              Get notified about order status changes
            </NotificationDescription>
          </NotificationInfo>
          <ToggleSwitch
            checked={settings.orderUpdates}
            onChange={() => handleToggle("orderUpdates")}
          />
        </NotificationItem>

        <NotificationItem>
          <NotificationInfo>
            <NotificationLabel>Promotions & Offers</NotificationLabel>
            <NotificationDescription>
              Receive special offers and discounts
            </NotificationDescription>
          </NotificationInfo>
          <ToggleSwitch
            checked={settings.promotions}
            onChange={() => handleToggle("promotions")}
          />
        </NotificationItem>

        <NotificationItem>
          <NotificationInfo>
            <NotificationLabel>Security Alerts</NotificationLabel>
            <NotificationDescription>
              Important security notifications
            </NotificationDescription>
          </NotificationInfo>
          <ToggleSwitch
            checked={settings.securityAlerts}
            onChange={() => handleToggle("securityAlerts")}
          />
        </NotificationItem>

        <NotificationItem>
          <NotificationInfo>
            <NotificationLabel>Newsletter</NotificationLabel>
            <NotificationDescription>
              Weekly newsletter with tips and updates
            </NotificationDescription>
          </NotificationInfo>
          <ToggleSwitch
            checked={settings.newsletter}
            onChange={() => handleToggle("newsletter")}
          />
        </NotificationItem>
      </FormGroup>

      <Button
        variant="primary"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <ButtonSpinner size="sm" /> Saving...
          </>
        ) : (
          "Save Preferences"
        )}
      </Button>
    </ContentCard>
  );
};

export default NotificationTab;

const NotificationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-light);
  margin-bottom: var(--space-md);
`;

const NotificationInfo = styled.div`
  flex: 1;
`;

const NotificationLabel = styled.h3`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-dark);
  margin: 0 0 var(--space-xs) 0;
`;

const NotificationDescription = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0;
`;

const ToggleSwitch = styled.input.attrs({ type: "checkbox" })`
  width: 48px;
  height: 24px;
  appearance: none;
  background: ${(props) =>
    props.checked ? "var(--color-primary)" : "var(--color-border)"};
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;

  &:before {
    content: "";
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${(props) => (props.checked ? "26px" : "2px")};
    transition: left 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

