import YouTubeVideo from "../components/YoutubeVideo";
import AudioPlayer from "./AudioPlayer";
import Modal from "./Modal";

function VideoPlayerModal({ currentAudio, setModalOpen }) {
  const isYoutube = currentAudio.source === "youtube";

  const youtubeVideo = (
    <YouTubeVideo
      videoId={currentAudio.video_id}
      startTimeSeconds={currentAudio.start_time_seconds}
    />
  );

  const audio = <AudioPlayer url={currentAudio.url} />;

  return (
    <Modal
      setModalOpen={setModalOpen}
      content={isYoutube ? youtubeVideo : audio}
    />
  );
}

export default VideoPlayerModal;
