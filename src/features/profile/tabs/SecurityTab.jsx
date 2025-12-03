import { useState } from "react";
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

const SecurityTab = ({ userInfo }) => {
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

  return (
    <>
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

export default SecurityTab;

