import { useContext } from "react";
import styled from "styled-components";
import { TargetAudioContext } from "../contexts/TargetAudioContext";
import TargetAudioEntry from "../components/TargetAudioEntry";

const StyledSidebar = styled.div`
  flex-basis: 20rem;
  background-color: var(--color-dark--1);
  padding: 3rem 5rem 3.5rem 5rem;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledListContainer = styled.ul`
  width: 100%;
  height: 65vh;
  list-style: none;
  overflow-y: scroll;
  overflow-x: hidden;

  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

function Sidebar() {
  const { audio_clips, setCurrentTargetAudio } = useContext(TargetAudioContext);

  function handleClear() {
    setCurrentTargetAudio({});
  }
  return (
    <StyledSidebar>
      <button onClick={handleClear}>clear</button>
      <StyledListContainer>
        {audio_clips.map((clip) => (
          <TargetAudioEntry clip={clip} key={clip.video_id} />
        ))}
      </StyledListContainer>
    </StyledSidebar>
  );
}

export default Sidebar;
