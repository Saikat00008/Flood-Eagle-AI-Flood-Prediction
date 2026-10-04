import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import {
  Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { CalendarDays, History, CalendarClock, Search, MapPin, Droplets, Wind, CloudRain, ShieldCheck, AlertTriangle, Loader2, X } from "lucide-react";
import { advice, getReport, placeLabel, searchPlaces, weatherText, type Place, type Report } from "@/lib/flood-eagle";

import FloodNews from "@/components/FloodNews";
import FloodSafety from "@/components/FloodSafety";
import FloodInsights from "@/components/FloodInsights";

const FloodMap = lazy(() => import("@/components/FloodMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flood Eagle — Live Flood Risk & Weather for Any Place" },
      { name: "description", content: "Search any Indian village, town or city to see live weather, past 7 days, next 7 days flood risk, a zoomable map and safety advice." },
      { property: "og:title", content: "Flood Eagle — Live Flood Risk & Weather" },
      { property: "og:description", content: "7-day flood prediction, rainfall and wind forecasts with safety advice for any location." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const KALYANI: Place = { id: 1268561, name: "Kalyani", latitude: 22.975, longitude: 88.4345, admin2: "Nadia", admin1: "West Bengal", country: "India" };

const levelStyle: Record<Report["level"], string> = {
  none: "border-safe/50 bg-safe/10 text-safe",
  low: "border-safe/50 bg-safe/10 text-safe",
  moderate: "border-warn/50 bg-warn/10 text-warn",
  high: "border-danger/50 bg-danger/10 text-danger",
  severe: "border-danger bg-danger/20 text-danger",
};

function Index() {
  const [q, setQ] = useState("");
  const [sugs, setSugs] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [active, setActive] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const t = setTimeout(() => searchPlaces(q).then(setSugs).catch(() => setSugs([])), 250);
    return () => clearTimeout(t);
  }, [q]);

  async function pick(p: Place) {
    setOpen(false);
    setQ(placeLabel(p));
    setLoading(true);
    setErr("");
    try {
      const r = await getReport(p);
      setReports((prev) => [r, ...prev.filter((x) => x.place.id !== p.id)]);
      setActive(p.id);
    } catch {
      setErr("Could not load forecast for this place. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { pick(KALYANI); setQ(""); }, []);

  const r = reports.find((x) => x.place.id === active);
  const chart = (r?.days ?? []).map((d) => ({
    day: (d.past ? "" : "▸ ") + new Date(`${d.date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    Rain: d.rain, "Flood risk": d.risk, Wind: d.wind,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="hero-glow">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-8 lg:grid-cols-[1fr_340px]">
          <div>
          <div className="flex items-center gap-2 font-display text-xl font-bold">
            <Droplets className="text-primary" /> Flood Eagle
          </div>
          <h1 className="mt-10 max-w-2xl font-display text-4xl font-bold leading-tight md:text-5xl">
            Know the flood <span className="text-primary">before</span> it reaches your door.
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Search any village, town or city across every district of India for the last 7 days of weather, a 7‑day flood forecast and what to do to stay safe.
          </p>

          <div className="relative mt-6 max-w-xl">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder="Search Indian village, town or city, e.g. Kalyani, Haringhata…"
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              />
              {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>
            {open && sugs.length > 0 && (
              <ul className="absolute z-[1000] mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-2xl">
                {sugs.map((s) => (
                  <li key={s.id}>
                    <button onClick={() => pick(s)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-accent">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        <span className="font-semibold">{s.name}</span>
                        <span className="block text-sm text-muted-foreground">{[s.admin2, s.admin1, s.country].filter(Boolean).join(", ")}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {err && <p className="mt-3 text-danger">{err}</p>}

          {reports.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {reports.map((x) => (
                <span key={x.place.id} className={`flex items-center gap-1 rounded-full border px-3 py-1 text-sm ${x.place.id === active ? "border-primary bg-primary/15" : "border-border bg-card"}`}>
                  <button onClick={() => setActive(x.place.id)}>{x.place.name}</button>
                  <button aria-label="Remove" onClick={() => setReports((p) => p.filter((y) => y.place.id !== x.place.id))}>
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </span>
              ))}
            </div>
          )}
          </div>
          <NowPanel r={r} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 pb-16">
        {!r ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> Loading forecast…</div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-6 md:col-span-2">
                <p className="text-sm text-muted-foreground">Now in</p>
                <h2 className="font-display text-2xl font-bold">{placeLabel(r.place)}</h2>
                <div className="mt-4 flex items-end gap-4">
                  <span className="font-display text-6xl font-bold">{Math.round(r.current.temp)}°</span>
                  <span className="pb-2 text-lg text-muted-foreground">{weatherText(r.current.code)}</span>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                  <Stat icon={<Droplets />} label="Humidity" value={`${r.current.humidity}%`} />
                  <Stat icon={<Wind />} label="Wind" value={`${r.current.wind} km/h`} />
                  <Stat icon={<CloudRain />} label="Recent rain (15 min)" value={`${r.current.rain} mm`} />
                </div>
              </div>
              <div className={`rounded-2xl border p-6 ${levelStyle[r.level]}`}>
                {r.level === "none" ? <ShieldCheck className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
                <p className="mt-3 text-sm uppercase tracking-wider">Flood risk (next 7 days)</p>
                <p className="font-display text-3xl font-bold">{r.level === "none" ? "No flood expected" : r.level.toUpperCase()}</p>
                <p className="mt-2 text-sm text-foreground/80">
                  {r.level === "none"
                    ? "No flooding is predicted here. Showing the regular weather report only."
                    : `Risk score ${r.maxRisk}/100 • ${r.floodDays} day(s) of elevated flood risk.`}
                </p>
              </div>
            </section>

            {r.level !== "none" && (
              <section className={`rounded-2xl border p-6 ${levelStyle[r.level]}`}>
                <h3 className="font-display text-xl font-bold">How to stay safe</h3>
                <ul className="mt-3 grid gap-2 text-foreground md:grid-cols-2">
                  {advice[r.level].map((a) => <li key={a} className="flex gap-2"><span>•</span>{a}</li>)}
                </ul>
                <p className="mt-4 text-sm text-foreground/80">
                  Peak risk day: <b>{new Date(`${r.days.filter((d) => !d.past).reduce((a, b) => (b.risk > a.risk ? b : a)).date}T12:00:00`).toDateString()}</b>.
                  Nearest safe places: schools, community halls, cyclone shelters or any multi‑storey building on raised ground.
                </p>
              </section>
            )}

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="mb-3 font-display font-bold">Map of your searched places</h3>
                <ClientOnly fallback={<div className="h-[420px] animate-pulse rounded-lg bg-muted" />}>
                  <Suspense fallback={<div className="h-[420px] animate-pulse rounded-lg bg-muted" />}>
                    <FloodMap reports={reports} activeId={active} />
                  </Suspense>
                </ClientOnly>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="mb-3 font-display font-bold">Day‑wise: past 7 days → next 7 days (▸)</h3>
                <div className="h-[420px]">
                  <ResponsiveContainer>
                    <ComposedChart data={chart}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                      <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                      <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                      <Legend />
                      <Bar dataKey="Rain" name="Rain (mm)" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                      <Line dataKey="Wind" name="Wind (km/h)" stroke="var(--chart-2)" dot={false} strokeWidth={2} />
                      <Line dataKey="Flood risk" name="Flood risk (0‑100)" stroke="var(--chart-3)" strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <FloodInsights r={r} />

            <section className="grid gap-4 lg:grid-cols-2">
              <DayList title="Previous 7 days" sub="What already happened" icon={<History className="h-5 w-5" />} days={r.days.filter((d) => d.past)} />
              <DayList title="Upcoming 7 days" sub="Forecast & flood risk" icon={<CalendarClock className="h-5 w-5" />} days={r.days.filter((d) => !d.past)} highlight />
            </section>
          </>
        )}
        <FloodNews />
        <FloodSafety />
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <div className="flex items-center gap-1 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">{icon}{label}</div>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function DayList({ title, sub, icon, days, highlight }: { title: string; sub: string; icon: React.ReactNode; days: Report["days"]; highlight?: boolean }) {
  const total = days.reduce((a, d) => a + d.rain, 0);
  const risky = days.filter((d) => d.risk >= 35);
  return (
    <div className={`rounded-2xl border bg-card p-5 ${highlight ? "border-primary/50" : "border-border"}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-primary/15 p-2 text-primary">{icon}</span>
          <div><h3 className="font-display text-lg font-bold">{title}</h3><p className="text-xs text-muted-foreground">{sub}</p></div>
        </div>
        <p className="text-right text-sm text-muted-foreground">Total rain<br /><b className="text-foreground">{total.toFixed(1)} mm</b></p>
      </div>
      <div className="mt-4 space-y-2">
        {days.map((d) => (
          <div key={d.date} className={`grid grid-cols-[90px_1fr_auto] items-center gap-3 rounded-xl border px-3 py-2 text-sm ${d.risk >= 35 ? levelStyle[d.risk >= 55 ? "high" : "moderate"] : "border-border bg-muted/40"}`}>
            <span className="font-semibold text-foreground">{new Date(`${d.date}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
            <span className="flex flex-wrap gap-x-3 text-muted-foreground">
              <span className="text-foreground">{Math.round(d.tmax)}°/{Math.round(d.tmin)}°</span>
              <span>🌧 {d.rain.toFixed(1)} mm</span>
              <span>💨 {Math.round(d.wind)} km/h</span>
            </span>
            <span className="text-xs font-semibold text-foreground">{d.risk >= 35 ? `⚠ Risk ${d.risk}` : `Risk ${d.risk}`}</span>
          </div>
        ))}
      </div>
      {highlight && (
        <p className={`mt-4 rounded-xl p-3 text-sm ${risky.length ? levelStyle.high : levelStyle.none}`}>
          {risky.length
            ? `⚠ Flood risk on ${risky.length} day(s). Stay alert: keep documents & medicines packed, avoid flooded roads, and move to a school, community hall or raised building if water rises. Emergency: 112 / 1078.`
            : "✓ No flood expected this week. Only the regular weather report is shown."}
        </p>
      )}
    </div>
  );
}

function NowPanel({ r }: { r: Report | undefined }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <aside className="self-start rounded-2xl border border-primary/30 bg-card/80 p-6 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary" /> Today</div>
      <p className="mt-1 font-display text-xl font-bold">{now ? now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"}</p>
      <p className="font-display text-3xl font-bold text-primary">{now ? now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--"}</p>
      <div className="my-4 h-px bg-border" />
      {r ? (
        <>
          <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{r.place.name}{r.place.admin1 ? `, ${r.place.admin1}` : ""}</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="font-display text-5xl font-bold">{Math.round(r.current.temp)}°C</span>
            <span className="pb-1 text-muted-foreground">{weatherText(r.current.code)}</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-muted p-2"><Droplets className="mx-auto h-4 w-4 text-primary" />{r.current.humidity}%</div>
            <div className="rounded-lg bg-muted p-2"><Wind className="mx-auto h-4 w-4 text-primary" />{r.current.wind} km/h</div>
            <div className="rounded-lg bg-muted p-2"><CloudRain className="mx-auto h-4 w-4 text-primary" />{r.current.rain} mm</div>
          </div>
        </>
      ) : (
        <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading weather…</p>
      )}
    </aside>
  );
}
