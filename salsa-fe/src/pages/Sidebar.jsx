import { useContext, useEffect, useRef } from "react";
import styled from "styled-components";
import { TargetAudioContext } from "../contexts/TargetAudioContext";
import TargetAudioEntry from "../components/TargetAudioEntry";
import UploadSoundsButton from "../components/UploadSoundsButton";

const StyledSidebar = styled.div`
  flex-basis: 20rem;
  /* background-color: #2d3439; */
  padding: 3rem 3rem 3.5rem 3rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
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
  const { audio_clips, currentAudio } = useContext(TargetAudioContext);
  const currentAudioRef = useRef(null);

  useEffect(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentAudio]);

  return (
    <StyledSidebar>
      <UploadSoundsButton />
      <StyledListContainer>
        {audio_clips.map((clip) => (
          <TargetAudioEntry
            ref={
              currentAudio && clip.video_id === currentAudio.video_id
                ? currentAudioRef
                : null
            }
            clip={clip}
            key={clip.video_id}
          />
        ))}
      </StyledListContainer>
    </StyledSidebar>
  );
}

export default Sidebar;
