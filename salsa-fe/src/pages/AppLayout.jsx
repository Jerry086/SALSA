import Map from "./Map";
import Sidebar from "./Sidebar";
import styled from "styled-components";

const StyledAppLayout = styled.div`
  height: 100vh;
  padding: 2.4rem;
  overscroll-behavior-y: none;
  display: flex;
  position: relative;
`;

function AppLayout() {
  return (
    <StyledAppLayout>
      <Sidebar />
      <Map />
    </StyledAppLayout>
  );
}

export default AppLayout;
