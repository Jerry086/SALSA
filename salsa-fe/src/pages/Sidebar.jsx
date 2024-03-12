import { useContext } from "react";
import styled from "styled-components";
import { TargetAudioContext } from "../contexts/TargetAudioContext";
import TargetAudioEntry from "../components/TargetAudioEntry";

const StyledSidebar = styled.div`
  flex-basis: 20rem;
  /* background-color: #2d3439; */
  padding: 3rem 3rem 3.5rem 3rem;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledListContainer = styled.ul`
  width: 100%;
  height: 90%;
  list-style: none;
  overflow-y: scroll;
  overflow-x: hidden;

  display: flex;
  flex-direction: column;
  gap: 1.4rem;

  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for Firefox */
  scrollbar-width: none;
`;

function Sidebar() {
  const { audio_clips } = useContext(TargetAudioContext);

  return (
    <StyledSidebar>
      <StyledListContainer>
        {audio_clips.map((clip) => (
          <TargetAudioEntry clip={clip} key={clip.video_id} />
        ))}
      </StyledListContainer>
    </StyledSidebar>
  );
}

export default Sidebar;
