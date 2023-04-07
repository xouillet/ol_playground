import Map from "ol/Map.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import View from "ol/View.js";
import { State } from "ol/render";
import { Projection } from "ol/proj";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic.js";
import Feature from "ol/Feature";
import Select, { SelectEvent } from "ol/interaction/Select.js";
import { Coordinate } from "ol/coordinate";
import { getWidth, getHeight, getBottomLeft } from "ol/extent";
import { Polygon } from "ol/geom";
import Style from "ol/style/Style";

export interface Pose {
  x: number;
  y: number;
  t: number;
}

const _extent = [0, 0, 14.25, 14.25];
const _projection = new Projection({
  code: "Custom",
  units: "m",
  extent: _extent,
});

const _map = new Map({
  target: "map",
  layers: [],
  view: new View({
    projection: _projection,
    center: [7, 7],
    zoom: 2,
    maxZoom: 8,
  }),
});

const background = new ImageLayer({
  source: new Static({
    url: "./map.webp",
    projection: _projection,
    imageExtent: _extent,
  }),
});
_map.addLayer(background);

function rectangle(pose: Pose) {
  const robot_width = 0.426;
  const robot_length = 0.67;
  const polygon = new Polygon([
    [
      [pose.x - robot_width / 2, pose.y - robot_length / 2],
      [pose.x + robot_width / 2, pose.y - robot_length / 2],
      [pose.x + robot_width / 2, pose.y + robot_length / 2],
      [pose.x - robot_width / 2, pose.y + robot_length / 2],
    ],
  ]);

  return polygon;
}

function featureRenderer(
  pixelCoords: Coordinate | Coordinate[] | Coordinate[][],
  state: State,
  selected: boolean
) {
  pixelCoords = pixelCoords as Coordinate[][];

  const context = state.context;
  const geometry = state.geometry.clone() as Polygon;
  geometry.setCoordinates(pixelCoords);
  const extent = geometry.getExtent();
  const width = getWidth(extent);
  const height = getHeight(extent);
  const bottomLeft = getBottomLeft(extent);
  const left = bottomLeft[0];
  const bottom = bottomLeft[1];

  const svgwidth = 426;
  const svgheight = 670;
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgwidth} ${svgheight}" height="${svgheight}px" width="${svgwidth}px">
    <path 
    fill="${selected ? "#800" : "#333"}" 
      stroke="none" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-miterlimit="10" 
      d="M8.529,653.532 L129.262,670.5h164.203l120.733-16.968v-0.016c0,0,6.335,
      0.043,8.764-2.002c2.325-1.959,2.249-7.496,2.249-7.496V28.46
        c0,0,0.527-6.324-1.519-8.753c-1.958-2.326-7.495-2.249-7.495-2.249c0,
        0-120.733-16.958-120.733-16.958H131.261L10.528,17.458
        c0,0-5.086,0.212-7.515,2.258c-2.326,1.959-2.498,8.744-2.498,8.744v615.559c0,
        0-0.297,4.067,1.749,6.496 C4.223,652.84,8.529,653.532,8.529,653.532z
    "/>
    <line x1="30" y1="50" x2="150" y2="30" stroke="white" stroke-width="20" stroke-linecap="round"></line>
    <line x1="276" y1="30" x2="396" y2="45" stroke="white" stroke-width="20" stroke-linecap="round"></line>
    <line x1="30" y1="625" x2="150" y2="640" stroke="red" stroke-width="20" stroke-linecap="round"></line>
    <line x1="276" y1="640" x2="396" y2="625" stroke="red" stroke-width="20" stroke-linecap="round"></line>
    </svg>
    `
  )}`;
  context.drawImage(img, left, bottom, width, height);
}

let pose = { x: 7, y: 6.6, t: 0.5 };
const robotFeature = new Feature(rectangle(pose));
const robotStyle = new Style({
  renderer: (
    pixelCoords: Coordinate | Coordinate[] | Coordinate[][],
    state: State
  ) => featureRenderer(pixelCoords, state, false),
});
const robotStyleSel = new Style({
  renderer: (
    pixelCoords: Coordinate | Coordinate[] | Coordinate[][],
    state: State
  ) => featureRenderer(pixelCoords, state, true),
});
robotFeature.setStyle(robotStyle);

const robot_layer = new VectorLayer({
  source: new VectorSource({ features: [robotFeature] }),
});
_map.addLayer(robot_layer);

const select = new Select({
  style: robotStyleSel,
});
_map.addInteraction(select);
