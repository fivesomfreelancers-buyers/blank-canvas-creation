import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Globe, Linkedin, Instagram, Facebook, Twitter } from 'lucide-react';
import { safeExternalUrl } from '@/lib/safeUrl';

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

const SOCIAL_ICONS: Record<string, any> = {
  x: Twitter,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  website: Globe,
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
        title="About FIVESOM — The team behind the marketplace"
        description="Meet the founders and team building FIVESOM, the freelance marketplace for Somalia and the Horn of Africa."
        canonical="/about"
      />
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 py-14 sm:py-20 text-center max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">About FIVESOM</h1>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg">
              We are building the trusted marketplace where Somali talent meets global opportunity.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 sm:py-16">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-8 text-center">Our Team</h2>

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
                <h3 className="text-lg font-semibold text-foreground">About FIVESOM</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Our team information will appear here soon.
                </p>
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
