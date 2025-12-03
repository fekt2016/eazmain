import styled from "styled-components";
import {
  FaUser,
  FaLock,
  FaMobileAlt,
  FaShieldAlt,
} from "react-icons/fa";

const tabs = [
  { id: "account", label: "Account", icon: FaUser },
  { id: "security", label: "Security", icon: FaLock },
  { id: "twofactor", label: "2FA", icon: FaShieldAlt },
  { id: "devices", label: "Devices", icon: FaMobileAlt },
];

const MobileTabBar = ({ activeTab, onTabChange }) => {
  return (
    <MobileTabContainer>
      <TabScrollContainer>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <MobileTabItem
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <Icon />
              <MobileTabLabel>{tab.label}</MobileTabLabel>
            </MobileTabItem>
          );
        })}
      </TabScrollContainer>
    </MobileTabContainer>
  );
};

export default MobileTabBar;

const MobileTabContainer = styled.div`
  display: none;
  background: var(--color-bg-card);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: var(--space-sm);
  margin-bottom: var(--space-lg);

  @media (max-width: 768px) {
    display: block;
  }
`;

const TabScrollContainer = styled.div`
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const MobileTabItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: ${(props) =>
    props.active ? "var(--color-primary)" : "transparent"};
  color: ${(props) =>
    props.active ? "white" : "var(--color-text-dark)"};
  border-radius: 8px;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-weight: ${(props) => (props.active ? 600 : 400)};
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 70px;

  &:hover {
    background: ${(props) =>
      props.active ? "var(--color-primary-hover)" : "var(--color-bg-light)"};
  }

  svg {
    font-size: 20px;
  }
`;

const MobileTabLabel = styled.span``;

