import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { styled } from "styled-components";
import Header from "./Header";
import Footer from "./Footer";


const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: top;
 
`;
const Main = styled.div`
  flex: 1;
  padding: 1rem;

  display: flex;
  justify-content: center;
  align-items: center;

`;

export default function MainLayout() {
  const location = useLocation();
  const [sidebarState, setSidebarState] = useState(null);

  const isDashboardRoute = location.pathname.startsWith('/profile') || 
                           location.pathname.startsWith('/orders') ||
                           location.pathname.startsWith('/addresses') ||
                           location.pathname.startsWith('/credit-balance') ||
                           location.pathname.startsWith('/followed') ||
                           location.pathname.startsWith('/coupons') ||
                           location.pathname.startsWith('/payment-method') ||
                           location.pathname.startsWith('/browsing-history') ||
                           location.pathname.startsWith('/permissions') ||
                           location.pathname.startsWith('/notifications') ||
                           location.pathname.startsWith('/reviews');

  // Listen for sidebar state from Dashboard component
  useEffect(() => {
    if (isDashboardRoute) {
      const checkSidebarState = () => {
        if (window.__sidebarState) {
          setSidebarState(window.__sidebarState);
        }
      };
      
      // Check immediately
      checkSidebarState();
      
      // Listen for custom events from Dashboard
      const handleSidebarStateChange = (event) => {
        setSidebarState(event.detail);
      };
      
      window.addEventListener('sidebarStateChange', handleSidebarStateChange);
      
      // Also poll as fallback - reduced frequency to prevent memory leaks
      // 1000ms (1 second) is sufficient for UI updates
      const interval = setInterval(checkSidebarState, 1000);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('sidebarStateChange', handleSidebarStateChange);
      };
    } else {
      setSidebarState(null);
    }
  }, [isDashboardRoute, location.pathname]);

  return (
    <Container>
      <Header 
        onToggleSidebar={sidebarState?.toggle}
        isSidebarOpen={sidebarState?.isOpen}
      />
      <Main>
          <Outlet />
      </Main>
      {!isDashboardRoute && <Footer />}
    </Container>
  );
}
