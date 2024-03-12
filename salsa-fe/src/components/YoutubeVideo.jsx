import React, { useState } from "react";
import YouTube from "react-youtube";

const YouTubeVideo = ({ videoId, startTimeSeconds }) => {
  const [player, setPlayer] = useState(null);
  const startTime = parseInt(startTimeSeconds);

  const onReady = (event) => {
    // access to player in all event handlers via event.target
    setPlayer(event.target);
    // start playing the video from the specified time
    event.target.seekTo(startTime);
    event.target.playVideo();
  };

  return <YouTube videoId={videoId} onReady={onReady} />;
};

export default YouTubeVideo;
