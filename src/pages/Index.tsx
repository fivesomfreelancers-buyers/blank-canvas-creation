import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturedCategories from '../components/FeaturedCategories';
import HowItWorksSection from '../components/HowItWorksSection';
import InteractiveTutorial from '../components/InteractiveTutorial';
import VipMembershipSection from '../components/VipMembershipSection';
import HomeFAQ from '../components/HomeFAQ';
import { Footer } from '../components/Footer';
import SEO from '../components/SEO';
import { organizationSchema, webSiteSchema, serviceSchema } from '@/lib/seo/schemas';
import { faqPageSchema } from '@/lib/seo/homeFaq';

const Index = () => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <SEO
        title="FIVESOM — Hire Verified Freelancers | Freelance Marketplace"
        description="FIVESOM is a global freelance marketplace: hire verified freelancers for design, web development, video and writing, or sell your skills. Escrow-protected payments and local payouts."
        canonical="/"
        jsonLd={[organizationSchema, webSiteSchema, serviceSchema, faqPageSchema()]}
      />
      <Navbar />
      <HeroSection />
      <FeaturedCategories />
      <HowItWorksSection />
      <InteractiveTutorial />
      <VipMembershipSection />
      <HomeFAQ />
      <Footer />
    </div>
  );
};

export default Index;
