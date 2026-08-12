import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturedCategories from '../components/FeaturedCategories';
import HowItWorksSection from '../components/HowItWorksSection';
import InteractiveTutorial from '../components/InteractiveTutorial';
import VipMembershipSection from '../components/VipMembershipSection';
import { Footer } from '../components/Footer';
import SEO from '../components/SEO';

const Index = () => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <SEO
        title="FIVESOM — Global Freelance Marketplace"
        description="FIVESOM is a global freelance marketplace connecting clients with skilled freelancers worldwide. Hire trusted talent or sell your skills in web development, design, writing, marketing and more, with secure payments and escrow protection."."
        canonical="/"
      />
      <Navbar />
      <HeroSection />
      <FeaturedCategories />
      <HowItWorksSection />
      <InteractiveTutorial />
      <VipMembershipSection />
      <Footer />
    </div>
  );
};

export default Index;


