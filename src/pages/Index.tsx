import React from 'react';
import Navbar from '../components/Navbar';
import HomeHero from '../components/home/HomeHero';
import LiveGigsMarquee from '../components/home/LiveGigsMarquee';
import PopularServices from '../components/home/PopularServices';
import HowFivesomWorks from '../components/home/HowFivesomWorks';
import EscrowSection from '../components/home/EscrowSection';
import FeaturedFreelancers from '../components/home/FeaturedFreelancers';
import TrustSafetySection from '../components/home/TrustSafetySection';
import HomeCta from '../components/home/HomeCta';
import InteractiveTutorial from '../components/InteractiveTutorial';
import HomeFAQ from '../components/HomeFAQ';
import { Footer } from '../components/Footer';
import SEO from '../components/SEO';
import { organizationSchema, webSiteSchema, serviceSchema } from '@/lib/seo/schemas';
import { faqPageSchema } from '@/lib/seo/homeFaq';
import { useGigSearch } from '@/hooks/useGigSearch';
import { useHomeStats } from '@/hooks/useHomeStats';

const Index = () => {
  const { gigs, loading } = useGigSearch({ pageSize: 12 });
  const { activeGigs, freelancers } = useHomeStats();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <SEO
        title="FIVESOM — Hire Freelancers with Escrow Protection"
        description="FIVESOM is a global freelance marketplace: hire verified freelancers for design, web development, video editing and writing, or sell your skills. Payments held in escrow until you accept the work."
        canonical="/"
        jsonLd={[organizationSchema, webSiteSchema, serviceSchema, faqPageSchema()]}
      />
      <Navbar />
      <main>
        <HomeHero gigCount={activeGigs} freelancerCount={freelancers} />
        <LiveGigsMarquee gigs={gigs} loading={loading} />
        <PopularServices />
        <HowFivesomWorks />
        <EscrowSection />
        <FeaturedFreelancers gigs={gigs} loading={loading} />
        <TrustSafetySection />
        <InteractiveTutorial />
        <HomeFAQ />
        <HomeCta />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
