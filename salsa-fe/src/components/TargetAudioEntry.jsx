import { useContext } from "react";
import { TargetAudioContext } from "../contexts/TargetAudioContext";
import styled from "styled-components";
import { labelsDict } from "../utils/labels";

const StyledTargetAudioEntry = styled.li`
  background-color: ${({ isCurrentAudio }) =>
    isCurrentAudio ? "#356eaa" : "#7c98af"};
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;

  border-radius: 7px;
  padding: 1rem 1.5rem;
  cursor: pointer;

  color: inherit;
  text-decoration: none;
`;

const StyledButton = styled.button`
  height: 2rem;
  width: 4rem;
  border-radius: 0.5rem;
  border: none;
  background-color: #98c099;
  color: white;
  font-size: 1rem;
  font-weight: 400;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #356eaa;
  }
`;

function TargetAudioEntry({ clip, handleMarkerClick }) {
  const { video_id, labels, time } = clip;
  const {
    currentAudio,
    setCurrentTargetAudio,
    setCurrentAudio,
    setModalOpen,
    currentTargetAudio,
  } = useContext(TargetAudioContext);
  const isCurrentAudio = currentAudio && currentAudio.video_id === video_id;
  const isCurrentTargetAudio =
    currentTargetAudio && currentTargetAudio.video_id === video_id;

  function handleSimilarSounds() {
    setCurrentTargetAudio(clip);
  }

  function handleClick() {
    if (isCurrentAudio) {
      setCurrentAudio({});
    } else {
      setCurrentAudio(clip);
    }
  }

  function handlePlay() {
    setModalOpen(true);
  }

  function handleClear() {
    setCurrentTargetAudio({});
  }

  return (
    <StyledTargetAudioEntry isCurrentAudio={isCurrentAudio}>
      <div onClick={handleClick}>
        {JSON.parse(labels)
          .map((label) => labelsDict[label])
          .join(", ")}
        - {video_id}
      </div>
      <StyledButton onClick={handlePlay}>Play</StyledButton>
      {!isCurrentTargetAudio && (
        <StyledButton onClick={handleSimilarSounds}>
          Similar Sounds
        </StyledButton>
      )}
      {isCurrentTargetAudio && (
        <StyledButton onClick={handleClear}>Clear</StyledButton>
      )}
    </StyledTargetAudioEntry>
  );
}

export default TargetAudioEntry;
