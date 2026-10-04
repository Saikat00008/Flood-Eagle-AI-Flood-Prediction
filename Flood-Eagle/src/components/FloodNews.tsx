import { Newspaper, Skull, Home, Users, MapPin, CalendarDays, ExternalLink } from "lucide-react";
import kerala from "@/assets/flood-kerala.jpg";
import assam from "@/assets/flood-assam.jpg";
import wayanad from "@/assets/flood-wayanad.jpg";
import bengal from "@/assets/flood-bengal.jpg";

type Story = {
  img: string; place: string; when: string; title: string;
  deaths: string; homes: string; affected: string; body: string[];
  sourceName: string; sourceUrl: string;
};

const stories: Story[] = [
  {
    img: assam, place: "Punjab, India", when: "August – September 2025",
    title: "Monsoon floods spread across Punjab",
    deaths: "Reported", homes: "Many damaged", affected: "Over 300,000 displaced",
    body: [
      "Heavy monsoon rain upstream swelled rivers flowing into Punjab. Flooding reached around 1,400 villages in the Indian state, forcing families to leave their homes.",
      "Rescue teams and local volunteers helped people move to safer ground as roads and farmland went under water.",
      "Lesson: follow evacuation notices early, especially near rivers downstream of heavy rain.",
    ],
    sourceName: "New Indian Express",
    sourceUrl: "https://www.newindianexpress.com/nation/2025/Sep/03/punjab-declared-disaster-hit-as-floods-submerge-375-lakh-acres-30-dead-355-lakh-affected/",
  },
  {
    img: bengal, place: "Hooghly, Howrah & Paschim Medinipur, West Bengal", when: "September 2024",
    title: "Dam water release floods south Bengal villages",
    deaths: "25+", homes: "Thousands of mud houses", affected: "Lakhs of people",
    body: [
      "After days of heavy rain in the Damodar basin, large amounts of water were released from DVC dams. Rivers like the Damodar, Mundeshwari and Rupnarayan overflowed into nearby villages.",
      "Khanakul, Arambagh and Ghatal were among the worst hit. Paddy fields went under water, roads were cut off and families moved to relief camps and school buildings by boat.",
      "Lesson: low‑lying villages near rivers can flood even when local rain stops — upstream rain and dam releases matter.",
    ],
    sourceName: "The Indian Express",
    sourceUrl: "https://indianexpress.com/article/cities/kolkata/release-water-maithon-panchet-dams-flood-situation-improves-bengal-9580680/",
  },
  {
    img: wayanad, place: "Wayanad, Kerala", when: "30 July 2024",
    title: "Landslides and flash floods wipe out hill villages",
    deaths: "230+ (100+ missing)", homes: "Hundreds destroyed", affected: "Thousands in camps",
    body: [
      "Extremely heavy overnight rain triggered massive landslides at Mundakkai, Chooralmala and Punchirimattom. A wall of mud, rocks and water swept through the villages while people slept.",
      "Army, NDRF and local volunteers built a temporary bridge to reach survivors. Many families lost every member and entire streets disappeared.",
      "Lesson: in hilly areas, very heavy rain over 1–2 days can cause landslides — move away from slopes and streams when red alerts are issued.",
    ],
    sourceName: "Reuters",
    sourceUrl: "https://www.reuters.com/world/india/death-toll-india-landslides-rises-151-search-missing-2024-07-31/",
  },
  {
    img: bengal, place: "Himachal Pradesh, Punjab & Delhi", when: "July – August 2023",
    title: "Heavy monsoon rain floods northern India",
    deaths: "Reported", homes: "Many damaged", affected: "Multiple states",
    body: [
      "Intense monsoon rainfall caused flooding and landslides across northern India, including Himachal Pradesh, Punjab and Delhi. Rising rivers and damaged roads disrupted travel and forced evacuations.",
      "Lesson: never attempt to cross a flooded road or bridge, even if the water looks shallow.",
    ],
    sourceName: "The Indian Express",
    sourceUrl: "https://indianexpress.com/article/india/india-rain-havoc-pm-modi-ndrf-sdrf-monsoon-8823425/",
  },
  {
    img: assam, place: "Assam (Brahmaputra & Barak valleys)", when: "May – July 2022",
    title: "One of Assam's worst flood seasons",
    deaths: "190+", homes: "Lakhs damaged", affected: "Over 50 lakh people at peak",
    body: [
      "Back‑to‑back waves of floods hit almost every district of Assam. Silchar town stayed under water for over a week after an embankment breach on the Barak river.",
      "Villagers walked through chest‑deep water carrying belongings, while cattle and crops were lost across thousands of villages.",
      "Lesson: embankments can break — keep emergency bags ready and know your nearest raised shelter.",
    ],
    sourceName: "New Indian Express",
    sourceUrl: "https://www.newindianexpress.com/nation/2022/jul/09/assam-flood-toll-mounts-to-190-with-three-new-deaths-close-to-40000-houses-damaged-2474672.html",
  },
  {
    img: wayanad, place: "Assam (Brahmaputra valley)", when: "May – October 2020",
    title: "Assam floods during the pandemic",
    deaths: "123 (plus 26 in landslides)", homes: "Villages inundated", affected: "Over 50 lakh people",
    body: [
      "Repeated flooding along the Brahmaputra affected thousands of villages during the COVID-19 pandemic. Many residents moved to relief camps as crops and homes were submerged.",
      "Lesson: prepare medicines and essentials before rising water cuts off access to shops and clinics.",
    ],
    sourceName: "NDTV",
    sourceUrl: "https://www.ndtv.com/india-news/assam-floods-over-120-dead-26-38-lakh-people-affected-in-27-districts-2268883",
  },
  {
    img: kerala, place: "Kerala (13 of 14 districts)", when: "August 2018",
    title: "Kerala's 'flood of the century'",
    deaths: "480+", homes: "Tens of thousands damaged", affected: "14 lakh+ in relief camps",
    body: [
      "Kerala received far more rain than normal in August, and many dam shutters had to be opened at once. Rivers like the Periyar and Pamba overflowed.",
      "Fishermen used their own boats to rescue thousands of people, becoming heroes of the rescue effort. Losses were estimated at over ₹30,000 crore.",
      "Lesson: early warnings and evacuation save lives — act as soon as authorities announce an alert.",
    ],
    sourceName: "NDTV",
    sourceUrl: "https://www.ndtv.com/kerala-news/483-dead-14-missing-in-kerala-floods-pinarayi-vijayan-1908578",
  },
];

export default function FloodNews() {
  const lead = stories[0]!;
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-primary/15 p-2 text-primary"><Newspaper className="h-5 w-5" /></span>
        <div>
          <h2 className="font-display text-2xl font-bold">Flood Reports from India</h2>
          <p className="text-sm text-muted-foreground">Where major floods struck, how many lives were lost and how many homes were destroyed.</p>
        </div>
      </div>

      <article className="grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-2">
        <img src={lead.img} alt={lead.title} width={1024} height={640} loading="lazy" className="h-full min-h-64 w-full object-cover" />
        <StoryBody s={lead} big />
      </article>

      <div className="grid gap-5 md:grid-cols-3">
        {stories.slice(1).map((s) => (
          <article key={s.title} className="overflow-hidden rounded-2xl border border-border bg-card">
            <img src={s.img} alt={s.title} width={1024} height={640} loading="lazy" className="h-44 w-full object-cover" />
            <StoryBody s={s} />
          </article>
        ))}
      </div>
    </section>
  );
}

function StoryBody({ s, big }: { s: Story; big?: boolean }) {
  return (
    <div className="space-y-3 p-5">
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{s.place}</span>
        <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{s.when}</span>
      </div>
      <a
        href={s.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline"
      >
        Article source: {s.sourceName}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
      <h3 className={`font-display font-bold ${big ? "text-2xl" : "text-lg"}`}>{s.title}</h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Fig icon={<Skull className="h-4 w-4" />} label="Lives lost" v={s.deaths} />
        <Fig icon={<Home className="h-4 w-4" />} label="Homes" v={s.homes} />
        <Fig icon={<Users className="h-4 w-4" />} label="Affected" v={s.affected} />
      </div>
      {(big ? s.body : s.body.slice(0, 1).concat(s.body.slice(-1))).map((p, i) => (
        <p key={i} className={`text-sm leading-relaxed ${p.startsWith("Lesson") ? "font-medium text-primary" : "text-muted-foreground"}`}>{p}</p>
      ))}
    </div>
  );
}

function Fig({ icon, label, v }: { icon: React.ReactNode; label: string; v: string }) {
  return (
    <div className="rounded-lg border border-danger/30 bg-danger/10 p-2">
      <div className="flex items-center justify-center gap-1 text-danger">{icon}<span className="text-[10px] uppercase">{label}</span></div>
      <div className="mt-1 text-xs font-semibold">{v}</div>
    </div>
  );
}
