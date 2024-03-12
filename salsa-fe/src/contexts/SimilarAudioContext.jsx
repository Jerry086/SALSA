import { createContext, useEffect, useReducer } from "react";
import { readCSVFile } from "../utils/convertCsv";

export const SimilarAudioContext = createContext();
const initialState = {
  similarAudio: {},
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
  const [{ similarAudio }, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function fetchAudioClips() {
      dispatch({ type: "loading" });
      try {
        const data = await readCSVFile("/audioset/similar_videos_info.csv");
        let result = {};
        data.forEach((entry) => {
          const { target_video_id, ...rest } = entry;
          // If the target_video_id already exists in the result object
          if (result[target_video_id]) {
            // Add the current entry to the array of objects
            result[target_video_id].push({ ...rest });
          } else {
            // Otherwise, create a new array with the current entry
            result[target_video_id] = [{ ...rest }];
          }
        });
        dispatch({ type: "similar_audio_clips/loaded", payload: result });
      } catch (err) {
        console.log(err);
      }
    }
    fetchAudioClips();
  }, []);

  return (
    <SimilarAudioContext.Provider value={{ similarAudio }}>
      {children}
    </SimilarAudioContext.Provider>
  );
}

export { SimilarAudioProvider };
