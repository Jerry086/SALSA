import YouTubeVideo from "../components/YoutubeVideo";
import Map from "./Map";
import Sidebar from "./Sidebar";
import styled from "styled-components";

const StyledAppLayout = styled.div`
  height: 100vh;
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
