import { NavLink, useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { devicesMax } from '../../shared/styles/breakpoint';
import {
  FaShoppingBag,
  FaHeart,
  FaTicketAlt,
  FaMoneyBillWave,
  FaUserCog,
  FaSignOutAlt,
  FaChevronRight,
  FaHome,
  FaHeadset,
  FaEnvelope,
} from "react-icons/fa";
import useAuth from '../hooks/useAuth';
import { getOptimizedImageUrl, IMAGE_SLOTS } from '../utils/cloudinaryConfig';
import { useWalletBalance } from '../hooks/useWallet';
import { useGetUserOrders, getOrderStructure } from '../hooks/useOrder';
import { useMemo, useState } from 'react';
import { PATHS } from '../../routes/routePaths';

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name[0] || '?').toUpperCase();
};

const SideBar = ({ $isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout, userData } = useAuth();

  const user = userData?.data?.data || userData?.data?.user || userData?.user || null;

  const { data: walletData, isLoading: isBalanceLoading } = useWalletBalance();
  const wallet = useMemo(() => {
    return walletData?.data?.wallet || { balance: 0, availableBalance: 0 };
  }, [walletData]);
  const balance = wallet.availableBalance ?? wallet.balance ?? 0;

  const [avatarError, setAvatarError] = useState(false);
  const { data: ordersData } = useGetUserOrders();
  const orders = useMemo(() => getOrderStructure(ordersData) || [], [ordersData]);
  const orderCount = orders.length;
  const showAvatarPhoto = user?.photo && !avatarError;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate("/login"),
    });
  };

  const handleNavClick = () => {
    if (window.innerWidth <= 768 && onClose) onClose();
  };

  const accountItems = [
    { path: PATHS.PROFILE, icon: <FaUserCog />, label: "My Profile" },
    { path: PATHS.ORDERS, icon: <FaShoppingBag />, label: "My Orders", badge: orderCount > 0 ? orderCount : null },
    { path: PATHS.WISHLIST, icon: <FaHeart />, label: "Wishlist" },
    { path: PATHS.COUPON, icon: <FaTicketAlt />, label: "Coupons" },
  ];

  return (
    <SidebarContainer $isOpen={$isOpen}>

      {/* ── User card ── */}
      <UserCard>
        <AvatarRing>
          {showAvatarPhoto ? (
            <img
              src={getOptimizedImageUrl(user.photo, IMAGE_SLOTS.AVATAR)}
              alt={user?.name || 'User'}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <InitialsFallback>{getInitials(user?.name || user?.email)}</InitialsFallback>
          )}
        </AvatarRing>
        <UserMeta>
          <UserFullName>{user?.name || 'Account'}</UserFullName>
          <UserEmailText>{user?.email || ''}</UserEmailText>
        </UserMeta>
      </UserCard>

      {/* ── Balance card ── */}
      <BalanceCard to={PATHS.CREDIT} onClick={handleNavClick}>
        <BalanceIcon><FaMoneyBillWave /></BalanceIcon>
        <BalanceInfo>
          <BalanceLabel>Available Balance</BalanceLabel>
          <BalanceAmount>
            {isBalanceLoading ? '—' : `GH₵${balance.toFixed(2)}`}
          </BalanceAmount>
        </BalanceInfo>
        <FaChevronRight size={12} style={{ color: '#D4882A', marginLeft: 'auto', flexShrink: 0 }} />
      </BalanceCard>

      {/* ── Navigation ── */}
      <NavContainer>

        <NavGroup>
          <NavGroupLabel>Browse</NavGroupLabel>
          <NavItem to={PATHS.HOME} onClick={handleNavClick} end>
            <NavIcon><FaHome /></NavIcon>
            <NavLabel>Home</NavLabel>
            <NavArrow><FaChevronRight /></NavArrow>
          </NavItem>
        </NavGroup>

        <NavGroup>
          <NavGroupLabel>My Account</NavGroupLabel>
          {accountItems.map((item) => (
            <NavItem key={item.path} to={item.path} onClick={handleNavClick}>
              <NavIcon>{item.icon}</NavIcon>
              <NavLabel>{item.label}</NavLabel>
              <NavMeta>
                {item.badge && <NotificationBadge>{item.badge}</NotificationBadge>}
                <NavArrow><FaChevronRight /></NavArrow>
              </NavMeta>
            </NavItem>
          ))}
        </NavGroup>

        <NavGroup>
          <NavGroupLabel>Help</NavGroupLabel>
          <NavItem to={PATHS.SUPPORT} onClick={handleNavClick}>
            <NavIcon><FaHeadset /></NavIcon>
            <NavLabel>24/7 Support</NavLabel>
            <NavArrow><FaChevronRight /></NavArrow>
          </NavItem>
          <NavItem to={PATHS.CONTACT} onClick={handleNavClick}>
            <NavIcon><FaEnvelope /></NavIcon>
            <NavLabel>Contact Us</NavLabel>
            <NavArrow><FaChevronRight /></NavArrow>
          </NavItem>
        </NavGroup>
      </NavContainer>

      {/* ── Logout ── */}
      <LogoutWrapper>
        <LogoutButton onClick={handleLogout}>
          <LogoutIcon><FaSignOutAlt /></LogoutIcon>
          <LogoutText>Logout</LogoutText>
        </LogoutButton>
      </LogoutWrapper>

    </SidebarContainer>
  );
};

export default SideBar;

/* ─── Styled Components ─────────────────────────────────── */

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 30rem;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #f0e8d8;
  position: sticky;
  top: 0;
  overflow: hidden;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);

  @media ${devicesMax.md} {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    transform: translateX(-100%);
    width: 30rem;
    height: 100vh;
    overflow-y: auto;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    ${props => props.$isOpen && css`
      transform: translateX(0);
    `}
  }
`;

/* User Card */
const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1.1rem;
  padding: 1.6rem 1.4rem 1.2rem;
  border-bottom: 1px solid #f5ede0;
  background: linear-gradient(135deg, #fffbf2 0%, #fff9ee 100%);
  flex-shrink: 0;
`;

const AvatarRing = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2.5px solid #D4882A;
  overflow: hidden;
  flex-shrink: 0;
  background: #9CA3AF;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const InitialsFallback = styled.span`
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.02em;
`;

const UserMeta = styled.div`
  min-width: 0;
  flex: 1;
`;

const UserFullName = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
  line-height: 1.2;
  margin-bottom: 0.2rem;
`;

const UserEmailText = styled.div`
  font-size: 1.1rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/* Balance Card */
const BalanceCard = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin: 1rem 1.2rem 0.25rem;
  padding: 0.85rem 1rem;
  background: linear-gradient(135deg, #fff7ed 0%, #fef3e2 100%);
  border: 1px solid rgba(212, 136, 42, 0.22);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  flex-shrink: 0;

  &:hover {
    box-shadow: 0 4px 14px rgba(212, 136, 42, 0.15);
    transform: translateY(-1px);
  }
`;

const BalanceIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(212, 136, 42, 0.12);
  color: #D4882A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
`;

const BalanceInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const BalanceLabel = styled.div`
  font-size: 1rem;
  color: #9a6b2a;
  font-weight: 500;
  line-height: 1;
  margin-bottom: 0.2rem;
`;

const BalanceAmount = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #B8711F;
  line-height: 1;
`;

/* Navigation */
const NavContainer = styled.nav`
  flex: 1;
  padding: 0.5rem 1rem 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 2px;
  }
`;

const NavGroup = styled.div`
  margin-bottom: 0.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
`;

const NavGroupLabel = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 0.7rem 0.6rem 0.3rem;
`;

const NavArrow = styled.span`
  font-size: 0.85rem;
  color: #d1d5db;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease, color 0.2s ease;
`;

const NavIcon = styled.span`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  color: #9ca3af;
  flex-shrink: 0;
  transition: color 0.2s ease;
  width: 2rem;
`;

const NotificationBadge = styled.span`
  background: #dc2626;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.1rem 0.5rem;
  border-radius: 20px;
  min-width: 1.8rem;
  height: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 0.6rem;
  color: #374151;
  text-decoration: none;
  border-radius: 10px;
  margin-bottom: 0.15rem;
  transition: background 0.15s ease, color 0.15s ease;
  border-left: 3px solid transparent;

  &:hover {
    background: #fdf5e4;
    color: #B8711F;

    ${NavIcon} {
      color: #D4882A;
    }

    ${NavArrow} {
      color: #D4882A;
      transform: translateX(2px);
    }
  }

  &.active {
    background: #fff7ed;
    color: #B8711F;
    border-left-color: #D4882A;
    font-weight: 600;

    ${NavIcon} {
      color: #D4882A;
    }

    ${NavArrow} {
      color: #D4882A;
    }
  }
`;

const NavLabel = styled.span`
  font-size: 1.35rem;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NavMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
`;

/* Logout */
const LogoutWrapper = styled.div`
  padding: 0.85rem 1rem;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  padding: 0.75rem 0.6rem;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: #fee2e2;
    color: #dc2626;
  }
`;

const LogoutIcon = styled.span`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 2rem;
`;

const LogoutText = styled.span`
  font-size: 1.35rem;
  font-weight: 500;
`;
