
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturedCategories from '../components/FeaturedCategories';
import HowItWorksSection from '../components/HowItWorksSection';
import InteractiveTutorial from '../components/InteractiveTutorial';
import { Footer } from '../components/Footer';
import platformPreview from '../assets/platform-preview-collage.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <HeroSection />
      <FeaturedCategories />
      <HowItWorksSection />
      <InteractiveTutorial />
      
      {/* Platform Preview Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            See FIVESOM in Action
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore our platform's powerful features designed to connect freelancers and clients seamlessly
          </p>
          <div className="relative group">
            <img 
              src={platformPreview} 
              alt="FIVESOM Platform Features Preview - Homepage, Gigs, Dashboard, and Payment System"
              className="w-full max-w-5xl mx-auto rounded-2xl shadow-2xl border border-border/20 transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-200"
            >
              Start Your Journey
            </Link>
            <Link 
              to="/explore" 
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-foreground bg-background border border-border hover:bg-muted/50 rounded-lg transition-colors duration-200"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;

