import Map from "ol/Map.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import View from "ol/View.js";
import { State } from "ol/render";
import { addCoordinateTransforms, addProjection, Projection } from "ol/proj";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic.js";
import Feature from "ol/Feature";
import Select, { SelectEvent } from "ol/interaction/Select.js";
import { add, Coordinate, rotate } from "ol/coordinate";
import { getWidth, getHeight, getBottomLeft, getCenter } from "ol/extent";
import { Polygon } from "ol/geom";
import Style from "ol/style/Style";

export interface Pose {
  x: number;
  y: number;
  t: number;
}

const scale = (x: number) => (x * 5) / 100;

const map_projection = new Projection({
  code: "Robocc",
  units: "m",
  extent: [-200, -200, 200, 200],
});
addProjection(map_projection);

const all = new Map({
  target: "map",
  layers: [],
  view: new View({
    projection: map_projection,
    center: [7, 7],
    zoom: 2,
    maxZoom: 8,
  }),
});

const map_extent = [0, 0, 773, 709].map(scale);
const map = new ImageLayer({
  source: new Static({
    url: "./current_map-2.webp",
    projection: map_projection,
    imageExtent: map_extent,
  }),
});
all.addLayer(map);

const [angle, dx, dy] = [-2.632765769958496, 678, 1104];

const remap_extent = [0, 0, 1041, 1539].map(scale);
const remap_projection = new Projection({
  code: "RoboccRemap",
  units: "m",
  extent: remap_extent,
});
addCoordinateTransforms(
  "Robocc",
  remap_projection,
  (c: Coordinate) => {
    add(
      c,
      getCenter(remap_extent).map((x) => -x)
    );
    rotate(c, -angle
    );
    add(
      c,
      getCenter(remap_extent).map((x) => x)
    );
    add(c, [scale(dx), scale(dy)])
    return c;
  },
  (c) => c
);

const remap = new ImageLayer({
  source: new Static({
    url: "./current_remap-2.webp",
    projection: remap_projection,
    imageExtent: remap_extent,
  }),
  opacity: 0.7,
});
all.addLayer(remap);
all.getView().fit(remap_extent);
