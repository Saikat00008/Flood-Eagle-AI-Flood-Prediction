import { AlertTriangle, CheckCircle2, Phone, XCircle } from "lucide-react";

const doItems = [
  "Follow official weather alerts and local evacuation instructions. Leave early for higher ground or a designated shelter.",
  "Pack drinking water, medicines, documents in a waterproof bag, a torch, charged phone and power bank.",
  "Switch off electricity and gas at the mains if it is safe to do so before leaving.",
  "Help children, older people, people with disabilities and pets reach safety; tell family where you are going.",
  "After flooding, use safe drinking water and return home only when authorities say it is safe.",
];

const dontItems = [
  "Do not walk, swim or drive through floodwater; hidden currents, open drains and live wires can be deadly.",
  "Do not touch fallen power lines or electrical appliances standing in water.",
  "Do not wait on a riverbank, under a bridge or on an unstable slope to watch rising water.",
  "Do not drink untreated floodwater or eat food that has touched it.",
  "Do not spread unverified warnings; check local authorities for reliable updates.",
];

export default function FloodSafety() {
  return (
    <section aria-labelledby="flood-safety-title" className="border-t border-border pt-8">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-primary/15 p-2 text-primary"><AlertTriangle className="h-5 w-5" /></span>
        <div>
          <h2 id="flood-safety-title" className="font-display text-2xl font-bold">Flood safety: what to do</h2>
          <p className="text-sm text-muted-foreground">Before, during and after rising water.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-safe"><CheckCircle2 className="h-5 w-5" />Do</h3>
          <ul className="mt-4 space-y-3">{doItems.map((item) => <li key={item} className="flex gap-3 text-sm leading-relaxed"><span className="text-safe">•</span>{item}</li>)}</ul>
        </div>
        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-danger"><XCircle className="h-5 w-5" />Don’t</h3>
          <ul className="mt-4 space-y-3">{dontItems.map((item) => <li key={item} className="flex gap-3 text-sm leading-relaxed"><span className="text-danger">•</span>{item}</li>)}</ul>
        </div>
      </div>
      <p className="mt-7 flex items-start gap-2 border-t border-border pt-5 text-sm font-semibold"><Phone className="h-5 w-5 shrink-0 text-primary" />In immediate danger in India, call 112. Follow your district administration for shelter and evacuation information.</p>
    </section>
  );
}