import React from 'react';
import { FileText, Smartphone, Globe, Palette, Image as ImageIcon, Video, PenTool, Megaphone } from 'lucide-react';
import type { SearchGigResult } from '@/hooks/useGigSearch';

const SKILLS = [
  { label: 'PDF', icon: FileText },
  { label: 'Apps', icon: Smartphone },
  { label: 'Web', icon: Globe },
  { label: 'Design', icon: Palette },
  { label: 'Posters', icon: ImageIcon },
  { label: 'Video', icon: Video },
  { label: 'Logo', icon: PenTool },
  { label: 'Marketing', icon: Megaphone },
];

const LANES = [12, 30, 50, 68, 86, 22, 58, 78];

/** Freelancers flow in from the right, pass the Fivesom beam, and leave on the left as their skill. */
const TalentFlow: React.FC<{ gigs: SearchGigResult[] }> = ({ gigs }) => {
  const seen = new Set<string>();
  const people = gigs.filter((g) => g.freelancerAvatar && !seen.has(g.freelancerId) && seen.add(g.freelancerId)).slice(0, 8);

  return (
    <div className="talent-flow relative mx-auto h-64 w-full max-w-5xl overflow-hidden sm:h-80" aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 h-40 -translate-y-1/2 rounded-[50%] bg-primary/5 blur-2xl" />
      <div className="absolute left-1/2 top-4 bottom-4 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/0 via-primary to-primary/0 shadow-[0_0_30px_hsl(var(--primary))]" />
      {SKILLS.map((s, i) => {
        const Icon = s.icon;
        const p = people[i % Math.max(people.length, 1)];
        const style = { top: `${LANES[i]}%`, animationDelay: `${i * -1.25}s` } as React.CSSProperties;
        return (
          <React.Fragment key={s.label}>
            <div className="talent-in absolute" style={style}>
              {p ? (
                <img src={p.freelancerAvatar} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} className="h-11 w-11 rounded-full border-2 border-primary object-cover shadow-lg sm:h-14 sm:w-14" />
              ) : (
                <div className="h-11 w-11 rounded-full border-2 border-primary bg-card sm:h-14 sm:w-14" />
              )}
            </div>
            <div className="talent-out absolute" style={style}>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/30 bg-card/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-md backdrop-blur sm:text-sm">
                <Icon className="h-4 w-4 text-primary" /> {s.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default TalentFlow;
