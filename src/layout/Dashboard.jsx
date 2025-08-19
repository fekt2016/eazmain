import { Outlet } from "react-router-dom";
import styled from "styled-components";

import Sidebar from "../layout/Sidebar";

export default function Dashboard() {
  return (
    <Container>
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  min-height: 100vh;

  main {
    flex: 1;
    padding: 1rem;
  }
`;
// const SideBar = styled.div`
//   width: 25rem;
//   background-color: red;
// `;
