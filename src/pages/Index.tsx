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
import MarketplaceJourneys from '../components/home/MarketplaceJourneys';
import InteractiveTutorial from '../components/InteractiveTutorial';
import HomeFAQ from '../components/HomeFAQ';
import { Footer } from '../components/Footer';
import SEO from '../components/SEO';
import { organizationSchema, webSiteSchema, serviceSchema } from '@/lib/seo/schemas';
import { faqPageSchema } from '@/lib/seo/homeFaq';
import { useGigSearch } from '@/hooks/useGigSearch';
import { useHomeStats } from '@/hooks/useHomeStats';
import BuyerGuide from '@/components/home/BuyerGuide';
import { MARKETPLACE_POSITIONING } from '@/content/marketplacePositioning';

const Index = () => {
  const { gigs, loading } = useGigSearch({ pageSize: 48 });
  const { activeGigs, freelancers } = useHomeStats();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <SEO
        title={MARKETPLACE_POSITIONING.title}
        description={MARKETPLACE_POSITIONING.description}
        canonical="/"
        jsonLd={[organizationSchema, webSiteSchema, serviceSchema, faqPageSchema()]}
      />
      <Navbar />
      <main>
        <HomeHero gigCount={activeGigs} freelancerCount={freelancers} />
        <LiveGigsMarquee gigs={gigs} loading={loading} />
        <div className="home-story">
          <PopularServices />
          <HowFivesomWorks />
          <EscrowSection />
          <BuyerGuide />
          <MarketplaceJourneys />
          <FeaturedFreelancers gigs={gigs} loading={loading} />
          <TrustSafetySection />
          <InteractiveTutorial />
          <HomeFAQ />
          <HomeCta />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
