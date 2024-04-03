import TopQueryBar from "../components/TopQueryBar";
import Map from "./Map";
import Sidebar from "./Sidebar";
import styled from "styled-components";

const StyledAppLayout = styled.div`
  height: 100vh;
  overscroll-behavior-y: none;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const StyledMain = styled.div`
  display: flex;
  height: 100%;
  flex-grow: 1;
  overflow: hidden;
`;

function AppLayout() {
  return (
    <StyledAppLayout>
      <TopQueryBar />
      <StyledMain>
        <Sidebar />
        <Map />
      </StyledMain>
    </StyledAppLayout>
  );
}

export default AppLayout;
