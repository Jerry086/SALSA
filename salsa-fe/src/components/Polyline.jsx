import { useEffect, useRef, useContext } from "react";
import H from "@here/maps-api-for-javascript";
import { TargetAudioContext } from "../contexts/TargetAudioContext";
import { SimilarAudioContext } from "../contexts/SimilarAudioContext";

function Polyline({ map }) {
  const polylineRef = useRef(null);
  const { currentTargetAudio } = useContext(TargetAudioContext);
  const { similarAudio } = useContext(SimilarAudioContext);

  useEffect(() => {
    if (!map || !similarAudio || Object.keys(currentTargetAudio).length <= 0) {
      if (polylineRef.current) {
        map.removeObject(polylineRef.current);
        polylineRef.current = null;
      }
      return;
    }

    // Sort similarAudio based on date
    const sortedSimilarAudio = similarAudio[currentTargetAudio.video_id].sort(
      (a, b) => {
        return new Date(a.time) - new Date(b.time);
      }
    );
    console.log(sortedSimilarAudio);
    let lineString = new H.geo.LineString();

    sortedSimilarAudio.forEach((audio) => {
      lineString.pushPoint({ lat: audio.latitude, lng: audio.longitude });
    });

    var polyline = new H.map.Polyline(lineString, {
      style: {
        lineWidth: 8,
        strokeColor: "rgba(63, 132, 216, 0.9)",
        lineDash: [1, 5],
        lineDashOffset: 15,
        lineHeadCap: "arrow-head",
        lineTailCap: "arrow-tail",
      },
    });

    map.addObject(polyline);
    polylineRef.current = polyline;

    // Cleanup function to remove the polyline when the component unmounts or currentTargetAudio changes
    return () => {
      if (map && polylineRef.current) {
        map.removeObject(polylineRef.current);
        polylineRef.current = null;
      }
    };
  }, [map, currentTargetAudio, similarAudio]);

  return null;
}

export default Polyline;
