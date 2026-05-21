import React, { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, Calendar, Globe, GraduationCap, Briefcase, Wrench, CheckCircle, ImageIcon, Crown, Gem } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';
import OnlineIndicator from '@/components/presence/OnlineIndicator';
import { softwareLogo, SoftwareDef } from '@/lib/verificationCatalog';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  /** Pass either freelancerId (freelancers.id) or userId — the component resolves both. */
  freelancerId?: string;
  userId?: string;
  /** Hide the portfolio gallery (e.g. when used inline in tight contexts) */
  hidePortfolio?: boolean;
}

interface Portfolio { media_url: string; media_type: 'image' | 'video'; }

const FreelancerProfileCard: React.FC<Props> = ({ freelancerId, userId, hidePortfolio }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let freelancer: any = null;
      if (freelancerId) {
        const { data: f } = await supabase.from('freelancers').select('*').eq('id', freelancerId).maybeSingle();
        freelancer = f;
      } else if (userId) {
        const { data: f } = await supabase.from('freelancers').select('*').eq('user_id', userId).maybeSingle();
        freelancer = f;
      }
      if (!freelancer) { if (!cancelled) { setData(null); setLoading(false); } return; }

      const { data: profile } = await (supabase as any)
        .from('public_profiles')
        .select('full_name, profile_image_url, location, languages, professional_title, created_at, bio')
        .eq('id', freelancer.user_id)
        .single();

      const { data: pf } = await (supabase as any)
        .from('freelancer_portfolio')
        .select('media_url, media_type, position')
        .eq('freelancer_id', freelancer.id)
        .order('position', { ascending: true });

      if (cancelled) return;
      setPortfolio((pf as any) || []);
      setData({ ...freelancer, profile });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [freelancerId, userId]);

  if (loading) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading profile…</CardContent></Card>;
  if (!data) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Profile unavailable</CardContent></Card>;

  const p = data.profile || {};
  const name = p.full_name || 'Freelancer';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  const tools: SoftwareDef[] = (data.software_tools as SoftwareDef[]) || [];
  const languages: string[] = p.languages || [];
  const skills: string[] = data.skills || [];

  // VIP tier check (auto-treat as null when expired)
  const isVipActive = data.vip_tier && (!data.vip_expires_at || new Date(data.vip_expires_at) > new Date());
  const vipTier: 'golden' | 'platinum' | null = isVipActive ? data.vip_tier : null;

  const vipTheme = vipTier === 'platinum'
    ? {
        label: 'PLATINUM VIP SELLER',
        accent: '#A78BFA',
        gradient: 'linear-gradient(135deg,#E0E0FF,#A78BFA,#8A7FFF)',
        ring: '0 0 0 2px #A78BFA, 0 0 32px rgba(167,139,250,0.55)',
        frameBg: 'radial-gradient(800px 300px at 20% 0%, rgba(167,139,250,0.25), transparent 60%), linear-gradient(180deg, #0d1228, #060818)',
        textGradient: 'linear-gradient(90deg,#E0E0FF,#A78BFA)',
        Icon: Gem,
      }
    : vipTier === 'golden'
    ? {
        label: 'GOLDEN VIP SELLER',
        accent: '#FFD166',
        gradient: 'linear-gradient(135deg,#FFD700,#B8860B,#FFD166)',
        ring: '0 0 0 2px #FFD166, 0 0 32px rgba(255,209,102,0.55)',
        frameBg: 'radial-gradient(800px 300px at 20% 0%, rgba(255,209,102,0.22), transparent 60%), linear-gradient(180deg, #1a1303, #0a0700)',
        textGradient: 'linear-gradient(90deg,#FFD166,#FFEFC2)',
        Icon: Crown,
      }
    : null;

  const wrapperClass = vipTheme ? 'space-y-5 p-6 rounded-2xl relative overflow-hidden' : 'space-y-5';
  const wrapperStyle = vipTheme ? { background: vipTheme.frameBg, boxShadow: `inset 0 0 0 1.5px ${vipTheme.accent}, 0 0 40px ${vipTheme.accent}33` } : undefined;

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      {vipTheme && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase z-10"
             style={{ background: vipTheme.gradient, color: '#0B0E14', boxShadow: `0 0 16px ${vipTheme.accent}88` }}>
          <vipTheme.Icon className="w-3.5 h-3.5" /> {vipTheme.label}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="relative shrink-0 mx-auto sm:mx-0">
          <Avatar className="w-24 h-24" style={vipTheme ? { boxShadow: vipTheme.ring } : undefined}>
            <AvatarImage src={p.profile_image_url || ''} className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-1 right-1"><OnlineIndicator userId={data.user_id} dotOnly /></span>
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h3 className={`text-xl font-bold ${vipTheme ? 'bg-clip-text text-transparent' : ''}`}
                style={vipTheme ? { backgroundImage: vipTheme.textGradient } : undefined}>{name}</h3>
            {data.is_verified && <VerifiedBadge showLabel size="md" />}
            {vipTheme && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: vipTheme.gradient, color: '#0B0E14' }}>
                <vipTheme.Icon className="w-3 h-3" /> {vipTier === 'platinum' ? 'PLATINUM' : 'GOLD'}
              </span>
            )}
            {data.is_featured && !vipTheme && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-600 border border-yellow-500/30">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Top Rated
              </span>
            )}
          </div>
          {(data.professional_title || p.professional_title) && (
            <p className="text-sm font-medium mt-0.5" style={{ color: vipTheme?.accent || 'hsl(var(--primary))' }}>{data.professional_title || p.professional_title}</p>
          )}
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
            {p.location && <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{p.location}</span>}
            {p.created_at && <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" />Member since {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>}
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1 text-sm mt-2">
            <span className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-semibold">{Number(data.rating) > 0 ? Number(data.rating).toFixed(1) : 'New'}</span>
            </span>
            <span className="flex items-center text-muted-foreground"><CheckCircle className="w-4 h-4 mr-1" />{data.completed_orders || 0} orders completed</span>
          </div>
        </div>
      </div>

      {(data.bio || p.bio) && (
        <div>
          <p className="text-sm font-semibold mb-1">About</p>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{data.bio || p.bio}</p>
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {languages.length > 0 && (
          <div>
            <p className="text-sm font-semibold flex items-center gap-1.5 mb-2"><Globe className="w-4 h-4" /> Languages</p>
            <div className="flex flex-wrap gap-1.5">{languages.map(l => <Badge key={l} variant="outline" className="text-xs">{l}</Badge>)}</div>
          </div>
        )}
        {data.years_experience && (
          <div>
            <p className="text-sm font-semibold flex items-center gap-1.5 mb-1"><Briefcase className="w-4 h-4" /> Experience</p>
            <p className="text-sm text-muted-foreground">{data.years_experience}</p>
          </div>
        )}
        {data.education_level && (
          <div>
            <p className="text-sm font-semibold flex items-center gap-1.5 mb-1"><GraduationCap className="w-4 h-4" /> Education</p>
            <p className="text-sm text-muted-foreground">{data.education_level}</p>
          </div>
        )}
      </div>

      {tools.length > 0 && (
        <div>
          <p className="text-sm font-semibold flex items-center gap-1.5 mb-2"><Wrench className="w-4 h-4" /> Software & Tools</p>
          <div className="flex flex-wrap gap-2">
            {tools.map(t => (
              <div key={t.slug} className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background text-xs">
                <img src={softwareLogo(t.slug)} alt={t.name} className="w-4 h-4" />
                <span>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hidePortfolio && portfolio.length > 0 && (
        <div>
          <p className="text-sm font-semibold flex items-center gap-1.5 mb-2"><ImageIcon className="w-4 h-4" /> Portfolio</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {portfolio.map((m, i) => (
              <div key={i} className="aspect-square rounded-md overflow-hidden bg-muted">
                {m.media_type === 'image'
                  ? <img src={m.media_url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                  : <video src={m.media_url} controls className="w-full h-full object-cover bg-black" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerProfileCard;
