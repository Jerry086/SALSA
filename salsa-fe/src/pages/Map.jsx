import styled from "styled-components";
import React, { useContext, useEffect, useRef } from "react";
import H from "@here/maps-api-for-javascript";
import { TargetAudioContext } from "../contexts/TargetAudioContext";

import MapMarker from "../components/MapMarker";
import { SimilarAudioContext } from "../contexts/SimilarAudioContext";
import VideoPlayerModal from "../components/VideoPlayerModal";
import Polyline from "../components/Polyline";

const StyledMap = styled.div`
  flex: 1;
  height: 100%;
  background-color: var(--color-dark--2);
  position: relative;
`;

// const StyledModal = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   z-index: 9999;
//   background-color: rgba(0, 0, 0, 0.5);
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;

// const ModalContent = styled.div`
//   width: 80%;
//   max-width: 800px;
//   max-height: 80%;
//   overflow: hidden;
//   background-color: #fff;
//   border-radius: 8px;
//   padding: 20px;
// `;

const apiKey = "0va964OiReq0cQakaslJaoqrldVXzZGpoYfCw9v3fq0";

function Map() {
  const mapRef = useRef(null);
  const map = useRef(null);
  const platform = useRef(null);
  const apikey = apiKey;
  const ui = useRef(null);
  const {
    audio_clips,
    setCurrentAudio,
    currentAudio,
    currentTargetAudio,
    modalOpen,
    setModalOpen,
  } = useContext(TargetAudioContext);
  const { similarAudio } = useContext(SimilarAudioContext);

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  useEffect(() => {
    if (!map.current) {
      platform.current = new H.service.Platform({ apikey });

      if (!platform.current) {
        console.error("Failed to initialize platform.");
        return;
      }

      const rasterTileService = platform.current.getRasterTileService({
        queryParams: {
          style: "explore.day",
          size: 512,
        },
      });

      const rasterTileProvider = new H.service.rasterTile.Provider(
        rasterTileService
      );
      const rasterTileLayer = new H.map.layer.TileLayer(rasterTileProvider);
      const newMap = new H.Map(mapRef.current, rasterTileLayer, {
        pixelRatio: window.devicePixelRatio,
        center: {
          lat: 49.2608,
          lng: -123.1139,
        },
        zoom: 5,
      });

      const behavior = new H.mapevents.Behavior(
        new H.mapevents.MapEvents(newMap)
      );

      map.current = newMap;
      ui.current = H.ui.UI.createDefault(newMap, platform.current);
    }
  }, [apikey]);

  useEffect(() => {
    if (map.current) {
      map.current.getViewPort().resize();
    }
  }, []);

  useEffect(() => {
    if (map.current && Object.keys(currentAudio).length > 0) {
      const { latitude, longitude } = currentAudio;
      map.current.getViewModel().setLookAtData({
        position: { lat: latitude, lng: longitude },
        zoom: 5,
      });
    }
  }, [currentAudio]);

  return (
    <StyledMap>
      <div style={{ width: "100%", height: "100%" }} ref={mapRef}>
        {/* initial markers */}
        {Object.keys(currentTargetAudio).length === 0 &&
          audio_clips &&
          audio_clips.map((audio) => (
            <MapMarker
              key={audio.video_id}
              audio={audio}
              map={map.current}
              ui={ui.current}
              setCurrentAudio={setCurrentAudio}
              currentAudio={currentAudio}
              handleModalOpen={handleModalOpen}
              currentTargetAudio={currentTargetAudio}
            />
          ))}
        {Object.keys(currentTargetAudio).length > 0 && currentTargetAudio && (
          <MapMarker
            key={currentTargetAudio.video_id}
            audio={currentTargetAudio}
            map={map.current}
            ui={ui.current}
            setCurrentAudio={setCurrentAudio}
            currentAudio={currentAudio}
            handleModalOpen={handleModalOpen}
            currentTargetAudio={currentTargetAudio}
          />
        )}
        {Object.keys(currentTargetAudio).length > 0 &&
          similarAudio &&
          similarAudio[currentTargetAudio.video_id].map((audio) => (
            <MapMarker
              key={audio.video_id}
              audio={audio}
              map={map.current}
              ui={ui.current}
              setCurrentAudio={setCurrentAudio}
              currentAudio={currentAudio}
              handleModalOpen={handleModalOpen}
              currentTargetAudio={currentTargetAudio}
            />
          ))}
      </div>
      <Polyline map={map.current} />
      {modalOpen && currentAudio && (
        <VideoPlayerModal
          currentAudio={currentAudio}
          setModalOpen={setModalOpen}
        />
      )}
    </StyledMap>
  );
}

export default Map;
