import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Report } from "@/lib/flood-eagle";
import { placeLabel } from "@/lib/flood-eagle";

const colors = { none: "#3ecf8e", low: "#9be15d", moderate: "#f5b83d", high: "#f2711c", severe: "#e5383b" };

export default function FloodMap({ reports, activeId }: { reports: Report[]; activeId?: number | undefined }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { zoomControl: true }).setView([22.97, 88.43], 5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    // Live rain radar overlay (RainViewer, free, no key)
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((r) => r.json())
      .then((d) => {
        const last = d?.radar?.past?.at(-1);
        if (!last || !map.current) return;
        L.tileLayer(`${d.host}${last.path}/256/{z}/{x}/{y}/4/1_1.png`, { opacity: 0.6, maxNativeZoom: 7, maxZoom: 19, attribution: "Radar &copy; RainViewer" }).addTo(map.current);
      })
      .catch(() => {});
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !layer.current) return;
    layer.current.clearLayers();
    reports.forEach((r) => {
      const c = colors[r.level];
      const ll: [number, number] = [r.place.latitude, r.place.longitude];
      L.circle(ll, { radius: 4000 + r.maxRisk * 300, color: c, fillColor: c, fillOpacity: 0.25, weight: 1 }).addTo(layer.current!);
      // A daily total includes rain forecast for later today, not rain happening now.
      const rainy = r.current.rain > 0 || [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(r.current.code);
      if (rainy) {
        const drops = Array.from({ length: 14 }, (_, i) => `<i style="left:${(i * 7) % 96}%;animation-delay:${(i * 0.13) % 1}s"></i>`).join("");
        L.marker(ll, {
          interactive: false,
          icon: L.divIcon({ className: "", iconSize: [120, 120], iconAnchor: [60, 60], html: `<div class="dw-rain"><span class="dw-cloud">🌧️</span>${drops}</div>` }),
        }).addTo(layer.current!);
      }
      L.circleMarker(ll, { radius: 7, color: "#fff", weight: 2, fillColor: c, fillOpacity: 1 })
        .bindPopup(
          `<b>${placeLabel(r.place)}</b><br/>${r.current.temp}°C • ${rainy ? "🌧️ Raining" : "No rain now"}<br/>Flood risk: <b>${r.level.toUpperCase()}</b> (${r.maxRisk}/100)`,
        )
        .addTo(layer.current!);
    });
    const active = reports.find((r) => r.place.id === activeId);
    if (active) map.current.flyTo([active.place.latitude, active.place.longitude], 10, { duration: 1 });
  }, [reports, activeId]);

  return <div ref={el} className="h-[420px] w-full" />;
}
