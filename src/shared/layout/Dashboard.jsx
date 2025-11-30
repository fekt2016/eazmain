import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";

import Sidebar from '../layout/Sidebar';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Expose sidebar state to window for Header to access - update whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__sidebarState = {
        isOpen: isSidebarOpen,
        toggle: toggleSidebar,
        close: closeSidebar
      };
      
      // Dispatch custom event to notify MainLayout of state change
      window.dispatchEvent(new CustomEvent('sidebarStateChange', {
        detail: { isOpen: isSidebarOpen, toggle: toggleSidebar, close: closeSidebar }
      }));
    }
  }, [isSidebarOpen]);

  return (
    <Container>
      <Sidebar $isOpen={isSidebarOpen} onClose={closeSidebar} />
      <Overlay $isOpen={isSidebarOpen} onClick={closeSidebar} />
      <main>
        <Outlet />
      </main>
    </Container>
  );
}

const Container = styled.div`
width: 100%;
  display: flex;
  min-height: 100vh;
  position: relative;

  main {
    flex: 1;
    padding: 1rem;
    margin-left: 0;
    transition: margin-left 0.3s ease;

    // @media (min-width: 769px) {
    //   margin-left: 30rem;
    // }
  }
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;

  @media (max-width: 768px) {
    display: block;
  }
`;
