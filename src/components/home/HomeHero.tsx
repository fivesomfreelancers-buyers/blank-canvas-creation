import React, { useEffect, useRef, useState } from 'react';
import { Search, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { SearchGigResult } from '@/hooks/useGigSearch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MARKETPLACE_POSITIONING } from '@/content/marketplacePositioning';
import { QUICK_SEARCHES, popularServiceTags } from '@/lib/homeDiscovery';
import stripeLogo from '@/assets/tools/stripe.svg';
import supabaseLogo from '@/assets/partners/supabase.svg.asset.json';
import oneDriveLogo from '@/assets/partners/onedrive.svg.asset.json';
import worldRemitLogo from '@/assets/partners/worldremit.svg.asset.json';
import poster from '@/assets/hero-bg-poster.jpg.asset.json';
import videoMp4 from '@/assets/hero-bg.mp4.asset.json';
import videoWebm from '@/assets/hero-bg.webm.asset.json';
import video2Mp4 from '@/assets/hero-bg2.mp4.asset.json';
import video2Webm from '@/assets/hero-bg2.webm.asset.json';

const CLIPS = [{ webm: videoWebm.url, mp4: videoMp4.url }, { webm: video2Webm.url, mp4: video2Mp4.url }];

const HomeHero: React.FC<{ gigs: SearchGigResult[] }> = ({ gigs }) => {
  const [query, setQuery] = useState('');
  const [clipIndex, setClipIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const trending = popularServiceTags(gigs);
  const clip = CLIPS[clipIndex];
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReducedMotion(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;
    setReady(false);
    video.load();
    video.play().catch(() => {});
  }, [clipIndex, reducedMotion]);
  const search = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(query.trim() ? `/explore?q=${encodeURIComponent(query.trim())}` : '/explore');
  };
  return (
    <section className="home-hero-glass relative isolate overflow-hidden px-4 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-32 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <img src={poster.url} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
        {!reducedMotion && <video ref={videoRef} key={clipIndex} autoPlay muted playsInline preload="metadata" poster={poster.url} tabIndex={-1} disablePictureInPicture onCanPlay={() => setReady(true)} onEnded={() => setClipIndex(i => (i + 1) % CLIPS.length)} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}><source src={clip.webm} type="video/webm" /><source src={clip.mp4} type="video/mp4" /></video>}
        <div className="home-hero-veil absolute inset-0" />
      </div>
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-5 text-sm font-medium text-muted-foreground">African roots. Global talent. Your next great project.</p>
        <h1 className="mx-auto max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">{MARKETPLACE_POSITIONING.heading}</h1>
        <div className="home-search-glass mx-auto mt-9 max-w-4xl rounded-2xl border p-3 text-left sm:mt-10 sm:p-6">
          <form onSubmit={search} className="flex min-h-16 items-center gap-2 rounded-full bg-card px-4 py-2 text-card-foreground sm:px-6">
            <label htmlFor="hero-search" className="sr-only">Search for services, skills, or professionals</label>
            <input id="hero-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search for services, skills, or professionals..." className="home-search-input min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground sm:text-lg" />
            <Button type="submit" size="icon" aria-label="Search" className="h-11 w-11 shrink-0"><Search className="h-5 w-5" /></Button>
          </form>
          <Tabs defaultValue="quick" className="mt-5">
            <TabsList className="grid h-12 w-full grid-cols-2 rounded-none border-b border-border bg-transparent p-0">
              <TabsTrigger value="quick" className="home-search-tab h-full gap-2 rounded-none bg-transparent text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"><Search className="h-4 w-4" />Quick Search</TabsTrigger>
              <TabsTrigger value="trending" className="home-search-tab h-full gap-2 rounded-none bg-transparent text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"><TrendingUp className="h-4 w-4" />Trending Searches</TabsTrigger>
            </TabsList>
            <TabsContent value="quick" className="mt-0 min-h-[200px] sm:min-h-[220px]">
              {QUICK_SEARCHES.map(item => <Button key={item.query} variant="ghost" asChild className="home-suggestion h-auto min-h-11 w-full justify-between whitespace-normal rounded-none border-b border-border px-2 py-3 text-left text-foreground"><Link to={`/explore?q=${encodeURIComponent(item.query)}`}><span>{item.label}</span><ArrowUpRight className="shrink-0" /></Link></Button>)}
            </TabsContent>
            <TabsContent value="trending" className="mt-0 min-h-[200px] sm:min-h-[220px]">
              <p className="px-2 pt-3 text-xs text-muted-foreground">Popular tags on live services</p>
              {trending.length ? trending.map(item => <Button key={item.label} variant="ghost" asChild className="home-suggestion h-auto min-h-10 w-full justify-between whitespace-normal rounded-none border-b border-border px-2 py-2 text-left text-foreground"><Link to={`/explore?q=${encodeURIComponent(item.label)}`}><span>{item.label}</span><ArrowUpRight className="shrink-0" /></Link></Button>) : <p className="px-2 py-6 text-sm text-muted-foreground">Popular services will appear here when available.</p>}
            </TabsContent>
          </Tabs>
        </div>
        <p className="mt-7 text-sm text-muted-foreground"><Link to="/explore" className="hover:text-foreground">Browse all services</Link><span className="mx-3" aria-hidden>·</span><Link to="/buyer/jobs/new" className="hover:text-foreground">Post your project <ArrowUpRight className="inline h-3.5 w-3.5" /></Link></p>
      </div>
      <div className="home-partners mx-auto mt-9 grid max-w-4xl grid-cols-2 items-center justify-items-center gap-x-4 gap-y-4 rounded-lg bg-card px-4 py-4 text-card-foreground sm:mt-10 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-8 sm:px-6">
        <span className="text-xs font-medium text-muted-foreground">Powered by</span>
        <span className="inline-flex items-center gap-2 font-semibold"><img src={stripeLogo} alt="" className="h-6 w-6 object-contain" />Stripe</span>
        <span className="inline-flex items-center gap-2 font-semibold"><img src={supabaseLogo.url} alt="" className="h-6 w-6 object-contain" />Supabase</span>
        <span className="inline-flex items-center gap-2 text-sm font-semibold"><img src={oneDriveLogo.url} alt="" className="h-7 w-9 object-contain" />Microsoft OneDrive</span>
        <span className="home-worldremit inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold"><img src={worldRemitLogo.url} alt="" className="h-6 w-6 object-contain" />WorldRemit</span>
      </div>
    </section>
  );
};
export default HomeHero;
