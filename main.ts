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

const robocc_projection = new Projection({
  code: "Robocc",
  units: "m",
  extent: [-200, -200, 200, 200],
});
const roboccrot_projection = new Projection({
  code: "RoboccRot",
  units: "m",
  extent: [-200, -200, 200, 200],
});

const all = new Map({
  target: "map",
  layers: [],
  view: new View({
    projection: robocc_projection,
    center: [7, 7],
    zoom: 2,
    maxZoom: 8,
  }),
});
const [angle, dx, dy] = [-2.632765769958496,678,1104];
//const [angle, dx, dy] = [0,678,1104];

const [mw,mh] = [773, 709]
const map_extent = [0,0,mw,mh].map(scale);
const map = new ImageLayer({
  source: new Static({
    url: "./current_map-2.webp",
    projection: robocc_projection,
    imageExtent: map_extent,
  }),
});
all.addLayer(map);

const [rw, rh] = [1041, 1539]
const remap_extent = [-dx, mh-rh+dy, rw-dx, mh+dy].map(scale);
const remap = new ImageLayer({
  source: new Static({
    url: "./current_remap-2.webp",
    projection: roboccrot_projection,
    imageExtent: remap_extent,
  }),
  opacity: 0.7,
});
all.addLayer(remap);
all.getView().fit(remap_extent);


addCoordinateTransforms(
  robocc_projection,
  roboccrot_projection,
  (c: Coordinate) => {
    const rotc = [0,mh].map(scale)
    add(c, rotc.map(x=>-x))
    rotate(c, -angle)
    add(c, rotc.map(x=>x))
    return c;
  },
  (c) => {
    return c;
  }
);