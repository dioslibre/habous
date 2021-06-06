import Shuffle20 from "@carbon/icons-react/es/shuffle/20";
import { Button, TextInput } from "carbon-components-react";
import { useStore } from "effector-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  $baseLayer,
  baseLayerChanged,
  $x,
  xChanged,
  $y,
  yChanged,
  $centerProjected,
} from "../modules/store";
import { Location20, ArrowRight20, Ruler20 } from "@carbon/icons-react";
import { transformOneToWorld } from "../modules/utils";
import {
  map,
  MeasureTool,
  ToolCursor,
  geojsonChanged,
  $geojson,
} from "../modules/map";

export function Coordinates() {
  const center = useStore($centerProjected);

  if (!center?.length) return;

  return (
    <div
      className="absolute ease-in left-48 shadow-md z-10 flex-row flex space-x-2"
      style={{ bottom: 10 }}
    >
      <div className="mapboxgl-ctrl mapboxgl-ctrl-scale">
        X {center[0].toFixed(2)}
      </div>
      <div className="mapboxgl-ctrl mapboxgl-ctrl-scale">
        Y {center[1].toFixed(2)}
      </div>
    </div>
  );
}

export function FlyBar() {
  const [width, setWidth] = useState(50);
  const [id, setId] = useState();

  const open = useCallback(() => {
    if (id) {
      clearTimeout(id);
      setId();
    }
    setWidth(460);
  }, [id]);

  const close = useCallback(() => {
    setId(setTimeout(() => setWidth(50) & setId(), 5000));
  }, []);

  return (
    <div
      onMouseLeave={() => width > 50 && close()}
      onMouseEnter={open}
      className="absolute bg-white ease-in top-2 left-2 shadow-md z-10 flex flex-row"
      style={{ width, transition: "width 100ms ease-out" }}
    >
      <Button onClick={() => setWidth(50) & setId()}>
        <Location20 slot="icon" />
      </Button>
      {width > 50 ? <X /> : null}
      {width > 50 ? <Y /> : null}
      {width > 50 ? <Go /> : null}
    </div>
  );
}

const X = () => {
  const x = useStore($x);
  const ref = useRef();

  useEffect(() => {
    if (!ref?.current) return;
    ref.current.focus();
  }, [ref]);

  return (
    <TextInput
      labelText=""
      id="fly-x"
      ref={ref}
      className="mt-2 ml-2"
      type="number"
      defaultValue={x}
      light
      size="sm"
      placeholder="X"
      onChange={(event) => xChanged(event.target.value)}
    ></TextInput>
  );
};

const Y = () => {
  const y = useStore($y);
  return (
    <TextInput
      labelText=""
      id="fly-y"
      className="mt-2 ml-2"
      type="number"
      defaultValue={y}
      light
      size="sm"
      placeholder="Y"
      onChange={(event) => yChanged(event.target.value)}
    ></TextInput>
  );
};

const Go = () => {
  const x = useStore($x);
  const y = useStore($y);
  const [marker, setMarker] = useState();

  const go = useCallback(async () => {
    if (!x || !y) return;
    let coordinates = await transformOneToWorld([parseFloat(x), parseFloat(y)]);

    if (marker) {
      marker.remove();
      map.removeLayer(marker);
    }
    const m = new window.mapboxgl.Marker({ color: "red" })
      .setLngLat(coordinates)
      .addTo(map);
    m.getElement().addEventListener(
      "click",
      () => m.remove() & setMarker(null)
    );

    const bbox = [
      [coordinates[0] - 0.001, coordinates[1] - 0.001],
      [coordinates[0] + 0.001, coordinates[1] + 0.001],
    ];

    map.fitBounds(bbox);

    setMarker(m);
  }, [x, y, marker]);

  return (
    <Button className="float-right" kind={"ghost"} onClick={go}>
      <ArrowRight20 slot="icon" />
    </Button>
  );
};

export function BaseLayerBar() {
  const baseLayer = useStore($baseLayer);
  const [width, setWidth] = useState(50);
  const [id, setId] = useState();

  const open = useCallback(() => {
    if (id) {
      clearTimeout(id);
      setId();
    } else setWidth(300);
  }, [id]);

  const close = useCallback(() => {
    setId(setTimeout(() => setWidth(50) & setId(), 1000));
  }, []);

  return (
    <div
      onMouseLeave={close}
      onMouseEnter={open}
      className="absolute bg-white ease-in bottom-2 right-2 shadow-md z-10 flex-row flex"
      style={{ width, transition: "width 100ms ease-out" }}
    >
      <Button onClick={() => setWidth(50)}>
        <Shuffle20 slot="icon" />
      </Button>
      {width > 50 ? (
        <Button
          kind={baseLayer === "Satellite" ? "primary" : "ghost"}
          onClick={() => baseLayerChanged("Satellite")}
        >
          Satellite
        </Button>
      ) : null}
      {width > 50 ? (
        <Button
          kind={baseLayer === "Carte" ? "primary" : "ghost"}
          onClick={() => baseLayerChanged("Carte")}
        >
          Carte
        </Button>
      ) : null}
      {width > 50 ? (
        <Button
          kind={baseLayer === "Hybride" ? "primary" : "ghost"}
          onClick={() => baseLayerChanged("Hybride")}
        >
          Hybride
        </Button>
      ) : null}
    </div>
  );
}

export const Measure = () => {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (on) {
      map?.on("click", MeasureTool);
      map?.on("mousemove", ToolCursor);
    } else {
      map?.off("click", MeasureTool);
      map?.off("mousemove", ToolCursor);
      geojsonChanged([]);
      setTimeout(() => {
        map?.getSource("geojson")?.setData($geojson.getState());
      }, 100);
    }
  }, [on]);

  return (
    <>
      {on && <div id="measure" className="measure-container"></div>}
      <Button
        className="absolute bg-white top-2 right-2 shadow-md z-10"
        kind={"ghost"}
        onClick={() => setOn(!on)}
      >
        <Ruler20 slot="icon" />
      </Button>
    </>
  );
};
