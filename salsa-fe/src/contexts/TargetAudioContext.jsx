import { createContext, useEffect, useReducer } from "react";
import { getAllAudios } from "../services/AudioApi";

export const TargetAudioContext = createContext();
const initialState = {
  audio_clips: [],
  isLoading: false,
  // the current active audio
  currentAudio: {},
  // the currently active audio that is being searched for similar sounds.
  currentTargetAudio: {},
  modalOpen: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "audio_clips/loaded":
      return { ...state, isLoading: false, audio_clips: action.payload };
    case "audio_clip/loaded":
      return { ...state, isLoading: false, currentAudio: action.payload };
    case "audio_clip/played":
      return { ...state, modalOpen: true };
    case "audio_clip/stopped":
      return { ...state, modalOpen: false };
    case "audio_clip/target_loaded":
      return { ...state, isLoading: false, currentTargetAudio: action.payload };
    case "audio_clip/upload_audio":
      return { ...state, isLoading: false, audio_clips: action.payload };
    default:
      throw new Error("unknown action");
  }
}

function TargetAudioProvider({ children }) {
  const [
    { audio_clips, isLoading, currentAudio, currentTargetAudio, modalOpen },
    dispatch,
  ] = useReducer(reducer, initialState);

  useEffect(() => {
    async function fetchAudioClips() {
      dispatch({ type: "loading" });
      try {
        // const data = await readCSVFile("/audioset/sample_audio_list.csv");
        const data = await getAllAudios();
        dispatch({ type: "audio_clips/loaded", payload: data.slice(-30) });
      } catch (err) {
        console.log(err);
      }
    }
    fetchAudioClips();
  }, []);

  function setCurrentAudio(current_clip) {
    if (current_clip.video_id === currentAudio.video_id) return;
    dispatch({ type: "audio_clip/loaded", payload: current_clip });
  }

  function setCurrentTargetAudio(current_clip) {
    if (
      current_clip &&
      currentTargetAudio &&
      current_clip.video_id === currentTargetAudio.video_id
    )
      return;
    dispatch({ type: "audio_clip/target_loaded", payload: current_clip });
  }

  function setModalOpen(option) {
    if (option === true) {
      dispatch({ type: "audio_clip/played" });
    } else {
      dispatch({ type: "audio_clip/stopped" });
    }
  }

  function addAudio(clip) {
    if (clip) {
      const newAudio = [clip, ...audio_clips];
      dispatch({ type: "audio_clip/upload_audio", payload: newAudio });
    }
  }

  return (
    <TargetAudioContext.Provider
      value={{
        audio_clips,
        isLoading,
        currentAudio,
        currentTargetAudio,
        setCurrentAudio,
        setCurrentTargetAudio,
        modalOpen,
        setModalOpen,
        addAudio,
      }}
    >
      {children}
    </TargetAudioContext.Provider>
  );
}

export { TargetAudioProvider };
