export type Place = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  admin2?: string;
};

export type Day = {
  date: string;
  tmax: number;
  tmin: number;
  rain: number;
  rainProb: number;
  wind: number;
  gust: number;
  discharge: number | null;
  risk: number; // 0-100
  past: boolean;
};

export type Report = {
  place: Place;
  current: { temp: number; humidity: number; wind: number; rain: number; code: number };
  days: Day[];
  maxRisk: number;
  level: "none" | "low" | "moderate" | "high" | "severe";
  floodDays: number;
};

export function placeLabel(p: Place) {
  return [p.name, p.admin2, p.admin1, p.country].filter(Boolean).join(", ");
}

export async function searchPlaces(q: string): Promise<Place[]> {
  if (q.trim().length < 2) return [];
  const r = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=20&language=en&format=json&countryCode=IN`,
  );
  if (!r.ok) throw new Error("Place search unavailable");
  const j = await r.json();
  return ((j.results ?? []) as Place[]).filter((p) => !p.country || p.country === "India");
}

export async function getReport(place: Place): Promise<Report> {
  const { latitude: la, longitude: lo } = place;
  const [w, f] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&timezone=auto&past_days=7&forecast_days=7`,
    ).then((r) => { if (!r.ok) throw new Error("Weather unavailable"); return r.json(); }),
    fetch(
      `https://flood-api.open-meteo.com/v1/flood?latitude=${la}&longitude=${lo}&daily=river_discharge,river_discharge_mean,river_discharge_max&past_days=7&forecast_days=7`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);

  if (!w.current || !w.daily?.time?.length || !w.current.time) throw new Error("Incomplete weather report");
  const d = w.daily;
  const floodByDate = new Map<string, { discharge: number | null; mean: number | null }>(
    (f?.daily?.time ?? []).map((date: string, i: number) => [date, {
      discharge: f.daily.river_discharge?.[i] ?? null,
      mean: f.daily.river_discharge_mean?.[i] ?? null,
    }]),
  );

  // The API's current time and daily dates share the location's timezone.
  const today = w.current.time.slice(0, 10);
  const days: Day[] = d.time.map((date: string, i: number) => {
    const rain = d.precipitation_sum[i] ?? 0;
    const rain3 = rain + (d.precipitation_sum[i - 1] ?? 0) + (d.precipitation_sum[i - 2] ?? 0);
    const q = floodByDate.get(date)?.discharge ?? null;
    const qm = floodByDate.get(date)?.mean ?? null;
    let risk = Math.min(45, rain * 0.6) + Math.min(35, Math.max(0, rain3 - 40) * 0.35);
    if (q != null && qm && qm > 0) risk += Math.min(30, Math.max(0, q / qm - 1.3) * 20);
    if ((d.wind_gusts_10m_max[i] ?? 0) > 70) risk += 10;
    return {
      date,
      tmax: d.temperature_2m_max[i],
      tmin: d.temperature_2m_min[i],
      rain,
      rainProb: d.precipitation_probability_max[i] ?? 0,
      wind: d.wind_speed_10m_max[i],
      gust: d.wind_gusts_10m_max[i],
      discharge: q,
      risk: Math.round(Math.min(100, risk)),
      past: date < today,
    };
  });

  const next = days.filter((x) => !x.past);
  const maxRisk = Math.max(0, ...next.map((x) => x.risk));
  const level =
    maxRisk >= 75 ? "severe" : maxRisk >= 55 ? "high" : maxRisk >= 35 ? "moderate" : maxRisk >= 20 ? "low" : "none";
  const c = w.current;
  return {
    place,
    current: {
      temp: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      wind: c.wind_speed_10m,
      rain: c.precipitation,
      code: c.weather_code,
    },
    days,
    maxRisk,
    level,
    floodDays: next.filter((x) => x.risk >= 35).length,
  };
}

export function weatherText(code: number) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Conditions unavailable";
}

export const advice: Record<Report["level"], string[]> = {
  none: [],
  low: [
    "Clear drains and gutters around your home.",
    "Keep an eye on local news and weather alerts.",
    "Keep phone charged and an emergency kit ready.",
  ],
  moderate: [
    "Move valuables, documents and electronics to higher shelves.",
    "Stock 3 days of drinking water, dry food and medicines.",
    "Avoid walking or driving through flooded roads.",
    "Identify the nearest school, community hall or raised building as a shelter.",
  ],
  high: [
    "Prepare to evacuate — pack documents, cash, medicines, torch and power bank.",
    "Switch off electricity and gas at the main if water enters your home.",
    "Move to upper floors or the nearest relief shelter early.",
    "Never cross moving water — 15 cm can knock a person down.",
    "Call the disaster helpline: 112 (India) / NDRF 011-24363260.",
  ],
  severe: [
    "EVACUATE NOW to a designated relief shelter or high ground.",
    "Follow instructions from local authorities and NDRF teams.",
    "Help elderly people, children and animals move first.",
    "Boil or purify drinking water; avoid floodwater contact.",
    "Emergency: 112 • Disaster helpline: 1078",
  ],
};
