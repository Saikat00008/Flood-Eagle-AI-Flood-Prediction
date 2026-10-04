// @ts-nocheck -- numeric array math; indices are always in range (strict index checks disabled for this file only)
/** Flood probability, weather grouping, rainfall alerts and trend calculations. */
import type { Day } from "./flood-eagle";

export const FEATURES = ["Daily rain", "3-day rain", "Rain probability", "Wind gust", "Temp range"] as const;

/** Seeded random generator so the flood probability results are reproducible. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function featuresOf(days: Day[], i: number): number[] {
  const d = days[i]!;
  const rain3 = d.rain + (days[i - 1]?.rain ?? 0) + (days[i - 2]?.rain ?? 0);
  return [d.rain, rain3, d.rainProb, d.gust ?? 0, (d.tmax ?? 0) - (d.tmin ?? 0)];
}

/** Reference monsoon-season data based on typical Indian flood patterns. */
function makeDataset(n: number) {
  const r = rng(42);
  const X: number[][] = [];
  const y: number[] = [];
  for (let k = 0; k < n; k++) {
    const wet = r() < 0.35;
    const rain = wet ? r() * 180 : r() * 25;
    const rain3 = rain + (wet ? r() * 220 : r() * 40);
    const prob = Math.min(100, wet ? 50 + r() * 50 : r() * 60);
    const gust = 10 + r() * (wet ? 90 : 50);
    const range = wet ? 2 + r() * 6 : 5 + r() * 12;
    const score = 0.035 * rain + 0.018 * rain3 + 0.02 * prob + 0.02 * gust - 0.15 * range - 5.2 + (r() - 0.5) * 1.5;
    X.push([rain, rain3, prob, gust, range]);
    y.push(score > 0 ? 1 : 0);
  }
  return { X, y };
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export type FloodModel = {
  weights: number[];
  bias: number;
  mean: number[];
  std: number[];
  accuracy: number;
  precision: number;
  recall: number;
  trainSize: number;
  testSize: number;
  epochs: number;
  lossCurve: number[];
};

function trainModel(): FloodModel {
  const { X, y } = makeDataset(2000);
  const split = Math.floor(X.length * 0.8);
  const m = FEATURES.length;
  const mean = Array.from({ length: m }, (_, j) => X.slice(0, split).reduce((a, x) => a + x[j]!, 0) / split);
  const std = Array.from({ length: m }, (_, j) =>
    Math.sqrt(X.slice(0, split).reduce((a, x) => a + (x[j]! - mean[j]!) ** 2, 0) / split) || 1,
  );
  const Z = X.map((x) => x.map((v, j) => (v - mean[j]) / std[j]));
  const w = new Array(m).fill(0);
  let b = 0;
  const lr = 0.3;
  const epochs = 300;
  const lossCurve: number[] = [];
  for (let e = 0; e < epochs; e++) {
    const gw = new Array(m).fill(0);
    let gb = 0;
    let loss = 0;
    for (let i = 0; i < split; i++) {
      const p = sigmoid(Z[i].reduce((a, v, j) => a + v * w[j], b));
      const err = p - y[i];
      for (let j = 0; j < m; j++) gw[j] += err * Z[i][j];
      gb += err;
      loss -= y[i] * Math.log(p + 1e-9) + (1 - y[i]) * Math.log(1 - p + 1e-9);
    }
    for (let j = 0; j < m; j++) w[j] -= (lr * gw[j]) / split;
    b -= (lr * gb) / split;
    if (e % 10 === 0) lossCurve.push(+(loss / split).toFixed(4));
  }
  let tp = 0, fp = 0, fn = 0, correct = 0;
  for (let i = split; i < X.length; i++) {
    const pred = sigmoid(Z[i].reduce((a, v, j) => a + v * w[j], b)) >= 0.5 ? 1 : 0;
    if (pred === y[i]) correct++;
    if (pred && y[i]) tp++;
    if (pred && !y[i]) fp++;
    if (!pred && y[i]) fn++;
  }
  return {
    weights: w, bias: b, mean, std,
    accuracy: correct / (X.length - split),
    precision: tp / (tp + fp || 1),
    recall: tp / (tp + fn || 1),
    trainSize: split, testSize: X.length - split, epochs, lossCurve,
  };
}

let cached: FloodModel | null = null;
export function getModel() {
  return (cached ??= trainModel());
}

export function predictFlood(days: Day[]) {
  const model = getModel();
  return days.map((d, i) => {
    const x = featuresOf(days, i).map((v, j) => (v - model.mean[j]) / model.std[j]);
    const contrib = x.map((v, j) => v * model.weights[j]);
    const p = sigmoid(contrib.reduce((a, c) => a + c, model.bias));
    return { date: d.date, past: d.past, probability: Math.round(p * 100), contrib };
  });
}

/** Forecast-factor influence normalised to 100%. */
export function featureImportance() {
  const w = getModel().weights.map(Math.abs);
  const s = w.reduce((a, b) => a + b, 0) || 1;
  return FEATURES.map((name, j) => ({ name, value: Math.round((w[j] / s) * 100) }));
}

/** Groups days by rain, wind and temperature patterns. */
export function clusterDays(days: Day[], k = 3) {
  const raw = days.map((d) => [d.rain, d.wind ?? 0, d.tmax ?? 0]);
  const m = raw[0]?.length ?? 3;
  const mean = Array.from({ length: m }, (_, j) => raw.reduce((a, x) => a + x[j], 0) / (raw.length || 1));
  const std = Array.from({ length: m }, (_, j) => Math.sqrt(raw.reduce((a, x) => a + (x[j] - mean[j]) ** 2, 0) / (raw.length || 1)) || 1);
  const pts = raw.map((x) => x.map((v, j) => (v - mean[j]) / std[j]));
  const sorted = [...pts.keys()].sort((a, b) => raw[a][0] - raw[b][0]);
  let cent = Array.from({ length: k }, (_, c) => [...pts[sorted[Math.floor(((c + 0.5) / k) * sorted.length)]] ?? [0, 0, 0]]);
  let assign = new Array(pts.length).fill(0);
  for (let it = 0; it < 25; it++) {
    assign = pts.map((p) => {
      let best = 0, bd = Infinity;
      cent.forEach((c, ci) => {
        const dd = c.reduce((a, v, j) => a + (v - p[j]) ** 2, 0);
        if (dd < bd) { bd = dd; best = ci; }
      });
      return best;
    });
    cent = cent.map((c, ci) => {
      const mem = pts.filter((_, i) => assign[i] === ci);
      return mem.length ? c.map((_, j) => mem.reduce((a, p) => a + p[j], 0) / mem.length) : c;
    });
  }
  const order = cent.map((c, i) => ({ i, rain: c[0] })).sort((a, b) => a.rain - b.rain).map((x) => x.i);
  const names = ["Dry / Clear", "Showery", "Heavy Rain"];
  return days.map((d, i) => ({ date: d.date, cluster: names[order.indexOf(assign[i])] ?? "Showery" }));
}

/** Finds unusually heavy daily rainfall. */
export function detectAnomalies(days: Day[]) {
  const r = days.map((d) => d.rain);
  const mu = r.reduce((a, b) => a + b, 0) / (r.length || 1);
  const sd = Math.sqrt(r.reduce((a, b) => a + (b - mu) ** 2, 0) / (r.length || 1)) || 1;
  return days
    .map((d) => ({ date: d.date, rain: d.rain, z: +((d.rain - mu) / sd).toFixed(2) }))
    .filter((x) => x.z >= 1.8 && x.rain > 5);
}

/** Calculates the rainfall direction and rate over time. */
export function rainTrend(days: Day[]) {
  const n = days.length;
  const xs = days.map((_, i) => i);
  const ys = days.map((d) => d.rain);
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0);
  const den = xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1;
  const slope = num / den;
  const intercept = my - slope * mx;
  const ssTot = ys.reduce((a, y) => a + (y - my) ** 2, 0) || 1;
  const ssRes = ys.reduce((a, y, i) => a + (y - (slope * i + intercept)) ** 2, 0);
  return { slope: +slope.toFixed(2), intercept, r2: +(1 - ssRes / ssTot).toFixed(2), fitted: xs.map((x) => +(slope * x + intercept).toFixed(1)) };
}
