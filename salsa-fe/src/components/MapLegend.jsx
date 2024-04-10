import React from "react";
import styled from "styled-components";

const LegendContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const Icon = styled.span`
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 10px;
  background-color: ${(props) => props.color};
`;

const MapLegend = () => {
  return (
    <LegendContainer>
      <LegendItem>
        <Icon color="blue" />
        Similarity {">"}= 0.95
      </LegendItem>
      <LegendItem>
        <Icon color="lightblue" />
        {"0.90 <= Similarity < 0.95"}
      </LegendItem>
      <LegendItem>
        <Icon color="green" />
        {"0.85 <= Similarity < 0.90"}
      </LegendItem>
      <LegendItem>
        <Icon color="red" />
        {" Similarity < 0.85"}
      </LegendItem>
    </LegendContainer>
  );
};

export default MapLegend;
