import {
  ContentCard,
  CardTitle,
  CardDescription,
} from "../components/TabPanelContainer";
import TwoFactorSetup from "../../../shared/components/TwoFactorSetup";
import useAuth from "../../../shared/hooks/useAuth";

const TwoFactorTab = () => {
  const { enableTwoFactor, verifyTwoFactor, disableTwoFactor, userData } = useAuth();
  
  const isEnabled = userData?.twoFactorEnabled || false;

  return (
    <ContentCard>
      <CardTitle>Two-Factor Authentication</CardTitle>
      <CardDescription>
        Add an extra layer of security to your account by enabling two-factor authentication.
      </CardDescription>

      <TwoFactorSetup
        isEnabled={isEnabled}
        enableTwoFactor={enableTwoFactor}
        verifyTwoFactor={verifyTwoFactor}
        disableTwoFactor={disableTwoFactor}
      />
    </ContentCard>
  );
};

export default TwoFactorTab;

