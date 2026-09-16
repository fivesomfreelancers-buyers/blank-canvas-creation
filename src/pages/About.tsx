import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Globe, Linkedin, Instagram, Facebook, ShieldCheck, Target, Eye, Sparkles, Briefcase } from 'lucide-react';
import { safeExternalUrl } from '@/lib/safeUrl';
import {
  aboutHero, aboutStory, aboutMission, aboutVision, aboutWhatWeDo,
  aboutAudiences, aboutEscrow, aboutCompanyDetails, aboutTeamSection,
} from '@/content/about';

export interface TeamMember {
  id: string;
  full_name: string;
  profile_image: string | null;
  job_title: string;
  description: string | null;
  social_links: Record<string, string> | null;
  display_order: number;
  is_active: boolean;
}

/** X (formerly Twitter) — lucide has no brand mark, so use the official glyph. */
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.27-1.33-3.55-3.84-3.64-6.38-.06-1.54.37-3.09 1.2-4.38.94-1.47 2.43-2.58 4.15-3.05 1.29-.36 2.68-.35 3.96-.03v4.04c-.71-.33-1.52-.48-2.33-.42-.77.05-1.51.34-2.08.83-.75.64-1.15 1.57-1.18 2.52-.03.93.29 1.87.89 2.56.6.68 1.46 1.1 2.37 1.17.78.06 1.58-.1 2.26-.5.69-.42 1.2-1.08 1.46-1.83.14-.37.21-.77.21-1.17V.02z" />
  </svg>
);

const SOCIAL_ICONS: Record<string, any> = {
  x: XIcon,
  twitter: XIcon,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  tiktok: TikTokIcon,
  website: Globe,
};

const SOCIAL_LABELS: Record<string, string> = {
  x: 'X',
  twitter: 'X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  website: 'Website',
};

const socialIcon = (key: string) => SOCIAL_ICONS[key.toLowerCase()] ?? Globe;

/** CEO always first, then the manual display order. */
export const sortTeam = (rows: TeamMember[]) =>
  [...rows].sort((a, b) => {
    const ceo = (m: TeamMember) => (/\bceo\b/i.test(m.job_title || '') ? 0 : 1);
    if (ceo(a) !== ceo(b)) return ceo(a) - ceo(b);
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join('');

const About = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from('about_team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (!cancelled) {
        setMembers(sortTeam((data ?? []) as unknown as TeamMember[]));
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel('about-team-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'about_team_members' }, load)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="About FIVESOM — Where African talent meets global opportunity"
        description="FIVESOM is a global freelancing marketplace connecting skilled African freelancers with clients worldwide. Learn about our story, mission, vision and secure escrow payments."
        canonical="/about"
      />
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 py-14 sm:py-20 text-center max-w-3xl">
            <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {aboutHero.eyebrow}
            </span>
            <h1 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight text-foreground">{aboutHero.title}</h1>
            <p className="mt-5 text-muted-foreground text-base sm:text-lg leading-relaxed">{aboutHero.intro}</p>
          </div>
        </section>

        {/* Story */}
        <section className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{aboutStory.title}</h2>
          <div className="mt-4 space-y-4">
            {aboutStory.body.map((para, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">{para}</p>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="border-y border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12 sm:py-16 grid gap-6 md:grid-cols-2">
            {[{ ...aboutMission, Icon: Target }, { ...aboutVision, Icon: Eye }].map(({ title, body, Icon }) => (
              <Card key={title} className="h-full">
                <CardContent className="p-7">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="mt-4 text-lg sm:text-xl font-semibold text-foreground">{title}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* What we do */}
        <section className="container mx-auto px-4 py-12 sm:py-16">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground text-center">{aboutWhatWeDo.title}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {aboutWhatWeDo.items.map((item) => (
              <Card key={item.title} className="h-full transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Freelancers & clients */}
        <section className="border-y border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12 sm:py-16 grid gap-6 md:grid-cols-2">
            {aboutAudiences.map((a) => (
              <Card key={a.title} className="h-full">
                <CardContent className="p-7">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">{a.title}</h2>
                  </div>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{a.body}</p>
                  <ul className="mt-4 space-y-2">
                    {a.points.map((p) => (
                      <li key={p} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Escrow */}
        <section className="container mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mx-auto h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mt-4 text-xl sm:text-2xl font-semibold text-foreground">{aboutEscrow.title}</h2>
            <p className="mt-3 text-muted-foreground">{aboutEscrow.intro}</p>
          </div>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {aboutEscrow.steps.map((step, i) => (
              <li key={step.title}>
                <Card className="h-full">
                  <CardContent className="p-5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {i + 1}
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-xs text-muted-foreground text-center max-w-2xl mx-auto">{aboutEscrow.note}</p>
        </section>

        {/* Company details */}
        {aboutCompanyDetails.filter((d) => d.value).length > 0 && (
          <section className="border-y border-border bg-muted/30">
            <div className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Company details</h2>
              <dl className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
                {aboutCompanyDetails.filter((d) => d.value).map((d) => (
                  <div key={d.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-5 py-4">
                    <dt className="text-sm font-medium text-muted-foreground sm:w-40 shrink-0">{d.label}</dt>
                    <dd className="text-sm text-foreground break-words">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        <section className="container mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{aboutTeamSection.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{aboutTeamSection.intro}</p>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Card key={i}><CardContent className="p-6 space-y-4">
                  <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                  <Skeleton className="h-3 w-full" />
                </CardContent></Card>
              ))}
            </div>
          ) : members.length === 0 ? (
            <Card className="max-w-xl mx-auto border-dashed">
              <CardContent className="p-10 text-center">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{aboutTeamSection.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{aboutTeamSection.emptyText}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m) => (
                <Card key={m.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    {m.profile_image ? (
                      <img
                        src={m.profile_image}
                        alt={`${m.full_name} — ${m.job_title} at FIVESOM`}
                        loading="lazy"
                        className="h-24 w-24 rounded-full object-cover mx-auto ring-2 ring-primary/20"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full mx-auto bg-muted flex items-center justify-center text-xl font-semibold text-muted-foreground">
                        {initials(m.full_name)}
                      </div>
                    )}
                    <h3 className="mt-4 font-semibold text-foreground">{m.full_name}</h3>
                    <p className="text-sm text-primary font-medium">{m.job_title}</p>
                    {m.description && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                    )}
                    {m.social_links && Object.keys(m.social_links).length > 0 && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        {Object.entries(m.social_links).map(([key, url]) => {
                          const href = safeExternalUrl(url);
                          if (!href) return null;
                          const Icon = socialIcon(key);
                          return (
                            <a
                              key={key}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              aria-label={`${m.full_name} on ${key}`}
                              className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                            >
                              <Icon className="h-4 w-4" />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
