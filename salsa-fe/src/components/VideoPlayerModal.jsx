import YouTubeVideo from "../components/YoutubeVideo";
import Modal from "./Modal";

function VideoPlayerModal({ currentAudio, setModalOpen }) {
  const youtubeVideo = (
    <YouTubeVideo
      videoId={currentAudio.video_id}
      startTimeSeconds={currentAudio.start_time_seconds}
    />
  );

  return <Modal setModalOpen={setModalOpen} content={youtubeVideo} />;
}

export default VideoPlayerModal;
