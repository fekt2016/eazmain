import React, { useState } from "react";
import styled from "styled-components";
import { ButtonSpinner, ErrorState } from '../../components/loading';

const TwoFactorSetup = ({
  isEnabled,
  enableTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
}) => {
  const [token, setToken] = useState("");
  const [setupData, setSetupData] = useState(null);

  const handleEnable = () => {
    enableTwoFactor.mutate(undefined, {
      onSuccess: (result) => {
        setSetupData(result);
      },
      onError: (error) => {
        console.error("Failed to enable 2FA:", error);
      },
    });
  };

  const handleVerify = () => {
    verifyTwoFactor.mutate(token, {
      onSuccess: () => {
        setSetupData(null);
      },
      onError: (error) => {
        console.error("Verification failed:", error);
      },
    });
  };

  const handleDisable = () => {
    if (
      window.confirm(
        "Are you sure you want to disable two-factor authentication?"
      )
    ) {
      disableTwoFactor.mutate(undefined, {
        onError: (error) => {
          console.error("Failed to disable 2FA:", error);
        },
      });
    }
  };

  return (
    <Container>
      {isEnabled ? (
        <EnabledState>
          <StatusBadge enabled={true}>Enabled</StatusBadge>
          <DisableButton
            onClick={handleDisable}
            disabled={disableTwoFactor.isPending}
          >
            {disableTwoFactor.isPending ? <ButtonSpinner size="sm" /> : "Disable 2FA"}
          </DisableButton>
          
          {disableTwoFactor.error && (
            <ErrorState message={disableTwoFactor.error?.message || "Failed to disable 2FA"} />
          )}
        </EnabledState>
      ) : setupData ? (
        <SetupState>
          <QRContainer>
            <p className="text-sm mb-3">
              Scan this QR code with your authenticator app:
            </p>
            <img src={setupData.qrCode} alt="2FA QR Code" className="mb-3" />
            <p className="text-sm text-gray-600 mb-3">
              Or enter this secret manually:{" "}
              <SecretCode>{setupData.secret}</SecretCode>
            </p>
          </QRContainer>
          <VerificationForm>
            <Input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter verification code"
            />
            <VerifyButton
              onClick={handleVerify}
              disabled={verifyTwoFactor.isPending}
            >
              {verifyTwoFactor.isPending ? <ButtonSpinner size="sm" /> : "Verify"}
            </VerifyButton>
            
            {verifyTwoFactor.error && (
              <ErrorState message={verifyTwoFactor.error?.message || "Verification failed"} />
            )}
          </VerificationForm>
        </SetupState>
      ) : (
        <DisabledState>
          <StatusBadge enabled={false}>Disabled</StatusBadge>
          <EnableButton
            onClick={handleEnable}
            disabled={enableTwoFactor.isPending}
          >
            {enableTwoFactor.isPending ? <ButtonSpinner size="sm" /> : "Enable 2FA"}
          </EnableButton>
          
          {enableTwoFactor.error && (
            <ErrorState message={enableTwoFactor.error?.message || "Failed to enable 2FA"} />
          )}
        </DisabledState>
      )}
    </Container>
  );
};

const Container = styled.div`
  margin-top: 1rem;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${({ enabled }) => (enabled ? "#dcfce7" : "#fee2e2")};
  color: ${({ enabled }) => (enabled ? "#166534" : "#b91c1c")};
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const EnableButton = styled(Button)`
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  margin-left: 1rem;

  &:hover {
    background-color: #dcfce7;
  }
`;

const DisableButton = styled(Button)`
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  margin-left: 1rem;

  &:hover {
    background-color: #fee2e2;
  }
`;

const SetupState = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f0f9ff;
  border-radius: 8px;
`;

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
`;

const SecretCode = styled.code`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #e0f2fe;
  border-radius: 4px;
  font-family: monospace;
`;

const VerificationForm = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
`;

const VerifyButton = styled(Button)`
  background-color: #dbeafe;
  border: 1px solid #bfdbfe;
  color: #1e40af;

  &:hover {
    background-color: #bfdbfe;
  }
`;

const DisabledState = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
`;

const EnabledState = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
`;

export default TwoFactorSetup;
