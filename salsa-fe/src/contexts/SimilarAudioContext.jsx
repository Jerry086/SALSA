import { createContext, useReducer } from "react";
import { getSimilarAudios } from "../services/AudioApi";

export const SimilarAudioContext = createContext();
const initialState = {
  similarAudio: [],
  isLoading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "similar_audio_clips/loaded":
      return { ...state, isLoading: false, similarAudio: action.payload };
    default:
      throw new Error("unknown action");
  }
}

function SimilarAudioProvider({ children }) {
  const [{ similarAudio, isLoading }, dispatch] = useReducer(
    reducer,
    initialState
  );

  async function getSimilarSounds(videoId) {
    dispatch({ type: "loading" });
    const data = await getSimilarAudios(videoId);
    const sortedData = data.sort((a, b) => {
      return new Date(a.time) - new Date(b.time);
    });
    console.log(sortedData);
    dispatch({ type: "similar_audio_clips/loaded", payload: sortedData });
  }

  function setSimilarSounds(audio) {
    if (audio) {
      dispatch({ type: "similar_audio_clips/loaded", payload: audio });
    }
  }

  return (
    <SimilarAudioContext.Provider
      value={{ similarAudio, isLoading, getSimilarSounds, setSimilarSounds }}
    >
      {children}
    </SimilarAudioContext.Provider>
  );
}

export { SimilarAudioProvider };
