import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-foreground">
            Find Top Professionals to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
              Grow Your Business
            </span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed text-muted-foreground">
            FIVESOM is a secure platform connecting buyers and skilled freelancers, 
            offering high-quality services with our trusted escrow system.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8 backdrop-blur-lg rounded-xl sm:rounded-2xl p-1 bg-card/50 border border-border shadow-xl">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
              <div className="flex-1 flex items-center px-3 sm:px-4">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 text-muted-foreground" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  placeholder="What service are you looking for?" 
                  className="w-full py-3 sm:py-4 bg-transparent outline-none text-sm sm:text-lg text-foreground placeholder:text-muted-foreground" 
                />
              </div>
              <button className="bg-primary text-primary-foreground px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 mt-2 sm:mt-0">
                <span className="text-sm sm:text-base">Search</span>
                <ArrowRight size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto">
            <Link to="/explore" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all text-center">
              Find a Service
            </Link>
            <Link to="/register/freelancer" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 backdrop-blur-lg rounded-xl font-semibold transition-all text-center bg-card/50 text-foreground border border-border hover:bg-card/70">
              Become a Freelancer
            </Link>
          </div>
        </div>

        {/* Popular searches */}
        <div className="text-center">
          <p className="text-xs sm:text-sm mb-3 sm:mb-4 text-muted-foreground">
            Popular searches:
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {['Logo Design', 'Video Editing', 'Web Design', 'Content Writing', 'App UI Design', 'Graphic Design', 'App Development', 'Web Development'].map(term => 
              <Link
                key={term}
                to={`/explore?q=${encodeURIComponent(term)}`}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-xs sm:text-sm font-medium transition-colors"
              >
                {term}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;