import { create, destroy } from "../modules/map";
import React, { useEffect } from "react";
import { BaseLayerBar, Coordinates, FlyBar, Measure } from "./Controls";

const Map = () => {
  useEffect(() => {
    setTimeout(create);
    return destroy;
  }, []);
  return (
    <div className="h-full flex-grow-default" id="map">
      <FlyBar />
      <Coordinates />
      <BaseLayerBar />
      <Measure />
    </div>
  );
};

export default Map;
