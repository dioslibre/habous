import proj4 from "proj4";
import { Workbook } from "exceljs";
import { PropertyFields } from "./store";

proj4.defs(
  "EPSG:26191",
  "+proj=lcc +lat_1=33.3 +lat_0=33.3 +lon_0=-5.4 +k_0=0.999625769 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs"
);

export function getScreenDpi() {
  const el = document.createElement("div");
  el.style = "width: 1cm;";
  document.body.appendChild(el);
  const dpi = el.offsetWidth;
  document.body.removeChild(el);

  return dpi;
}

export async function send(url, method, data) {
  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: data && JSON.stringify(data),
  });
  return res.ok ? await res.json() : null;
}

export function humanFileSize(bytes, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

export function getPolygonArea(vertices) {
  var total = 0;

  for (var i = 0, l = vertices.length; i < l; i++) {
    var addX = vertices[i][0];
    var addY = vertices[i == vertices.length - 1 ? 0 : i + 1][1];
    var subX = vertices[i == vertices.length - 1 ? 0 : i + 1][0];
    var subY = vertices[i][1];

    total += addX * addY * 0.5;
    total -= subX * subY * 0.5;
  }

  return Math.abs(total);
}

export const getCentroid = (pts) => {
  var first = pts[0],
    last = pts[pts.length - 1];
  if (first[0] != last[0] || first[1] != last[1]) pts.push(first);
  var twicearea = 0,
    x = 0,
    y = 0,
    nPts = pts.length,
    p1,
    p2,
    f;
  for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
    p1 = pts[i];
    p2 = pts[j];
    f = p1[0] * p2[1] - p2[0] * p1[1];
    twicearea += f;
    x += (p1[0] + p2[0]) * f;
    y += (p1[1] + p2[1]) * f;
  }
  f = twicearea * 3;
  return [x / f, y];
};

export const getRotation = (point, projection) => {
  try {
    const A1 = proj4("EPSG:4326", "EPSG:3857", [
        point.lng + 0.0005,
        point.lat + 0.0005,
      ]),
      A2 = [A1[0] + 10, A1[1] + 10],
      B1 = proj4("EPSG:3857", projection, A1),
      B2 = proj4("EPSG:3857", projection, A2);

    var dAx = A2[0] - A1[0];
    var dAy = A2[1] - A1[1];
    var dBx = B2[0] - B1[0];
    var dBy = B2[1] - B1[1];
    var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
    if (angle < 0) {
      angle = angle * -1;
    }
    var degree_angle = angle * (180 / Math.PI);
    return degree_angle;
  } catch (err) {
    return 0;
  }
};

export const getZoomForResolution = (scale, dpi) => {
  const resolution = (scale * 2.45) / 100 / dpi;
  return (
    Math.log(156543.03390625) * Math.LOG2E - Math.log(resolution) * Math.LOG2E
  );
};

export const transformMultiPolygon = (coords, from, to) => {
  const transformed = coords.map((a) =>
    a.map((e) =>
      e.map((v) => {
        return proj4(from, to, v);
      })
    )
  );
  return transformed;
};

export const transformArrayToLocal = (a) => {
  return a.map((v) => proj4("EPSG:4326", "EPSG:26191", v));
};

export const transformArrayToWorld = (a) => {
  return a.map((v) => proj4("EPSG:26191", "EPSG:4326", v));
};

export const transformOneToLocal = (a) => {
  return proj4("EPSG:4326", "EPSG:26191", a);
};

export const transformOneToWorld = (a) => {
  return proj4("EPSG:26191", "EPSG:4326", a);
};

export const setLayerSource = (map, layerId, source, sourceLayer) => {
  if (!map) return;
  const oldLayers = map.getStyle().layers;
  const layerIndex = oldLayers.findIndex((l) => l.id === layerId);
  const layerDef = oldLayers[layerIndex];
  const before = oldLayers[layerIndex + 1] && oldLayers[layerIndex + 1].id;
  layerDef.source = source;
  if (sourceLayer) {
    layerDef["source-layer"] = sourceLayer;
  }
  map.removeLayer(layerId);
  map.addLayer(layerDef, before);
};

export const headers = [
  "Unité",
  "ID",
  "Assiette",
  "Statut de possession",
  "Régime",
  "Référence",
  "Conservation",
  "Affectation",
  "Consistance",
  "Propriétaire",
  "Superficie",
  "Valeur Vénale",
  "Valeur Locative",
  "X",
  "Y",
  "Adresse",
  "Note",
];

export async function saveExcel(data, attributes) {
  const aoa = [
    PropertyFields,
    ...data.map((prop) => {
      const p = [];
      PropertyFields.forEach((e) => {
        if (!prop[e]) {
          p.push("");
          return;
        }
        if (attributes[e])
          p.push(attributes[e].find((a) => a._id === prop[e])?.name || "");
        else p.push(prop[e]);
      });
      return p;
    }),
  ];

  const workbook = new Workbook();
  const sheet = workbook.addWorksheet("Propriétés");
  sheet.addRows(aoa);

  var row = sheet.getRow(1);
  row.font = {
    bold: true,
    size: 12,
  };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFAFAD2" },
    bgColor: { argb: "FFD8D8D8" },
  };

  autofitColumns(sheet);
  const buffer = await workbook.xlsx.writeBuffer();
  window.saveAs(new Blob([buffer]), "Propriétés.xlsx");
}

export async function saveDat(data) {
  const lines = [];
  data.map((e) => {
    if (e.projected.length === 1) {
      lines.push(e.label);
      lines.push(e.projected[0][0].length);
      e.projected[0][0].forEach((c) =>
        lines.push(c.map((v) => v.toFixed(2)).join(" "))
      );
    } else {
      e.projected.forEach((p, i) => {
        lines.push(e.label + `-P${i + 1}`);
        lines.push(p[0].length);
        p[0].forEach((c) => lines.push(c.map((v) => v.toFixed(2)).join(" ")));
      });
    }
  });

  window.saveAs(new Blob([lines.join("\n")]), "Assiette.txt");
}

export function eachColumnInRange(ws, col1, col2, cb) {
  for (let c = col1; c <= col2; c++) {
    let col = ws.getColumn(c);
    cb(col);
  }
}

export function autofitColumns(ws) {
  // no good way to get text widths
  eachColumnInRange(ws, 1, ws.columnCount, (column) => {
    let maxWidth = 10;
    column.eachCell((cell) => {
      if (!cell.isMerged && cell.value) {
        // doesn't handle merged cells

        let text = "";
        if (typeof cell.value != "object") {
          // string, number, ...
          text = cell.value.toString();
        } else if (cell.value.richText) {
          // richText
          text = cell.value.richText.reduce(
            (text, obj) => text + obj.text.toString(),
            ""
          );
        }

        // handle new lines -> don't forget to set wrapText: true
        let values = text.split(/[\n\r]+/);

        for (let value of values) {
          let width = value.length;

          if (cell.font && cell.font.bold) {
            width *= 1.08; // bolding increases width
          }

          maxWidth = Math.max(maxWidth, width);
        }
      }
    });

    maxWidth += 0.71; // compensate for observed reduction
    maxWidth += 1; // buffer space

    column.width = maxWidth;
  });
}
const colors = [
  "#ce521d",
  "#ca4b89",
  "#006b89",
  "#3e2d7e",
  "#61902c",
  "#faa31a",
  "#6e002a",
  "#4981b3",
  "#980069",
  "#2dacbf",
  "#ee1d25",
  "#9cb46f",
  "#9a869e",
  "#ee008c",
  "#00a895",
  "#7b181a",
  "#ffd63c",
  "#b46638",
  "#bcd634",
  "#f4ea00",
  "#32b6c0",
  "#e8ac1c",
  "#ea2d50",
  "#3c7022",
  "#0085cc",
  "#97C83B",
];
export const getColorPaletteForAttributes = (name, attributes) => {
  if (!name?.length) return null;
  if (!attributes.length) return null;
  const palette = ["match", ["get", "user_" + name]];
  attributes.forEach((a, i) => {
    palette.push(a._id);
    palette.push(colors[i] || "white");
  });
  palette.push("black");
  console.log(palette);
  return palette;
};
