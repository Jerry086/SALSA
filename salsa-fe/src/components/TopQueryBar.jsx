import TopKQuery from "./TopKQuery";
import TimeQuery from "./TimeQuery";
import DistanceQuery from "./DistanceQuery";

const topQueryBarStyle = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  padding: "15px 0",
  backgroundColor: "#98c099",
  color: "white",
};

function TopQueryBar() {
  return (
    <div style={topQueryBarStyle}>
      <TopKQuery />
      <TimeQuery />
      <DistanceQuery />
    </div>
  );
}

export default TopQueryBar;
