import { useContext } from "react";
import { Link } from "react-router-dom";
import { TargetAudioContext } from "../contexts/TargetAudioContext";
import styled from "styled-components";

const StyledTargetAudioEntry = styled.li`
  font-weight: ${({ isCurrentAudio }) => (isCurrentAudio ? "bold" : "normal")};
`;

function TargetAudioEntry({ clip }) {
  const {
    video_id,
    start_time_seconds: start,
    end_time_seconds,
    labels,
    latitude,
    longitude,
    time,
  } = clip;
  const { currentAudio, setCurrentTargetAudio, currentTargetAudio } =
    useContext(TargetAudioContext);
  const isCurrentAudio = currentAudio && currentAudio.video_id === video_id;

  function handleClick() {
    setCurrentTargetAudio(clip);
  }
  console.log(currentTargetAudio);
  return (
    <StyledTargetAudioEntry isCurrentAudio={isCurrentAudio}>
      {/* <Link to={`${video_id}?lat=${latitude}&lng=${longitude}`}>{labels}</Link> */}
      {video_id}
      {start}
      <button onClick={handleClick}>find similar</button>
    </StyledTargetAudioEntry>
  );
}

export default TargetAudioEntry;
