import { NavLink, useNavigate, useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import { devicesMax } from '../../shared/styles/breakpoint';
import {
  FaShoppingBag,
  FaStar,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaHeart,
  FaTicketAlt,
  FaCreditCard,
  FaHistory,
  FaUserShield,
  FaBell,
  FaUserCog,
  FaSignOutAlt,
  FaChevronRight,
  FaUserCircle,
  FaGem
} from "react-icons/fa";
import useAuth from '../hooks/useAuth';
import { getAvatarUrl } from '../utils/avatarUtils';
import { useUnreadCount } from '../hooks/notifications/useNotifications';
import { useWalletBalance } from '../hooks/useWallet';
import { useMemo } from 'react';

import { PATHS } from '../../routes/routePaths';

const SideBar = ({ $isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout, userData } = useAuth();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.data?.unreadCount || 0;
  
  const user = userData?.data?.data || userData?.data?.user || userData?.user || null;
  
  // Get wallet balance
  const { data: walletData, isLoading: isBalanceLoading } = useWalletBalance();
  const wallet = useMemo(() => {
    return walletData?.data?.wallet || { balance: 0, availableBalance: 0 };
  }, [walletData]);
  
  const balance = wallet.balance || 0;

  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: PATHS.ORDERS, icon: <FaShoppingBag />, label: "Orders", badge: 3 },
    { path: PATHS.REVIEWS, icon: <FaStar />, label: "My Reviews" },
    { path: PATHS.ADDRESS, icon: <FaMapMarkerAlt />, label: "Addresses" },
    { path: PATHS.CREDIT, icon: <FaMoneyBill />, label: "Balance", amount: isBalanceLoading ? "..." : `GH₵${balance.toFixed(2)}` },
    { path: PATHS.FOLLOWED, icon: <FaHeart />, label: "Followed Shops" },
    { path: PATHS.COUPON, icon: <FaTicketAlt />, label: "Coupons", badge: 5 },
    { path: PATHS.PAYMENT, icon: <FaCreditCard />, label: "Payments" },
    { path: PATHS.BROWSER, icon: <FaHistory />, label: "History" },
    { path: PATHS.PERMISSION, icon: <FaUserShield />, label: "Permissions" },
    { path: PATHS.NOTIFICATION, icon: <FaBell />, label: "Notifications", badge: unreadCount > 0 ? unreadCount : null },
    { path: PATHS.PROFILE, icon: <FaUserCog />, label: "Settings" },
  ];

  // Close sidebar when clicking on a nav item on mobile
  const handleNavClick = () => {
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <SidebarContainer $isOpen={$isOpen}>
      {/* User Profile */}
      <UserSection>
        <UserAvatar>
          {user?.photo ? (
            <AvatarImage src={getAvatarUrl(user.photo)} alt={user?.name || "User"} />
          ) : (
            <FaUserCircle />
          )}
          <OnlineIndicator />
        </UserAvatar>
        <UserInfo>
          <UserName>{user?.name || "Alex Morgan"}</UserName>
          <UserTier>Premium Member</UserTier>
        </UserInfo>
      </UserSection>

      {/* Quick Stats */}
      <StatsSection>
        <StatItem>
          <StatValue>12</StatValue>
          <StatLabel>Orders</StatLabel>
        </StatItem>
        <StatDivider />
        <StatItem>
          <StatValue>8</StatValue>
          <StatLabel>Points</StatLabel>
        </StatItem>
        <StatDivider />
        <StatItem>
          <StatValue>
            {isBalanceLoading ? "..." : `GH₵${balance.toFixed(2)}`}
          </StatValue>
          <StatLabel>Balance</StatLabel>
        </StatItem>
      </StatsSection>

      {/* Navigation */}
      <NavContainer>
        <NavGroup>
          <NavGroupLabel>Main Menu</NavGroupLabel>
          {navItems.slice(0, 6).map((item) => (
            <NavItem 
              key={item.path} 
              to={item.path} 
              $activeclassname="active"
              onClick={handleNavClick}
            >
              <NavIcon>{item.icon}</NavIcon>
              <NavLabel>{item.label}</NavLabel>
              <NavMeta>
                {item.badge && <NotificationBadge>{item.badge}</NotificationBadge>}
                {item.amount && <NavAmount>{item.amount}</NavAmount>}
                <NavArrow>
                  <FaChevronRight />
                </NavArrow>
              </NavMeta>
            </NavItem>
          ))}
        </NavGroup>

        <NavGroup>
          <NavGroupLabel>Preferences</NavGroupLabel>
          {navItems.slice(6).map((item) => (
            <NavItem 
              key={item.path} 
              to={item.path} 
              $activeclassname="active"
            >
              <NavIcon>{item.icon}</NavIcon>
              <NavLabel>{item.label}</NavLabel>
              <NavMeta>
                {item.badge && <NotificationBadge>{item.badge}</NotificationBadge>}
                <NavArrow>
                  <FaChevronRight />
                </NavArrow>
              </NavMeta>
            </NavItem>
          ))}
        </NavGroup>
      </NavContainer>

      {/* Logout Section */}
      <LogoutSection>
        <LogoutButton onClick={handleLogout}>
          <LogoutIcon>
            <FaSignOutAlt />
          </LogoutIcon>
          <LogoutText>Sign Out</LogoutText>
        </LogoutButton>
      </LogoutSection>
    </SidebarContainer>
  );
};

export default SideBar;


const SidebarContainer = styled.div`
 display: flex;
 flex-direction: column;
 border-right: 1px solid var(--color-grey-100);
 position: sticky;
 top: 0;
 box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.02), 0 4px 12px rgba(0, 0, 0, 0.03);
 transition: all 0.3s ease;
 width: 30rem;
 height: 100vh;
 background: white;

 @media ${devicesMax.md} {
   position: fixed;
   top: 0;
   left: 0;
   z-index: 1000;
   transform: translateX(-100%);
   width: 30rem;
   box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
   height: 100vh;
   overflow-y: auto;
  
   ${props => props.$isOpen && css`
     transform: translateX(0);
   `}
 }
`

const BrandSection = styled.div`
  padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  border-bottom: 1px solid var(--color-grey-100);
`;

const BrandLogo = styled.div`
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white-0);
  font-size: 1.8rem;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
`;

const BrandName = styled.h1`
  font-size: 2rem;
  font-weight: 500;
  color: var(--color-grey-900);
  margin: 0;
  line-height: 1;
`;

const BrandSubtitle = styled.span`
  font-size: 1.2rem;
  color: var(--color-grey-500);
  font-weight: 500;
  margin-top: 0.2rem;
`;

const UserSection = styled.div`
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--color-grey-50);
  margin: var(--spacing-md) var(--spacing-lg);
  border-radius: 16px;
  border: 1px solid var(--color-grey-200);
`;

const UserAvatar = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 14px;
  background: var(--color-white-0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
  color: var(--color-primary-500);
  position: relative;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
  border: 2px solid var(--color-white-0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const OnlineIndicator = styled.div`
  position: absolute;
  bottom: 0.2rem;
  right: 0.2rem;
  width: 1.2rem;
  height: 1.2rem;
  background: var(--color-success-500);
  border: 2px solid var(--color-white-0);
  border-radius: 50%;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--color-grey-900);
  margin-bottom: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
`;

const UserTier = styled.div`
  font-size: 1.2rem;
  color: var(--color-primary-600);
  font-weight: 500;
  background: var(--color-primary-50);
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
  display: inline-block;
`;

const StatsSection = styled.div`
  display: flex;
  align-items: center;
  background: var(--color-white-0);
  margin: 0 var(--spacing-lg) var(--spacing-lg);
  padding: var(--spacing-md);
  border-radius: 16px;
  border: 1px solid var(--color-grey-200);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const StatItem = styled.div`
  flex: 1;
  text-align: center;
  padding: 0 var(--spacing-sm);
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 500;
  color: var(--color-grey-900);
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  color: var(--color-grey-600);
  margin-top: 0.4rem;
  font-weight: 500;
`;

const StatDivider = styled.div`
  width: 1px;
  height: 3rem;
  background: var(--color-grey-300);
`;

const NavContainer = styled.nav`
  flex: 1;
  padding: 0 var(--spacing-lg);
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-grey-300);
    border-radius: 2px;
  }
`;

const NavGroup = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const NavGroupLabel = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--color-grey-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-sm);
  padding: 0 var(--spacing-sm);
  
  @media ${devicesMax.lg} {
    display: none;
  }
`;

// Define NavArrow, NavIcon, and NotificationBadge before NavItem since NavItem references them
const NavArrow = styled.span`
  font-size: 1rem;
  opacity: 0;
  transition: all 0.2s ease;
  color: var(--color-grey-500);
  display: flex;
  align-items: center;
  
  @media ${devicesMax.lg} {
    display: none;
  }
`;

const NavIcon = styled.span`
  font-size: 1.6rem;
  margin-right: var(--spacing-md);
  display: flex;
  align-items: center;
  min-width: 2.4rem;
  transition: all 0.2s ease;
  color: var(--color-grey-600);
  flex-shrink: 0;
`;

const NotificationBadge = styled.span`
  background: var(--color-error-500);
  color: var(--color-white-0);
  font-size: 1.1rem;
  font-weight: 500;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  min-width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media ${devicesMax.lg} {
    position: absolute;
    top: 0.8rem;
    right: 0.8rem;
    transform: scale(0.8);
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-sm);
  color: var(--color-grey-700);
  transition: all 0.2s ease;
  border-radius: 12px;
  text-decoration: none;
  margin-bottom: 0.4rem;
  position: relative;

  &:hover {
    background: var(--color-primary-50);
    color: var(--color-primary-700);
    transform: translateX(4px);
    
    ${NavArrow} {
      opacity: 1;
      transform: translateX(2px);
    }
  }

  &.active {
    background: var(--color-primary-500);
    color: var(--color-white-0);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    
    ${NavIcon} {
      color: var(--color-white-0);
    }
    
    ${NavArrow} {
      color: var(--color-white-0);
      opacity: 1;
    }
    
    ${NotificationBadge} {
      background: var(--color-white-0);
      color: var(--color-primary-500);
    }
  }
`;

const NavLabel = styled.span`
  font-size: 1.4rem;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 1rem;
  display: block;
`;

const NavMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-left: auto;
`;

const NavAmount = styled.span`
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--color-success-600);
  background: var(--color-success-50);
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  display: block;
`;

const LogoutSection = styled.div`
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-grey-100);
  margin-top: auto;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-md) var(--spacing-sm);
  background: transparent;
  border: 1px solid var(--color-grey-300);
  border-radius: 12px;
  color: var(--color-grey-700);
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: var(--color-error-50);
    border-color: var(--color-error-300);
    color: var(--color-error-600);
    transform: translateX(4px);
  }
`;

const LogoutIcon = styled.span`
  font-size: 1.6rem;
  margin-right: var(--spacing-md);
  display: flex;
  align-items: center;
  min-width: 2.4rem;
  
  @media ${devicesMax.lg} {
    margin-right: 0;
  }
`;

const LogoutText = styled.span`
  font-size: 1.4rem;
  font-weight: 500;
  
  @media ${devicesMax.lg} {
    display: none;
  }
`;