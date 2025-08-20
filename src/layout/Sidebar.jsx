import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { devicesMax } from "../styles/breakpoint";
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
} from "react-icons/fa";
import useAuth from "../hooks/useAuth";

const SideBar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/orders", icon: <FaShoppingBag />, label: "Orders" },
    { path: "/reviews", icon: <FaStar />, label: "My Reviews" },
    { path: "/addresses", icon: <FaMapMarkerAlt />, label: "My Address" },
    { path: "/credit-balance", icon: <FaMoneyBill />, label: "Credit Balance" },
    { path: "/followed", icon: <FaHeart />, label: "Followed Shops" },
    { path: "/coupons", icon: <FaTicketAlt />, label: "My Coupons" },
    {
      path: "/payment-method",
      icon: <FaCreditCard />,
      label: "Payment Method",
    },
    {
      path: "/browsing-history",
      icon: <FaHistory />,
      label: "Browsing History",
    },
    { path: "/permissions", icon: <FaUserShield />, label: "Permissions" },
    { path: "/notifications", icon: <FaBell />, label: "Notifications" },
    { path: "/profile", icon: <FaUserCog />, label: " Settings" },
  ];

  return (
    <SidebarContainer>
      <NavContainer>
        {navItems.map((item) => (
          <NavItem key={item.path} to={item.path} $activeclassname="active">
            <NavIcon>{item.icon}</NavIcon>
            <NavLabel>{item.label}</NavLabel>
          </NavItem>
        ))}
      </NavContainer>

      <LogoutButton onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </LogoutButton>
    </SidebarContainer>
  );
};

export default SideBar;

// Styled Components
const SidebarContainer = styled.div`
  width: 25rem;
  background-color: var(--color-white-0);
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;

  @media ${devicesMax.lg} {
    width: 7rem;

    /* span:not(.notification-badge) {
      display: none;
    } */
  }

  @media ${devicesMax.md} {
    transform: translateX(-100%);
    width: 25rem;
    /* 
    &.open {
      transform: translateX(0);
    } */

    span {
      display: block !important;
    }
  }
`;

const NavContainer = styled.nav`
  flex: 1;
  padding: 2rem 0;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 1.5rem 2.5rem;
  color: var(--color-grey-700);
  transition: all 0.3s;
  position: relative;
  margin: 0.5rem 1rem;
  border-radius: var(--border-radius-md);

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-primary-700);
  }

  &.active {
    background-color: var(--color-primary-50);
    color: var(--color-primary-700);
    font-weight: 600;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: var(--color-primary-700);
      border-radius: 0 4px 4px 0;
    }
  }
`;

const NavIcon = styled.span`
  font-size: 1.8rem;
  margin-right: 1.5rem;
  display: flex;
  align-items: center;
  min-width: 2.5rem;

  @media ${devicesMax.lg} {
    margin-right: 0;
    font-size: 2.2rem;
  }
`;

const NavLabel = styled.span`
  font-size: 1.6rem;
  font-weight: 500;

  @media ${devicesMax.lg} {
    display: none;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background-color: transparent;
  border: none;
  color: var(--color-red-700);
  font-size: 1.6rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border-top: 1px solid var(--color-grey-200);
  margin-top: auto;

  &:hover {
    background-color: var(--color-red-50);
  }

  svg {
    margin-right: 1.5rem;

    @media ${devicesMax.lg} {
      margin-right: 0;
      font-size: 2.2rem;
    }
  }

  span {
    @media ${devicesMax.lg} {
      display: none;
    }
  }
`;
