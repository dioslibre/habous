import { createEvent, createStore } from "effector";
import style from "../mapbox";
import { getRecord } from "./db";
import {
  propertyChanged,
  $geometries,
  $property,
  $view,
  viewChanged,
  $baseLayer,
} from "./store";
import {
  getColorPaletteForAttributes,
  getScreenDpi,
  setLayerSource,
  transformArrayToWorld,
} from "./utils";
const mapboxgl = window.mapboxgl;
const NewSimpleSelect = Object.assign(window.MapboxDraw.modes.simple_select, {
  dragMove() {},
});
const NewDirectSelect = Object.assign(window.MapboxDraw.modes.direct_select, {
  dragFeature() {},
});

// state
export let map = null;
export let draw = null;

// functions
export function create() {
  map = new mapboxgl.Map({
    accessToken:
      "pk.eyJ1Ijoic25pcHIiLCJhIjoiY2pnd3B1Z2xkMGVzbzJ3b2JpdHA3MTgwbSJ9.zyxsmob18-mVbSBsnHUBqw",
    container: "map",
    style,
    center: $view.getState().center,
    zoom: $view.getState().zoom,
    preserveDrawingBuffer: true,
    maxBounds: [
      [-13.24, 27.66], // Southwest coordinates
      [-1.01, 35.97], // Northeast coordinates
    ],
  });

  const scale = new mapboxgl.ScaleControl({
    maxWidth: getScreenDpi() * 4,
    unit: "metric",
  });

  map.on("load", () => {
    map.addSource("geojson", {
      type: "geojson",
      data: $geojson.getState(),
    });

    // Add styles to the map
    map.addLayer({
      id: "measure-points",
      type: "circle",
      source: "geojson",
      paint: {
        "circle-radius": 5,
        "circle-color": "#000",
      },
      filter: ["in", "$type", "Point"],
    });
    map.addLayer({
      id: "measure-lines",
      type: "line",
      source: "geojson",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#000",
        "line-width": 2.5,
      },
      filter: ["in", "$type", "LineString"],
    });
  });

  map.addControl(scale);

  draw = new window.MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: false,
      trash: false,
    },
    modes: {
      ...window.MapboxDraw.modes,
      simple_select: NewSimpleSelect,
      direct_select: NewDirectSelect,
    },
    defaultMode: "simple_select",
  });

  map.addControl(draw);

  map.on("draw.selectionchange", selectionChanged);

  map.on("dragend", () => {
    viewChanged({
      center: map.getCenter().toArray(),
      zoom: map.getZoom(),
    });
  });

  map.on("zoomend", () => {
    viewChanged({
      center: map.getCenter().toArray(),
      zoom: map.getZoom(),
    });
  });
}

$geometries?.watch((payload) => {
  draw?.set({
    type: "FeatureCollection",
    features: [],
  });
  if (!payload?.length) {
    return;
  }
  const features = payload
    .filter((e) => e.Coordonnées.length > 3)
    .map((e) => ({
      id: e._id,
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [transformArrayToWorld(e.Coordonnées)],
      },
      properties: e,
    }));

  setTimeout(() => {
    draw?.set({
      type: "FeatureCollection",
      features,
    });
  }, 100);
});

export const colorize = (name, attributes) => {
  const palette = getColorPaletteForAttributes(name, attributes);
  map
    .getStyle()
    .layers.filter((e) => e.id.includes("inactive"))
    .forEach((layer) => {
      try {
        map.setPaintProperty(layer.id, "fill-color", palette);
      } catch (e) {
        //
      }
      try {
        map.setPaintProperty(layer.id, "line-color", palette);
      } catch (e) {
        //
      }
    });
};

export function destroy() {
  map.remove();
}

async function selectionChanged(e) {
  const f = e.features[0];
  if (!f) {
    if (draw.getMode() === "simple_select") propertyChanged(null);
    return;
  }

  console.log(f);

  const id = f.properties?._id;
  if (id === $property.getState()?._id) return;
  if (!id) return;
  propertyChanged(f.properties);
  const property = await getRecord(id);
  propertyChanged(property);
}

$property?.watch((payload) => {
  console.log(payload);
  if (!payload) return;
  try {
    draw?.changeMode("direct_select", { featureId: payload._id });
    draw?.changeMode("simple_select", { featureIds: [payload._id] });
  } catch (error) {
    draw?.changeMode("draw_polygon");
    draw?.changeMode("simple_select");
  }
});

$baseLayer?.watch((state) => {
  if (!map) return;
  setLayerSource(map, "google", state);
});

// GeoJSON object to hold our measurement features
export const geojsonChanged = createEvent();
export const $geojson = createStore({
  type: "FeatureCollection",
  features: [],
}).on(geojsonChanged, (_, payload) => ({
  type: "FeatureCollection",
  features: payload,
}));

// Used to draw a line between points
export const linestringChanged = createEvent();
export const $linestring = createStore({
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: [],
  },
}).on(linestringChanged, (_, payload) => ({
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: payload,
  },
}));

export const MeasureTool = function (e) {
  var features = map.queryRenderedFeatures(e.point, {
    layers: ["measure-points"],
  });

  // Remove the linestring from the group
  // So we can redraw it based on the points collection
  let fs = [...$geojson.getState().features];
  if (fs.length > 1) fs.pop();

  // Clear the Distance container to populate it with a new value
  var distanceContainer = document.getElementById("measure");
  distanceContainer.innerHTML = "";

  // If a feature was clicked, remove it from the map
  if (features.length) {
    const id = features[0].properties.id;
    if (id !== fs[0].properties.id) {
      fs = fs.filter(function (point) {
        return point.properties.id !== id;
      });
    } else {
      // measure dist
      const coords = fs.map(function (point) {
        return point.geometry.coordinates;
      });
      coords.push(coords[0]);
      linestringChanged(coords);
      setTimeout(() => {
        fs.push($linestring.getState());

        // Populate the distanceContainer with total distance
        var value = document.createElement("pre");
        value.textContent =
          "Surface: " +
          window.turf.area(window.turf.polygon([coords])).toLocaleString() +
          " m²";
        distanceContainer.appendChild(value);
      }, 50);
      map.off("click", MeasureTool);
      map.off("mousemove", ToolCursor);
    }
  }

  const point = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [e.lngLat.lng, e.lngLat.lat],
    },
    properties: {
      id: String(new Date().getTime()),
    },
  };

  fs.push(point);

  if (fs.length > 1) {
    const coords = fs.map(function (point) {
      return point.geometry.coordinates;
    });
    linestringChanged(coords);
    setTimeout(() => {
      fs.push($linestring.getState());

      // Populate the distanceContainer with total distance
      var value = document.createElement("pre");
      value.textContent =
        "Distance: " +
        window.turf
          .length($linestring.getState(), { units: "meters" })
          .toLocaleString() +
        " m";
      distanceContainer.appendChild(value);
    }, 50);
  }

  geojsonChanged(fs);
  setTimeout(() => {
    map?.getSource("geojson").setData($geojson.getState());
  }, 50);
};

export const ToolCursor = function (e) {
  var features = map.queryRenderedFeatures(e.point);
  // UI indicator for clicking/hovering a point on the map
  map.getCanvas().style.cursor = features.length ? "pointer" : "crosshair";
};
