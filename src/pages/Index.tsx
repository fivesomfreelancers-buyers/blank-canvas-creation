import React from 'react';
import Navbar from '../components/Navbar';
import HomeHero from '../components/home/HomeHero';
import ClientProjects from '../components/home/ClientProjects';
import ServiceDiscovery from '../components/home/ServiceDiscovery';
import HowFivesomWorks from '../components/home/HowFivesomWorks';
import EscrowSection from '../components/home/EscrowSection';
import FeaturedFreelancers from '../components/home/FeaturedFreelancers';
import HomeCta from '../components/home/HomeCta';
import HomeFAQ from '../components/HomeFAQ';
import { Footer } from '../components/Footer';
import SEO from '../components/SEO';
import { organizationSchema, webSiteSchema, serviceSchema } from '@/lib/seo/schemas';
import { faqPageSchema } from '@/lib/seo/homeFaq';
import { useGigSearch } from '@/hooks/useGigSearch';
import { MARKETPLACE_POSITIONING } from '@/content/marketplacePositioning';

const Index = () => {
  const { gigs, loading } = useGigSearch({ pageSize: 48 });

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
        <HomeHero gigs={gigs} />
        <div className="home-story">
          <ClientProjects />
          <ServiceDiscovery gigs={gigs} loading={loading} />
          <HowFivesomWorks />
          <FeaturedFreelancers gigs={gigs} loading={loading} />
          <EscrowSection />
          <HomeFAQ />
          <HomeCta />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
