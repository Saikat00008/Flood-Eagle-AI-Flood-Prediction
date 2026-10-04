import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Activity, TrendingUp, TrendingDown, Layers, Sparkles } from "lucide-react";
import type { Report } from "@/lib/flood-eagle";
import { clusterDays, detectAnomalies, featureImportance, predictFlood, rainTrend } from "@/lib/flood-insights";

const tip = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 };
const fmt = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const clusterStyle: Record<string, string> = {
  "Dry / Clear": "border-safe/50 bg-safe/10 text-safe",
  Showery: "border-warn/50 bg-warn/10 text-warn",
  "Heavy Rain": "border-danger/50 bg-danger/10 text-danger",
};

export default function FloodInsights({ r }: { r: Report }) {
  const preds = useMemo(() => predictFlood(r.days), [r]);
  const clusters = useMemo(() => clusterDays(r.days), [r]);
  const anomalies = useMemo(() => detectAnomalies(r.days), [r]);
  const trend = useMemo(() => rainTrend(r.days.filter((d) => d.past)), [r]);
  const importance = useMemo(() => featureImportance(), []);

  const upcoming = preds.filter((p) => !p.past);
  const peak = upcoming.length ? upcoming.reduce((a, b) => (b.probability > a.probability ? b : a)) : undefined;
  const compare = r.days.map((d, i) => ({ day: fmt(d.date), "Flood probability %": preds[i]?.probability ?? 0, "Risk score": d.risk }));

  return (
    <section className="rounded-2xl border border-primary/40 bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-primary/15 p-2 text-primary"><Activity className="h-6 w-6" /></span>
          <div>
            <h3 className="font-display text-xl font-bold">Flood Intelligence</h3>
            <p className="text-sm text-muted-foreground">Rainfall patterns, trend insights and flood probability for {r.place.name}</p>
          </div>
        </div>
        <span className="rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-xs text-primary">Live analysis</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric label="Peak flood probability" value={`${peak?.probability ?? 0}%`} sub={peak ? fmt(peak.date) : ""} />
        <Metric label="Rainfall direction" value={trend.slope >= 0 ? "Increasing" : "Decreasing"} sub={`${Math.abs(trend.slope)} mm/day`} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel title="Flood probability and risk" icon={<Activity className="h-4 w-4" />}>
          <ResponsiveContainer>
            <ComposedChart data={compare}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={10} />
              <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={10} />
              <Tooltip contentStyle={tip} />
              <Legend />
              <Bar dataKey="Flood probability %" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              <Line dataKey="Risk score" stroke="var(--chart-3)" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Forecast factors" icon={<Sparkles className="h-4 w-4" />}>
          <ResponsiveContainer>
            <BarChart data={importance} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis type="number" unit="%" stroke="var(--muted-foreground)" fontSize={10} />
              <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={11} width={100} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey="value" name="Influence %" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <h4 className="flex items-center gap-2 font-semibold"><Layers className="h-4 w-4 text-primary" /> Weather pattern groups</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {clusters.map((c) => (
                <span key={c.date} className={`rounded-lg border px-2 py-1 text-xs ${clusterStyle[c.cluster]}`}>
                  {fmt(c.date)} · {c.cluster}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <h4 className="flex items-center gap-2 font-semibold">
              {trend.slope >= 0 ? <TrendingUp className="h-4 w-4 text-warn" /> : <TrendingDown className="h-4 w-4 text-safe" />}
              Rainfall trend (past 7 days)
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Rain is {trend.slope >= 0 ? "increasing" : "decreasing"} by <b className="text-foreground">{Math.abs(trend.slope)} mm/day</b> (R² = {trend.r2}).
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <h4 className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-danger" /> Unusual rainfall alerts</h4>
            {anomalies.length ? (
              <ul className="mt-2 space-y-1 text-sm">
                {anomalies.map((a) => (
                  <li key={a.date}>⚠ <b>{fmt(a.date)}</b> — {a.rain.toFixed(1)} mm of unusually heavy rain</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No unusual rainfall detected in the 14-day window.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <h4 className="mb-2 flex items-center gap-2 font-semibold"><span className="text-primary">{icon}</span>{title}</h4>
      <div className="h-[260px]">{children}</div>
    </div>
  );
}
