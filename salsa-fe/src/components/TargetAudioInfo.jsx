function TargetAudioInfo({ audio, handleModalOpen }) {
  const {
    video_id,
    start_time_seconds: start,
    end_time_seconds,
    labels,
    latitude,
    longitude,
    time,
  } = audio;

  return (
    <>
      <div>{video_id}</div>
      <button onClick={handleModalOpen}>Play Music</button>
    </>
  );
}

export default TargetAudioInfo;
