import { useEffect, useRef, useContext } from "react";
import H from "@here/maps-api-for-javascript";
import { TargetAudioContext } from "../contexts/TargetAudioContext";
import { SimilarAudioContext } from "../contexts/SimilarAudioContext";

function Polyline({ map, visiblePoints }) {
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

    const sortedSimilarAudio = similarAudio[currentTargetAudio.video_id].sort(
      (a, b) => {
        return new Date(a.time) - new Date(b.time);
      }
    );

    let lineString = new H.geo.LineString();
    lineString.pushPoint({
      lat: sortedSimilarAudio[0].latitude,
      lng: sortedSimilarAudio[0].longitude,
    });
    lineString.pushPoint({
      lat: sortedSimilarAudio[0].latitude,
      lng: sortedSimilarAudio[0].longitude,
    });
    let polyline = new H.map.Polyline(lineString, {
      style: {
        lineWidth: 8,
        strokeColor: "rgba(33, 55, 223, 0.9)",
        lineDash: [1, 5],
        lineDashOffset: 15,
        lineHeadCap: "arrow-head",
        lineTailCap: "arrow-tail",
      },
    });

    map.addObject(polyline);
    polylineRef.current = polyline;

    // Add points to the lineString based on visiblePoints
    const pointsToAdd = sortedSimilarAudio.slice(0, visiblePoints);
    if (pointsToAdd.length >= 2) {
      // Ensure there are at least two points
      pointsToAdd.forEach((audio) => {
        lineString.pushPoint({ lat: audio.latitude, lng: audio.longitude });
      });
      polyline.setGeometry(lineString);
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
