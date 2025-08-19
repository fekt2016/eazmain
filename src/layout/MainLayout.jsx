import { Outlet } from "react-router-dom";
// import Header from "./Header";
// import Sidebar from "./Sidebar";
import { styled } from "styled-components";
import Header from "./Header";
import Footer from "./Footer";

const Container = styled.div`
  display: flex;
  display: flex;
  flex-direction: column;
  justify-content: top;
`;
const Main = styled.div`
  flex: 1;
  padding: 1rem;
`;

export default function MainLayout() {
  return (
    <Container>
      <Header />
      <Main>
        <div>
          <Outlet />
        </div>
      </Main>
      <Footer />
    </Container>
  );
}
