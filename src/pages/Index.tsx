
import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturedCategories from '../components/FeaturedCategories';
import HowItWorksSection from '../components/HowItWorksSection';
import InteractiveTutorial from '../components/InteractiveTutorial';
import { Footer } from '../components/Footer';
import SEO from '../components/SEO';


const Index = () => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <SEO
        title="FIVESOM — Somali Freelance Marketplace"
        description="Hire verified Somali freelancers or sell your skills on FIVESOM. Secure escrow, USSD payments and trusted talent for design, dev and writing."
        canonical="/"
      />
      <Navbar />
      <HeroSection />
      <FeaturedCategories />
      <HowItWorksSection />
      <InteractiveTutorial />
      

      
      <Footer />
    </div>
  );
};

export default Index;

