export default {
  version: 8,
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  sources: {
    Carte: {
      type: "raster",
      tiles: ["https://mt0.google.com/vt/lyrs=r&hl=fr&x={x}&y={y}&z={z}"],
      tileSize: 256,
    },
    Hybride: {
      type: "raster",
      tiles: ["https://mt0.google.com/vt/lyrs=y&hl=fr&x={x}&y={y}&z={z}"],
      tileSize: 256,
    },
    Satellite: {
      type: "raster",
      tiles: ["https://mt3.google.com/vt/lyrs=s&hl=fr&x={x}&y={y}&z={z}"],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "google",
      type: "raster",
      source: "Hybride",
      minzoom: 0,
      maxzoom: 24,
    },
    // {
    //   id: "data",
    //   type: "fill",
    //   source: "data",
    //   "source-layer": "public.parents_fill",
    //   paint: {
    //     "fill-color": "#0f62fe",
    //     "fill-opacity": [
    //       "case",
    //       ["boolean", ["feature-state", "hover"], false],
    //       0.6,
    //       0.1,
    //     ],
    //   },
    // },
    // {
    //   id: "data-highlighted",
    //   type: "fill",
    //   source: "data",
    //   "source-layer": "public.parents_fill",
    //   paint: {
    //     "fill-color": "#da1e28",
    //     "fill-opacity": 0.4,
    //   },
    //   filter: ["in", "parent_id", ""],
    // },
    // {
    //   id: "data-outline",
    //   type: "line",
    //   source: "data",
    //   "source-layer": "public.parents_fill",
    //   paint: {
    //     "line-color": "#0f62fe",
    //     "line-width": 1,
    //   },
    // },
    // {
    //   id: "data-outline-highlighted",
    //   type: "line",
    //   source: "data",
    //   "source-layer": "public.parents_fill",
    //   paint: {
    //     "line-color": "#da1e28",
    //     "line-width": 3,
    //   },
    //   filter: ["in", "parent_id", ""],
    // },
  ],
};
