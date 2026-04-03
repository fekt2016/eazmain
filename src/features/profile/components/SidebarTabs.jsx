import styled from "styled-components";
import {
  FaUser,
  FaLock,
  FaMobileAlt,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaBell,
  FaCreditCard,
  FaChevronRight,
} from "react-icons/fa";

const tabGroups = [
  {
    label: "Account",
    tabs: [
      { id: "account", label: "Account Info", icon: FaUser },
      { id: "address", label: "Address Book", icon: FaMapMarkerAlt },
      { id: "payment", label: "Payment Methods", icon: FaCreditCard },
      { id: "notifications", label: "Notifications", icon: FaBell },
    ],
  },
  {
    label: "Security",
    tabs: [
      { id: "security", label: "Security", icon: FaLock },
      { id: "twofactor", label: "Two-Factor Auth", icon: FaShieldAlt },
      { id: "devices", label: "Devices", icon: FaMobileAlt },
    ],
  },
];

const SidebarTabs = ({ activeTab, onTabChange }) => {
  return (
    <SidebarContainer>
      <SidebarHeader>Settings</SidebarHeader>

      {tabGroups.map((group) => (
        <TabGroup key={group.label}>
          <TabGroupLabel>{group.label}</TabGroupLabel>
          <TabList>
            {group.tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <TabItem
                  key={tab.id}
                  $active={isActive}
                  onClick={() => onTabChange(tab.id)}
                  aria-selected={isActive}
                  role="tab"
                >
                  <TabIconWrap $active={isActive}>
                    <Icon />
                  </TabIconWrap>
                  <TabLabel>{tab.label}</TabLabel>
                  {isActive && <TabChevron><FaChevronRight /></TabChevron>}
                </TabItem>
              );
            })}
          </TabList>
        </TabGroup>
      ))}
    </SidebarContainer>
  );
};

export default SidebarTabs;

/* ─── Styled Components ──────────────────────────────────── */

const SidebarContainer = styled.div`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #f0e8d8;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.25rem 1rem;
  min-width: 220px;
  height: fit-content;
  position: sticky;
  top: 1.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarHeader = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1rem 0.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f0e8d8;
  letter-spacing: -0.01em;
`;

const TabGroup = styled.div`
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TabGroupLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 0.5rem 0.4rem 0.25rem;
`;

const TabList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TabIconWrap = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${({ $active }) => ($active ? 'rgba(212,136,42,0.1)' : '#f9fafb')};
  color: ${({ $active }) => ($active ? '#D4882A' : '#9ca3af')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease, color 0.2s ease;

  svg {
    width: 13px;
    height: 13px;
  }
`;

const TabChevron = styled.span`
  color: #D4882A;
  display: flex;
  align-items: center;
  margin-left: auto;

  svg {
    width: 10px;
    height: 10px;
  }
`;

const TabItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.5rem 0.6rem 0.5rem;
  border: none;
  background: ${({ $active }) => ($active ? '#fff7ed' : 'transparent')};
  border-left: 3px solid ${({ $active }) => ($active ? '#D4882A' : 'transparent')};
  border-radius: ${({ $active }) => ($active ? '0 8px 8px 0' : '8px')};
  color: ${({ $active }) => ($active ? '#B8711F' : '#374151')};
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  transition: all 0.15s ease;
  text-align: left;
  width: 100%;

  &:hover {
    background: ${({ $active }) => ($active ? '#fff7ed' : '#fdf5e4')};
    color: ${({ $active }) => ($active ? '#B8711F' : '#92400e')};

    ${TabIconWrap} {
      background: rgba(212, 136, 42, 0.08);
      color: #D4882A;
    }
  }
`;

const TabLabel = styled.span`
  flex: 1;
  display: inline-block;
  white-space: nowrap;
  overflow: visible;
  text-overflow: unset;
  font-size: 0.88rem;
  font-weight: 600;
  color: inherit;
`;
