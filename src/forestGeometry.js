// Ported from the "숲이 되는 책장" design handoff. The tree/island/sky visuals
// are kept as-is; only the data source is swapped to the app's real books.

export const GENRES = [
  { name: "창작동화·그림책", short: "창작", tree: "이야기 나무", leaf: "#F49AC1", leaf2: "#FBC8DC", dark: "#C9557F", shape: "round", backdrop: "#FCEAF2" },
  { name: "전래·명작·신화", short: "명작", tree: "오래된 나무", leaf: "#A874C9", leaf2: "#C79BDE", dark: "#7E4CA0", shape: "broad", backdrop: "#F2E9FA" },
  { name: "자연관찰", short: "자연", tree: "숲덤불 나무", leaf: "#55AE6E", leaf2: "#7CC98C", dark: "#2F7D4A", shape: "bush", backdrop: "#E8F5EA" },
  { name: "과학·원리", short: "과학", tree: "뾰족 나무", leaf: "#2E9187", leaf2: "#46AFA2", dark: "#1D6B63", shape: "conifer", backdrop: "#E1F1EF" },
  { name: "사물·탈것·기계", short: "사물", tree: "부채 나무", leaf: "#EFBE42", leaf2: "#F7DA84", dark: "#BE8E1C", shape: "fan", backdrop: "#FCF3DC" },
  { name: "수학·사고력", short: "수학", tree: "모양 나무", leaf: "#5B8DE8", leaf2: "#8FB4F2", dark: "#3A66B8", shape: "geo", backdrop: "#E6EEFC" },
  { name: "사회·경제·인물", short: "사회", tree: "단풍 나무", leaf: "#EE8B4C", leaf2: "#F5AE74", dark: "#C0602A", shape: "maple", backdrop: "#FCEDE1" },
  { name: "인성·생활습관·안전", short: "인성", tree: "열매 나무", leaf: "#E2685F", leaf2: "#F0968F", dark: "#B54339", shape: "berry", backdrop: "#FBE8E6" },
];

// tree size by growth level: 1 묘목(sapling), 2 자란나무(grown), 3 큰나무(after a week)
export const LV = [null, { name: "LV1 묘목", tree: "묘목", s: 0.58 }, { name: "LV2 자란 나무", tree: "자란 나무", s: 0.82 }, { name: "큰 나무", tree: "큰 나무", s: 1.0 }];

export const STAGES = [
  { min: 1, name: "씨앗밭", range: "1–4권" },
  { min: 5, name: "작은 숲", range: "5–19권" },
  { min: 20, name: "우거진 숲", range: "20–49권 · 연못" },
  { min: 50, name: "오솔길 숲", range: "50–99권 · 오솔길" },
  { min: 100, name: "숲속 오두막", range: "100–199권 · 오두막" },
  { min: 200, name: "넓은 숲", range: "200–299권" },
  { min: 300, name: "숲의 왕국", range: "300권" },
];

export const SKIES = {
  day: { top: "#BCD9F5", bottom: "#E9F4E4", sun: "#FFE9A8", sunX: 862, sunY: 118, water: "#96C2E8", sand: "#F3E2BB", grass: "#79BE6E", grassLight: "#96D086", stars: 0 },
  sunset: { top: "#F6A9A0", bottom: "#FBE3BE", sun: "#FFD48A", sunX: 178, sunY: 168, water: "#C58FA8", sand: "#EFD3AE", grass: "#5E9E67", grassLight: "#7CB878", stars: 0 },
  night: { top: "#241B58", bottom: "#4A3A9E", sun: "#FFF3D6", sunX: 838, sunY: 108, water: "#3A4E96", sand: "#8B7FA8", grass: "#2E6B4E", grassLight: "#3C8560", stars: 46 },
};

const rnd = (s) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
const circ = (x, y, r) => `M ${(x - r).toFixed(1)} ${y.toFixed(1)} a ${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0 a ${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-2 * r).toFixed(1)} 0`;

export function treeParts(gi, lv, H, opts) {
  opts = opts || {};
  const g = GENRES[gi], p = [];
  const pw = H * 0.30, h1 = H * 0.048, h2 = H * 0.128, th = H * 0.050, tt = H * 0.058;
  const pwc = pw * 1.09, h1c = h1 - H * 0.034, h2c = h2 - H * 0.034, thc = th + H * 0.022;
  const bookH = h1 + tt * 0.55;
  if (opts.shadow && !opts.simple) p.push({ d: `M ${-H * 0.38} 0 a ${H * 0.38} ${H * 0.11} 0 1 0 ${H * 0.76} 0 a ${H * 0.38} ${H * 0.11} 0 1 0 ${-H * 0.76} 0`, fill: "rgba(32,54,34,.16)", dy: 0 });
  p.push({ d: `M 0 ${-h1c} L ${-pwc} ${-h2c} L ${-pwc} ${-h2c + thc} L 0 ${-h1c + thc} L ${pwc} ${-h2c + thc} L ${pwc} ${-h2c} Z`, fill: g.dark, dy: 0 });
  if (!opts.simple) p.push({ d: `M 0 ${-h1} L ${-pw} ${-h2} L ${-pw} ${-h2 + th} L 0 ${-h1 + th} L ${pw} ${-h2 + th} L ${pw} ${-h2} Z`, fill: "#E8D9B6", dy: 0 });
  p.push({ d: `M 0 ${-h1} L ${-pw} ${-h2} L ${-pw * 0.95} ${-h2 - tt} L 0 ${-h1 - tt} L ${pw * 0.95} ${-h2 - tt} L ${pw} ${-h2} Z`, fill: "#FFFBEF", dy: 0 });
  if (!opts.simple) p.push({ d: `M 0 ${-h1} L ${pw} ${-h2} L ${pw * 0.95} ${-h2 - tt} L 0 ${-h1 - tt} Z`, fill: "#F6EBD4", dy: 0 });
  const T = [];
  if (lv === 1) {
    T.push({ d: `M ${-H * 0.035} 0 L ${-H * 0.028} ${-H * 0.5} L ${H * 0.028} ${-H * 0.5} L ${H * 0.035} 0 Z`, fill: "#8FA86A" });
    T.push({ d: `M 0 ${-H * 0.44} C ${-H * 0.32} ${-H * 0.50} ${-H * 0.32} ${-H * 0.76} 0 ${-H * 0.68} Z`, fill: g.leaf });
    T.push({ d: `M 0 ${-H * 0.50} C ${H * 0.32} ${-H * 0.56} ${H * 0.32} ${-H * 0.82} 0 ${-H * 0.74} Z`, fill: g.leaf2 });
  } else {
    const thick = g.shape === "broad";
    const tw = thick ? 0.085 : 0.055, tw2 = thick ? 0.058 : 0.038, ttop = thick ? 0.34 : 0.42;
    T.push({ d: `M ${-H * tw} 0 L ${-H * tw2} ${-H * ttop} L ${H * tw2} ${-H * ttop} L ${H * tw} 0 Z`, fill: thick ? "#7A5A44" : "#8A6A50" });
    if (g.shape === "round") {
      T.push({ d: circ(0, -H * 0.66, H * 0.31), fill: g.leaf });
      T.push({ d: circ(-H * 0.19, -H * 0.50, H * 0.20), fill: g.leaf });
      T.push({ d: circ(H * 0.16, -H * 0.78, H * 0.17), fill: g.leaf2 });
    } else if (g.shape === "broad") {
      T.push({ d: `M ${-H * 0.46} ${-H * 0.54} Q 0 ${-H * 1.00} ${H * 0.46} ${-H * 0.54} Q 0 ${-H * 0.30} ${-H * 0.46} ${-H * 0.54} Z`, fill: g.leaf });
      T.push({ d: circ(-H * 0.04, -H * 0.74, H * 0.21), fill: g.leaf2 });
    } else if (g.shape === "bush") {
      T.push({ d: circ(-H * 0.21, -H * 0.44, H * 0.22), fill: g.leaf });
      T.push({ d: circ(H * 0.21, -H * 0.42, H * 0.20), fill: g.leaf });
      T.push({ d: circ(0, -H * 0.62, H * 0.26), fill: g.leaf2 });
    } else if (g.shape === "conifer") {
      T.push({ d: `M 0 ${-H * 0.70} L ${H * 0.36} ${-H * 0.10} L ${-H * 0.36} ${-H * 0.10} Z`, fill: g.leaf });
      T.push({ d: `M 0 ${-H} L ${H * 0.27} ${-H * 0.46} L ${-H * 0.27} ${-H * 0.46} Z`, fill: g.leaf2 });
    } else if (g.shape === "fan") {
      T.push({ d: `M ${-H * 0.34} ${-H * 0.54} Q 0 ${-H * 1.02} ${H * 0.34} ${-H * 0.54} Q 0 ${-H * 0.38} ${-H * 0.34} ${-H * 0.54} Z`, fill: g.leaf });
      T.push({ d: `M ${-H * 0.18} ${-H * 0.58} Q 0 ${-H * 0.90} ${H * 0.18} ${-H * 0.58} Q 0 ${-H * 0.48} ${-H * 0.18} ${-H * 0.58} Z`, fill: g.leaf2 });
    } else if (g.shape === "geo") {
      T.push({ d: `M 0 ${-H * 0.38} L ${H * 0.31} ${-H * 0.60} L 0 ${-H * 0.82} L ${-H * 0.31} ${-H * 0.60} Z`, fill: g.leaf });
      T.push({ d: `M 0 ${-H * 0.72} L ${H * 0.19} ${-H * 0.89} L 0 ${-H * 1.06} L ${-H * 0.19} ${-H * 0.89} Z`, fill: g.leaf2 });
    } else if (g.shape === "berry") {
      T.push({ d: circ(0, -H * 0.66, H * 0.32), fill: g.leaf });
      T.push({ d: circ(-H * 0.15, -H * 0.80, H * 0.16), fill: g.leaf2 });
      T.push({ d: circ(-H * 0.17, -H * 0.60, H * 0.055), fill: "#FFF3D6" });
      T.push({ d: circ(H * 0.15, -H * 0.70, H * 0.050), fill: "#FFF3D6" });
      T.push({ d: circ(H * 0.02, -H * 0.50, H * 0.048), fill: "#FFF3D6" });
    } else {
      T.push({ d: circ(0, -H * 0.64, H * 0.30), fill: g.leaf });
      T.push({ d: circ(-H * 0.23, -H * 0.48, H * 0.18), fill: g.leaf2 });
      T.push({ d: circ(H * 0.21, -H * 0.74, H * 0.16), fill: g.leaf2 });
    }
  }
  if (opts.big) {
    T.push({ d: circ(-H * 0.34, -H * 0.90, H * 0.030), fill: "rgba(255,255,255,.72)" });
    T.push({ d: circ(H * 0.30, -H * 0.99, H * 0.042), fill: "rgba(255,255,255,.62)" });
    T.push({ d: circ(H * 0.02, -H * 1.10, H * 0.055), fill: "rgba(255,255,255,.5)" });
  }
  T.forEach((t) => p.push({ d: t.d, fill: t.fill, dy: -bookH }));
  return p;
}

export function place(parts, base, keyPrefix) {
  return parts.map((p, k) => ({ d: p.d, fill: p.fill, t: `${base} translate(0 ${p.dy.toFixed(2)})`, key: keyPrefix + k }));
}

// Position the app's real book-trees on the island (radial layout from the
// design, but genre/level come from the actual completed books).
export function layoutForest(trees, seed = 1) {
  const n = trees.length;
  const R = 150 + 280 * Math.min(1, Math.sqrt(n / 120));
  const ry = R * 0.47, cx = 500, cy = 470;
  const base = n === 0 ? 1 : Math.min(1.35, Math.max(0.16, (1.9 * R) / (100 * Math.sqrt(n + 2))));
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = trees[i];
    const a = i * 2.39996 + seed * 1.7;
    const rr = Math.sqrt((i + 0.55) / n) * (0.94 + (rnd(i + seed * 13) - 0.5) * 0.09);
    const x = cx + Math.cos(a) * rr * R * 0.95;
    const y = cy + Math.sin(a) * rr * ry * 0.95;
    const dz = 0.80 + 0.34 * ((y - (cy - ry)) / (2 * ry));
    out.push({ ...t, i, x, y, s: base * dz * LV[t.lv].s, H: 78 });
  }
  out.sort((a, b) => a.y - b.y);
  return { list: out, R, ry, cx, cy, n };
}

export const stageFor = (n) => STAGES.slice().reverse().find((s) => n >= s.min) || STAGES[0];
export const nextStageFor = (n) => STAGES.find((s) => s.min > n) || null;
export const starField = (count) => {
  const stars = [];
  for (let i = 0; i < count; i++) stars.push({ cx: rnd(i * 3.1) * 1000, cy: rnd(i * 7.7) * 300, r: 1 + rnd(i * 5.3) * 1.8, o: 0.4 + rnd(i * 11.1) * 0.6, key: "s" + i });
  return stars;
};
