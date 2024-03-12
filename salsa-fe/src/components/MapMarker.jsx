import { useContext, useEffect, useState } from "react";
import H from "@here/maps-api-for-javascript";

const iconSize = { w: 30, h: 30 };

function MapMarker({
  audio,
  map,
  ui,
  setCurrentAudio,
  currentAudio,
  handleModalOpen,
  currentTargetAudio,
}) {
  const [playClicked, setPlayClicked] = useState(false);

  console.log(audio, currentTargetAudio);
  useEffect(() => {
    if (map && audio) {
      const isCurrentTargetAudio =
        Object.keys(currentTargetAudio).length > 0 &&
        audio.video_id !== currentTargetAudio.video_id;
      const iconPath = isCurrentTargetAudio
        ? "/similar_sound.svg"
        : "/sound.svg";
      const icon = new H.map.Icon(iconPath, { size: iconSize });
      const coords = { lat: audio.latitude, lng: audio.longitude };
      const marker = new H.map.Marker(coords, { icon: icon });

      // bubble info content
      marker.addEventListener("tap", () => {
        setCurrentAudio(audio);
        const bubbleCoords = {
          lat: coords.lat,
          lng: coords.lng,
        };

        const content = document.createElement("div");
        const videoId = document.createElement("div");
        videoId.textContent = audio.video_id;

        const playButton = document.createElement("button");
        playButton.textContent = "Play Music";
        playButton.onclick = handleModalOpen;

        content.appendChild(videoId);
        content.appendChild(playButton);

        const infoBubble = new H.ui.InfoBubble(bubbleCoords, {
          content,
          maxHeight: 20,
          maxWidth: 20,
        });

        // Close the previous info bubble if there is one
        if (ui.getBubbles().length > 0) {
          ui.getBubbles().forEach((bubble) => ui.removeBubble(bubble));
        }

        ui.addBubble(infoBubble);
      });

      map.addObject(marker);

      // Cleanup function to remove the marker when unmounting
      return () => {
        map.removeObject(marker);
      };
    }
  }, [audio, map, ui, setCurrentAudio, handleModalOpen]);

  useEffect(() => {
    if (playClicked) {
      setPlayClicked(false);
    }
  }, [playClicked, currentAudio]);

  return null;
}

export default MapMarker;
