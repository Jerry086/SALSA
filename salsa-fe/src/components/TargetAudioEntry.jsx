import { forwardRef, useContext } from "react";
import { TargetAudioContext } from "../contexts/TargetAudioContext";
import styled from "styled-components";
import { SimilarAudioContext } from "../contexts/SimilarAudioContext";

const StyledTargetAudioEntry = styled.li`
  background-color: ${({ isCurrentAudio }) =>
    isCurrentAudio ? "#356eaa" : "#7c98af"};
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  max-width: 20rem;
  border-radius: 7px;
  padding: 1rem 1rem;
  cursor: pointer;

  color: inherit;
  text-decoration: none;
`;

const Labels = styled.div`
  flex: 1 1 auto;
  /* min-width: 0; */
  word-break: break-word;
  margin-right: 0.5rem;
`;

const ButtonContainer = styled.div`
  flex-shrink: 0;
  display: flex;
  gap: 0.5rem;
`;

const StyledButton = styled.button`
  height: 2rem;
  width: auto;
  max-width: 3rem;
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

const TargetAudioEntry = forwardRef(({ clip }, ref) => {
  const { video_id, labels, filename } = clip;
  const {
    currentAudio,
    setCurrentTargetAudio,
    setCurrentAudio,
    setModalOpen,
    currentTargetAudio,
  } = useContext(TargetAudioContext);
  const { setSimilarSounds, getSimilarSounds, range } =
    useContext(SimilarAudioContext);
  const isCurrentAudio = currentAudio && currentAudio.video_id === video_id;
  const isCurrentTargetAudio =
    currentTargetAudio && currentTargetAudio.video_id === video_id;

  async function handleSimilarSounds() {
    setCurrentTargetAudio(clip);
    console.log(range);
    getSimilarSounds(video_id, range.k, range.date, range.radius);
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
    setCurrentAudio(clip);
  }

  function handleClear() {
    setCurrentTargetAudio({});
    setSimilarSounds([]);
  }

  return (
    <StyledTargetAudioEntry ref={ref} isCurrentAudio={isCurrentAudio}>
      {labels && <Labels onClick={handleClick}>{labels?.join(", ")}</Labels>}
      {/* {filename && <Labels onClick={handleClick}>{filename}</Labels>} */}
      <ButtonContainer>
        <StyledButton onClick={handlePlay}>Play</StyledButton>
        {!isCurrentTargetAudio && (
          <StyledButton onClick={handleSimilarSounds}>
            Similar Sounds
          </StyledButton>
        )}
        {isCurrentTargetAudio && (
          <StyledButton onClick={handleClear}>Clear</StyledButton>
        )}
      </ButtonContainer>
    </StyledTargetAudioEntry>
  );
});

export default TargetAudioEntry;
