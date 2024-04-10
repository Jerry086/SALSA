import { createContext, useReducer } from "react";
import { getSimilarAudios } from "../services/AudioApi";

export const SimilarAudioContext = createContext();
const initialState = {
  similarAudio: [],
  isLoading: false,
  range: { k: 20, date: "2000-01-01", radius: "" },
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "similar_audio_clips/loaded":
      return { ...state, isLoading: false, similarAudio: action.payload };
    case "similar_audio_clips/setRange":
      return { ...state, isLoading: false, range: action.payload };
    default:
      throw new Error("unknown action");
  }
}

function SimilarAudioProvider({ children }) {
  const [{ similarAudio, isLoading, range }, dispatch] = useReducer(
    reducer,
    initialState
  );

  async function getSimilarSounds(videoId, k, date, radius) {
    dispatch({ type: "loading" });
    const data = await getSimilarAudios(videoId, k, date, radius);
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

  function setRange(k, date, radius) {
    const newRange = { ...range };

    if (date !== null) {
      newRange.date = date;
    }
    if (k !== null) {
      newRange.k = k;
    }
    if (radius !== null) {
      newRange.radius = radius;
    }
    dispatch({ type: "similar_audio_clips/setRange", payload: newRange });
  }

  return (
    <SimilarAudioContext.Provider
      value={{
        similarAudio,
        isLoading,
        getSimilarSounds,
        setSimilarSounds,
        setRange,
        range,
      }}
    >
      {children}
    </SimilarAudioContext.Provider>
  );
}

export { SimilarAudioProvider };
