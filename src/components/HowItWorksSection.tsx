
import React from 'react';
import { Search, MessageCircle, CreditCard, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import howItWorksImage1 from "../assets/how-it-works-1.jpg";
import howItWorksImage2 from "../assets/how-it-works-2.jpg";
import howItWorksImage3 from "../assets/how-it-works-3.jpg";
import howItWorksImage4 from "../assets/how-it-works-4.jpg";

const HowItWorksSection = () => {
  const steps = [
    {
      stepNumber: 1,
      icon: Search,
      title: 'Find Your Perfect Freelancer',
      description: 'Browse thousands of verified freelancers across categories and choose the right expert for your task.',
      image: howItWorksImage1,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      stepNumber: 2,
      icon: MessageCircle,
      title: 'Collaborate Securely',
      description: 'Chat, share files, and track progress with built-in secure messaging between buyer and freelancer.',
      image: howItWorksImage2,
      color: 'from-purple-400 to-pink-500'
    },
    {
      stepNumber: 3,
      icon: CreditCard,
      title: 'Secure Escrow Payment',
      description: 'Buyer deposits payment into FIVESOM\'s escrow wallet. Funds are safely held until the job is complete.',
      image: howItWorksImage3,
      color: 'from-green-400 to-emerald-500'
    },
    {
      stepNumber: 4,
      icon: CheckCircle,
      title: 'Release Payment',
      description: 'Once the project is approved, payment is released to the freelancer quickly and securely.',
      image: howItWorksImage4,
      color: 'from-orange-400 to-red-500'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
            How FIVESOM Works
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 text-muted-foreground">
            Getting started is simple. Follow these four easy steps to find 
            professional services and grow your business with confidence.
          </p>
        </div>

        <div className="space-y-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image Side */}
              <div className="flex-1 lg:max-w-md">
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-6 -left-6 w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-xl border-4 border-card">
                    {step.stepNumber}
                  </div>
                </div>
              </div>
              
              {/* Content Side */}
              <div className={`flex-1 ${index % 2 === 1 ? 'lg:pr-8' : 'lg:pl-8'}`}>
                <div className={`${index % 2 === 1 ? 'lg:text-right' : 'lg:text-left'} text-center`}>
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 bg-primary text-primary-foreground">
                    Step {step.stepNumber}
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                    {step.title}
                  </h3>
                  
                  <p className="text-xl leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="backdrop-blur-lg rounded-2xl p-8 bg-card/50 border border-border shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2 text-primary">
                100%
              </div>
              <p className="text-sm text-muted-foreground">
                Secure Escrow System
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2 text-primary">
                24/7
              </div>
              <p className="text-sm text-muted-foreground">
                Customer Support
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2 text-primary">
                5★
              </div>
              <p className="text-sm text-muted-foreground">
                Average Service Rating
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/how-it-works"
            className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg"
          >
            Learn More About Our Process
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
