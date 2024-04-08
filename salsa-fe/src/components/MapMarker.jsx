import { useEffect, useState } from "react";
import H from "@here/maps-api-for-javascript";
import "../utils/styles.css";

function addBubble(coords, audio, handleModalOpen, ui, setCurrentAudio) {
  const bubbleCoords = {
    lat: coords.lat,
    lng: coords.lng,
  };

  const content = document.createElement("div");

  // Style for the videoId element
  const videoId = document.createElement("div");
  videoId.textContent = audio.video_id;
  videoId.style.fontWeight = "bold";

  // Style for the location element
  const location = document.createElement("div");
  location.textContent = `Location: lat: ${Number(audio.latitude).toFixed(
    2
  )}, lng: ${Number(audio.longitude).toFixed(2)}`;
  location.style.marginBottom = "5px";

  // Style for the time element
  const time = document.createElement("div");
  time.textContent = `Date: ${audio.time}`;
  time.style.color = "gray";

  // Style for the playButton element
  const playButton = document.createElement("button");
  playButton.textContent = "Play Music";
  playButton.onclick = handleModalOpen;

  // Append elements to the content
  content.appendChild(videoId);
  content.appendChild(location);
  content.appendChild(time);
  content.appendChild(playButton);

  // Set the content style
  content.style.padding = "10px";

  const infoBubble = new H.ui.InfoBubble(bubbleCoords, {
    content,
    maxHeight: 20,
    maxWidth: 100,
  });
  infoBubble.addClass("info-bubble");
  infoBubble.addEventListener("statechange", function (evt) {
    if (evt.target.getState() === H.ui.InfoBubble.State.CLOSED) {
      setCurrentAudio({});
    }
  });

  // Close the previous info bubble if there is one
  if (ui.getBubbles().length > 0) {
    ui.getBubbles().forEach((bubble) => ui.removeBubble(bubble));
  }

  ui.addBubble(infoBubble);
}

function MapMarker({
  audio,
  map,
  ui,
  setCurrentAudio,
  currentAudio,
  handleModalOpen,
  currentTargetAudio,
  isVisible,
}) {
  // console.log(currentAudio);
  useEffect(() => {
    if (map && audio) {
      const isCurrentTargetAudio =
        Object.keys(currentTargetAudio).length > 0 &&
        audio.video_id !== currentTargetAudio.video_id;
      // const iconPath = isCurrentTargetAudio ? "/play.svg" : "/sound.svg";
      let iconPath = "/sound.svg";

      if (isCurrentTargetAudio) {
        if (audio.similarity >= 0.95) {
          iconPath = "/play-blue.svg";
        } else if (audio.similarity >= 0.9) {
          iconPath = "/play-lightblue.svg";
        } else if (audio.similarity >= 0.8) {
          iconPath = "/play-green.svg";
        } else {
          iconPath = "/play-red.svg";
        }
      }

      // Create a custom HTML element for the marker icon
      const iconElement = document.createElement("div");
      iconElement.className = "custom-marker";
      iconElement.innerHTML = `
        <img src="${iconPath}" width="30" height="30" />
        <div class="timestamp">${audio.time.slice(0, 10)}</div>
      `;

      const icon = new H.map.DomIcon(iconElement);
      const coords = { lat: audio.latitude, lng: audio.longitude };
      const marker = new H.map.DomMarker(coords, { icon: icon });

      // Set marker visibility based on the isVisible prop
      marker.setVisibility(isVisible);

      // Bubble info content
      marker.addEventListener("tap", () => {
        setCurrentAudio(audio);
        addBubble(coords, audio, handleModalOpen, ui, setCurrentAudio);
      });

      if (currentAudio.video_id === audio.video_id) {
        addBubble(coords, audio, handleModalOpen, ui, setCurrentAudio);
      }
      map.addObject(marker);

      // Cleanup function to remove the marker when unmounting
      return () => {
        map.removeObject(marker);
      };
    }
  }, [
    audio,
    map,
    ui,
    setCurrentAudio,
    handleModalOpen,
    currentTargetAudio,
    currentAudio.video_id,
    isVisible,
  ]);

  return null;
}

export default MapMarker;
