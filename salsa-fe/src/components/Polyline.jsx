import { useEffect, useRef, useContext } from "react";
import H from "@here/maps-api-for-javascript";
import { TargetAudioContext } from "../contexts/TargetAudioContext";
import { SimilarAudioContext } from "../contexts/SimilarAudioContext";

function Polyline({ map, visiblePoints }) {
  const polylineRef = useRef(null);
  const { currentTargetAudio } = useContext(TargetAudioContext);
  const { similarAudio } = useContext(SimilarAudioContext);

  useEffect(() => {
    if (
      !map ||
      !similarAudio ||
      similarAudio.length < 2 ||
      Object.keys(currentTargetAudio).length <= 0
    ) {
      if (polylineRef.current) {
        map.removeObject(polylineRef.current);
        polylineRef.current = null;
      }
      return;
    }

    const sortedSimilarAudio = similarAudio.sort((a, b) => {
      return new Date(a.time) - new Date(b.time);
    });

    let lineString = new H.geo.LineString();
    sortedSimilarAudio.slice(0, visiblePoints).forEach((audio) => {
      lineString.pushPoint({ lat: audio.latitude, lng: audio.longitude });
    });

    if (lineString.getPointCount() >= 2) {
      // Ensure there are at least two points in the lineString
      let polyline = new H.map.Polyline(lineString, {
        style: {
          lineWidth: 3,
          strokeColor: "rgba(33, 55, 223, 0.9)",
          lineDash: [1, 5],
          lineDashOffset: 15,
          lineHeadCap: "arrow-head",
          lineTailCap: "arrow-tail",
        },
      });

      map.addObject(polyline);
      polylineRef.current = polyline;
    }

    return () => {
      if (map && polylineRef.current) {
        map.removeObject(polylineRef.current);
        polylineRef.current = null;
      }
    };
  }, [map, currentTargetAudio, similarAudio, visiblePoints]);

  return null;
}

export default Polyline;
