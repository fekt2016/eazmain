import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import {
  ContentCard,
  CardTitle,
  CardDescription,
  FormGroup,
  FormRow,
  Label,
  Input,
  Button,
} from "../components/TabPanelContainer";
import { ButtonSpinner } from "../../../components/loading";
import useAuth from "../../../shared/hooks/useAuth";
import SecuritySettingsSection from "../../../shared/components/profile/SecuritySettionsSection";
import styled from "styled-components";

const SecurityTab = ({ userInfo, connectedAccounts: connectedAccountsProp }) => {
  const { changePassword } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    passwordCurrent: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

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
      passwordCurrent: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const connectedAccounts = connectedAccountsProp || userInfo?.connectedAccounts || {};
  const googleConnected = !!connectedAccounts.google;

  return (
    <>
      <ContentCard>
        <CardTitle>Connected accounts</CardTitle>
        <CardDescription>
          Sign-in methods linked to your account. You can use these to log in.
        </CardDescription>
        <ConnectedList>
          <ConnectedItem>
            <FcGoogle size={20} />
            <span>Google</span>
            {googleConnected ? (
              <ConnectedBadge $connected>Connected</ConnectedBadge>
            ) : (
              <ConnectedBadge>Not connected</ConnectedBadge>
            )}
          </ConnectedItem>
        </ConnectedList>
      </ContentCard>

      <ContentCard>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password to keep your account secure.
        </CardDescription>

        <SecuritySettingsSection
          onPasswordChange={handlePasswordChange}
          onPasswordSubmit={handlePasswordSubmit}
          passwordForm={passwordForm}
          isLoading={changePassword.isPending}
          error={changePassword.error}
        />
      </ContentCard>
    </>
  );
};

const ConnectedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const ConnectedItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-grey-50, #f9fafb);
  border-radius: 8px;

  span {
    flex: 1;
    font-weight: 500;
    color: var(--color-grey-900, #111);
  }
`;

const ConnectedBadge = styled.span`
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background: ${(p) => (p.$connected ? "var(--color-success, #22c55e)" : "var(--color-grey-200, #e5e7eb)")};
  color: ${(p) => (p.$connected ? "#fff" : "var(--color-grey-600, #4b5563)")};
`;

export default SecurityTab;

