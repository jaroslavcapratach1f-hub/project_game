/** Accumulated traffic wear: broad irregular vehicle routes and softer pedestrian paths. */
import { DataTexture, SRGBColorSpace, LinearFilter } from 'three';
import { baseTrafficPaths } from '../systems/BaseTrafficPaths.js';
import { plotCells } from '../config/BaseGridConfig.js';
import { DEFENCE } from '../config/DefencePerimeterConfig.js';
import { GROUND_3D as C } from '../config/BaseGround3DConfig.js';
const HALF = 0.5, RGBA = 4;
/** @param {number} level @returns {DataTexture} owned visual overlay */
export function baseTrafficTexture(level) {
  const { cols, rows } = plotCells(level), width = cols + DEFENCE.wallSetback * 2, depth = rows + DEFENCE.wallSetback * 2;
  const size = C.texturePx, pixels = new Uint8Array(size * size * RGBA), segments = trafficSegments(level);
  const wear = new Float32Array(size * size);
  for (const segment of segments) stampRoute(wear, size, width, depth, segment);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const noise = Math.sin(x * C.noiseX + y * C.noiseY) * C.noiseSeed, grain = noise - Math.floor(noise);
    const p = (y * size + x) * RGBA, value = (grain - HALF) * C.wearGrain;
    C.wearColor.forEach((c, i) => { pixels[p + i] = c + value; });
    pixels[p + 3] = wear[y * size + x] * (C.grainOpacity + (1 - C.grainOpacity) * grain);
  }
  const texture = new DataTexture(pixels, size, size); texture.colorSpace = SRGBColorSpace; texture.magFilter = LinearFilter; texture.minFilter = LinearFilter; texture.needsUpdate = true; return texture;
}
/** @private merge shared routes, adding a broad gate-to-interior approach */
function trafficSegments(level) {
  const segments = new Map();
  for (const route of baseTrafficPaths(level)) {
    const points = route.points;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i], key = [a.cx, a.cy, b.cx, b.cy].join(',');
      const dx = b.cx - a.cx, dy = b.cy - a.cy, length2 = dx * dx + dy * dy;
      if (length2 && (!segments.has(key) || route.vehicle)) segments.set(key, { a, dx, dy, length2, vehicle: route.vehicle });
    }
  }
  return [...segments.values()];
}

/** @private Rasterize only the pixels near a route; no full texture scan per segment. */
function stampRoute(wear, size, width, depth, s) {
  const radius = s.vehicle ? C.vehicleWearWidth : C.footWidth, bound = radius * (1 + C.wearVariation);
  const pixel = (v, extent) => (v / extent + HALF) * (size - 1);
  const x0 = Math.max(0, Math.floor(pixel(Math.min(s.a.cx, s.a.cx + s.dx) - bound, width)));
  const x1 = Math.min(size - 1, Math.ceil(pixel(Math.max(s.a.cx, s.a.cx + s.dx) + bound, width)));
  const y0 = Math.max(0, Math.floor(pixel(Math.min(s.a.cy, s.a.cy + s.dy) - bound, depth)));
  const y1 = Math.min(size - 1, Math.ceil(pixel(Math.max(s.a.cy, s.a.cy + s.dy) + bound, depth)));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const cx = (x / (size - 1) - HALF) * width, cy = (y / (size - 1) - HALF) * depth;
    const t = Math.max(0, Math.min(1, ((cx - s.a.cx) * s.dx + (cy - s.a.cy) * s.dy) / s.length2));
    const d = Math.hypot(cx - s.a.cx - s.dx * t, cy - s.a.cy - s.dy * t);
    const cloud = Math.sin(cx * C.wearFrequency + Math.sin(cy)) * Math.sin(cy * C.wearFrequency);
    const fade = Math.max(0, 1 - d / (radius * (1 + cloud * C.wearVariation)));
    const i = y * size + x;
    wear[i] = Math.max(wear[i], fade * (s.vehicle ? C.vehicleWearAlpha : C.footWearAlpha));
  }
}
