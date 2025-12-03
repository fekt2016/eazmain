import styled from "styled-components";
import {
  FaUser,
  FaLock,
  FaMobileAlt,
  FaShieldAlt,
} from "react-icons/fa";

const tabs = [
  { id: "account", label: "Account Info", icon: FaUser },
  { id: "security", label: "Security", icon: FaLock },
  { id: "twofactor", label: "Two-Factor Auth", icon: FaShieldAlt },
  { id: "devices", label: "Devices", icon: FaMobileAlt },
];

const SidebarTabs = ({ activeTab, onTabChange }) => {
  return (
    <SidebarContainer>
      <SidebarHeader>Settings</SidebarHeader>
      <TabList>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabItem
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              <Icon />
              <TabLabel>{tab.label}</TabLabel>
            </TabItem>
          );
        })}
      </TabList>
    </SidebarContainer>
  );
};

export default SidebarTabs;

const SidebarContainer = styled.div`
  background: var(--color-bg-card);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: var(--space-lg);
  min-width: 240px;
  height: fit-content;
  position: sticky;
  top: var(--space-xl);

  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarHeader = styled.h2`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0 0 var(--space-lg) 0;
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
`;

const TabList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
`;

const TabItem = styled.button`
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border: none;
  background: ${(props) =>
    props.active ? "var(--color-primary)" : "transparent"};
  color: ${(props) =>
    props.active ? "white" : "var(--color-text-dark)"};
  border-radius: 8px;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: ${(props) => (props.active ? 600 : 400)};
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: ${(props) =>
      props.active ? "var(--color-primary-hover)" : "var(--color-bg-light)"};
  }

  svg {
    font-size: 18px;
    flex-shrink: 0;
  }
`;

const TabLabel = styled.span`
  flex: 1;
`;

