// Pixel-art world map: Natural Earth countries rasterized onto a coarse grid of square "pixels".
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';

const COLS = 180; // grid cells across; each cell is one map "pixel"
const ROWS = 80; // latitudes 84°N to 60°S (Antarctica cropped)
const CELL = 5; // drawn size of a cell in canvas pixels
const OVERSAMPLE = 4;

const COLORS = {
  ocean: '#1b2a33',
  oceanDot: '#22343f',
  land: '#8a7556',
  landShade: '#76634a',
  visited: '#e9b65c',
  visitedShade: '#c99a45',
  hover: '#fff1c9',
  border: '#5e4c36',
};

// Your names -> the map's country names. Monaco and Vatican City are too small for this map,
// so they light up their neighbors' pixels (France, Italy), which are visited anyway.
const ALIASES = {
  'United States': 'United States of America',
  England: 'United Kingdom',
  Scotland: 'United Kingdom',
  Wales: 'United Kingdom',
  'Northern Ireland': 'United Kingdom',
  'Czech Republic': 'Czechia',
  Monaco: 'France',
  'Vatican City': 'Italy',
};

let grid = null; // Int16Array of country index per cell, -1 for ocean
let countries = null;

// Rasterize once: draw each country in a unique color on an oversampled canvas, then read cell centers.
function buildGrid() {
  countries = feature(world, world.objects.countries).features;
  const w = COLS * OVERSAMPLE, h = ROWS * OVERSAMPLE;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  // fit longitudes -180..180 and latitudes 84..-60 exactly to the canvas
  const projection = geoEquirectangular().scale(w / (2 * Math.PI)).translate([w / 2, h * (84 / 144)]);
  const path = geoPath(projection, g);
  countries.forEach((f, i) => {
    g.fillStyle = `rgb(${(i + 1) & 255}, ${(i + 1) >> 8}, 0)`;
    g.beginPath();
    path(f);
    g.fill();
  });
  const data = g.getImageData(0, 0, w, h).data;
  grid = new Int16Array(COLS * ROWS).fill(-1);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const px = x * OVERSAMPLE + OVERSAMPLE / 2, py = y * OVERSAMPLE + OVERSAMPLE / 2;
      const o = (py * w + px) * 4;
      if (data[o + 3] < 200) continue; // antialiased edge or ocean
      const id = data[o] + (data[o + 1] << 8) - 1;
      if (id >= 0 && id < countries.length) grid[y * COLS + x] = id;
    }
  }
}

export function drawWorldMap(canvas, visitedNames, onHover) {
  if (!grid) buildGrid();
  const names = new Set(visitedNames.map((n) => ALIASES[n] ?? n));
  const visited = new Set(countries.map((f, i) => (names.has(f.properties.name) ? i : -1)).filter((i) => i >= 0));
  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;
  const g = canvas.getContext('2d');
  let hovered = -1;

  function render() {
    g.fillStyle = COLORS.ocean;
    g.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const id = grid[y * COLS + x];
        if (id < 0) {
          // faint dither on the water
          if ((x + y * 3) % 7 === 0) {
            g.fillStyle = COLORS.oceanDot;
            g.fillRect(x * CELL + 2, y * CELL + 2, 1, 1);
          }
          continue;
        }
        // cells on a border with a different country get the darker shade
        const right = x + 1 < COLS ? grid[y * COLS + x + 1] : id;
        const below = y + 1 < ROWS ? grid[(y + 1) * COLS + x] : id;
        const edge = (right >= 0 && right !== id) || (below >= 0 && below !== id);
        const isVisited = visited.has(id);
        g.fillStyle = id === hovered ? COLORS.hover : isVisited ? (edge ? COLORS.visitedShade : COLORS.visited) : edge ? COLORS.landShade : COLORS.land;
        g.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }
  }

  function cellAt(e) {
    const r = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * COLS);
    const y = Math.floor(((e.clientY - r.top) / r.height) * ROWS);
    return x >= 0 && x < COLS && y >= 0 && y < ROWS ? grid[y * COLS + x] : -1;
  }

  canvas.onpointermove = (e) => {
    const id = cellAt(e);
    if (id === hovered) return;
    hovered = id;
    render();
    onHover(id < 0 ? null : `${countries[id].properties.name}${visited.has(id) ? ' ✓' : ''}`);
  };
  canvas.onpointerleave = () => {
    hovered = -1;
    render();
    onHover(null);
  };
  render();
}
