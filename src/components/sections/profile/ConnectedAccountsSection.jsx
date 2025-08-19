import styled from "styled-components";

const ConnectedAccountsSection = ({ accounts }) => (
  <NotificationSection>
    <SectionHeader>
      <SectionIcon>🔗</SectionIcon>
      <SectionTitle>Connected Accounts</SectionTitle>
    </SectionHeader>
    <SectionContent>
      <SocialConnections>
        <SocialConnection connected={accounts?.google}>
          <SocialIcon>G</SocialIcon>
          <SocialName>Google</SocialName>
          <ConnectButton>
            {accounts?.google ? "Connected" : "Connect"}
          </ConnectButton>
        </SocialConnection>

        <SocialConnection connected={accounts?.facebook}>
          <SocialIcon>f</SocialIcon>
          <SocialName>Facebook</SocialName>
          <ConnectButton>
            {accounts?.facebook ? "Connected" : "Connect"}
          </ConnectButton>
        </SocialConnection>
      </SocialConnections>
    </SectionContent>
  </NotificationSection>
);

export default ConnectedAccountsSection;

const NotificationSection = styled.div`
  background: ${({ danger, theme }) =>
    danger ? theme.colors.red[50] : theme.colors.gray[50]};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid
    ${({ danger, theme }) =>
      danger ? theme.colors.red[200] : theme.colors.gray[200]};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.75rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[900]};
`;

const SectionContent = styled.div`
  padding: 0.5rem 0;
`;

const SocialConnections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SocialConnection = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 8px;
`;

const SocialIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 50%;
  font-weight: 700;
  margin-right: 1rem;
`;

const SocialName = styled.span`
  flex: 1;
  font-weight: 500;
`;

const ConnectButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
  }
`;
