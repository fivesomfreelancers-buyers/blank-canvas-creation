import React from 'react';
import { Shield, Clock, Star, Users, FileText, HelpCircle, Mail, Lock, BookOpen, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import HowItWorksSection from '../components/HowItWorksSection';
import { useTheme } from '../components/ThemeProvider';
import SEO from '../components/SEO';

const HowItWorks = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Scroll to section if hash is present in URL
  React.useEffect(() => {
    if (window.location.hash) {
      const element = document.getElementById(window.location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, []);

  const benefits = [
  {
    icon: Shield,
    title: 'Secure & Protected',
    description: 'Your payments and data are protected with bank-level security and our escrow system.'
  },
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'Get your projects completed on time with our reliable freelancers and milestone tracking.'
  },
  {
    icon: Star,
    title: 'Quality Guaranteed',
    description: 'Work with top-rated professionals who are verified and have proven track records.'
  }];


  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <SEO
        title="How FIVESOM Works — Buyers, Freelancers & Escrow"
        description="Learn how FIVESOM connects buyers and Somali freelancers: ordering, secure escrow payments, deliveries, USSD support, and dispute resolution."
        canonical="/how-it-works"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'How does FIVESOM escrow work?', acceptedAnswer: { '@type': 'Answer', text: 'Buyers fund the order upfront and FIVESOM holds the payment until delivery is accepted, then releases it to the freelancer.' } },
            { '@type': 'Question', name: 'What payment methods are supported?', acceptedAnswer: { '@type': 'Answer', text: 'FIVESOM supports local Somali USSD-based mobile money providers in addition to wallet balances.' } },
            { '@type': 'Question', name: 'How do I become a freelancer?', acceptedAnswer: { '@type': 'Answer', text: 'Sign up as a freelancer, complete your profile, submit verification documents, then publish your first gig.' } }
          ]
        }}
      />
      <Navbar />

      <header className="pt-24 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            How FIVESOM Works
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Ordering, secure escrow payments, deliveries and dispute resolution — explained step by step.
          </p>
        </div>
      </header>

      {/* Use the updated HowItWorksSection component */}
      <div>
        <HowItWorksSection />
      </div>

      {/* Additional sections container */}
      <div className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Benefits Section */}
          <div className="backdrop-blur-lg rounded-2xl p-8 md:p-12 mb-16 bg-card/50 border border-border shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
              Why Choose FIVESOM?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>)}
            </div>
          </div>

          {/* Help Center Section */}
          <section id="help-center" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-card/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <HelpCircle className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                Help Center
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              Get answers to frequently asked questions, access guides, and find solutions to common issues.
            </p>
            <ul className={`space-y-2 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              <li>• Getting started guides for new users</li>
              <li>• Step-by-step tutorials for placing orders</li>
              <li>• Troubleshooting common technical issues</li>
              <li>• Payment and billing support</li>
              <li>• Account management help</li>
            </ul>
          </section>

          {/* Contact Us Section */}
          <section id="contact-us" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-card/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <Mail className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                Contact Us
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              Reach out to our support team through multiple channels for personalized assistance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-muted'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Live Chat</h3>
                <p className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>Available 24/7 for instant help</p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-muted'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Email Support</h3>
                <p className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>Response within 24 hours</p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-muted'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Phone Support</h3>
                <p className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>
          </section>

          {/* Trust & Safety Section */}
          <section id="trust-safety" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-card/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <Shield className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                Trust & Safety
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              Your security is our priority. Learn about our comprehensive protection measures.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Payment Security</h3>
                <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  <li>• Secure escrow payment system</li>
                  <li>• Bank-level encryption</li>
                  <li>• Fraud prevention measures</li>
                  <li>• Protected transactions</li>
                </ul>
              </div>
              <div>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>User Protection</h3>
                <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  <li>• Identity verification</li>
                  <li>• 24/7 monitoring</li>
                  <li>• Dispute resolution</li>
                  <li>• Report system</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Terms of Service Section */}
          <section id="terms-of-service" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-card/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <FileText className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                Terms of Service
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              Important legal information about using FIVESOM platform services.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Platform Usage</h3>
                <p className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  By using FIVESOM, you agree to comply with our community guidelines and platform rules.
                </p>
              </div>
              <div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Service Agreements</h3>
                <p className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  Understanding the legal relationship between buyers, freelancers, and the platform.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Policy Section */}
          <section id="privacy-policy" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-card/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <Lock className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                Privacy Policy
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              Learn how we collect, use, and protect your personal information.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Data Collection</h3>
                <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  <li>• Account information</li>
                  <li>• Project details</li>
                  <li>• Communication records</li>
                  <li>• Usage analytics</li>
                </ul>
              </div>
              <div>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Data Protection</h3>
                <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  <li>• Secure storage</li>
                  <li>• Limited access</li>
                  <li>• No unauthorized sharing</li>
                  <li>• Regular security audits</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Success Stories Section */}
          <section id="success-stories" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-card/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <Star className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                Success Stories
              </h2>
            </div>
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              Real testimonials from our community of successful freelancers and satisfied clients.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-muted'}`}>
                <p className={`text-sm mb-4 italic ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  ""FIVESOM helped me grow my design business from a side hustle to a full-time career. The platform's tools and support made all the difference."



                </p>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>- Rahma Xamuud, Graphic Designer

                </p>
              </div>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-muted'}`}>
                <p className={`text-sm mb-4 italic ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  “Before FIVESOM, finding skilled and reliable freelancers was always a challenge. We spent countless hours searching for the right talent. With FIVESOM, everything changed — we can now connect with professional freelancers quickly and build strong teams for every project.”
                </p>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>- Aden Yusuf, Startup Co&Founder

                </p>
              </div>
            </div>
          </section>

          {/* Community Forum Section */}
          <section id="community-forum" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-card/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <Users className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                Community Forum
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              Connect with other freelancers and clients, share experiences, and get advice from the community.
            </p>
            <ul className={`space-y-2 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              <li>• Ask questions and get answers from experienced users</li>
              <li>• Share your success stories and learn from others</li>
              <li>• Network with professionals in your industry</li>
              <li>• Stay updated with platform news and updates</li>
            </ul>
          </section>

          {/* Freelancer Tips Section */}
          <section id="freelancer-tips" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-card/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <BookOpen className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                Freelancer Tips
              </h2>
            </div>
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              Expert advice and strategies to help freelancers succeed on the platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Profile Optimization</h3>
                <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  <li>• Create compelling gig descriptions</li>
                  <li>• Showcase your best work</li>
                  <li>• Set competitive pricing</li>
                  <li>• Use relevant keywords</li>
                </ul>
              </div>
              <div>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Client Relations</h3>
                <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  <li>• Communicate clearly and promptly</li>
                  <li>• Deliver work on time</li>
                  <li>• Ask for feedback and reviews</li>
                  <li>• Build long-term relationships</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Blog Section */}
          <section id="blog" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-card/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <FileText className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                Blog
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              Stay informed with the latest news, updates, and insights from the FIVESOM team.
            </p>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-muted'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Platform Updates</h3>
                <p className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  Learn about new features, improvements, and changes to the platform.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-muted'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Industry Insights</h3>
                <p className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  Expert analysis and trends in the freelancing and gig economy space.
                </p>
              </div>
            </div>
          </section>

          {/* Events Section */}
          <section id="events" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-card/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <Calendar className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                Events
              </h2>
            </div>
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              Join our webinars, workshops, and community events to learn and network.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-muted border-border'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Monthly Webinars</h3>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  Expert-led sessions on freelancing tips and platform updates.
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`}>Next: First Friday of every month</p>
              </div>
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-muted border-border'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>Skill Workshops</h3>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  Interactive sessions to improve your freelancing skills.
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`}>Various dates throughout the month</p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <div className="text-center mb-16">
            <h2 className={`text-2xl md:text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
              Frequently Asked Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[{ question: 'How does the escrow system work?', answer: 'Your payment is held securely until you approve the delivered work. This protects both buyers and freelancers.' }, {
                question: 'What if I\'m not satisfied with the work?',
                answer: 'You can request revisions or work with our support team to resolve any issues before releasing payment.'
              }, {
                question: 'How do I know if a freelancer is qualified?',
                answer: 'All freelancers have verified profiles, portfolios, ratings, and reviews from previous clients.'
              }, {
                question: 'Are there any hidden fees?',
                answer: 'No, we believe in transparent pricing. All fees are clearly displayed before you make any payment.'
              }].map((faq, index) => <div key={index} className={`backdrop-blur-lg rounded-xl p-6 text-left ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-card/50 border border-white/20'}`}>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                    {faq.question}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    {faq.answer}
                  </p>
                </div>)}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
              Ready to Get Started?
            </h2>
            <p className={`text-lg mb-8 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              Join thousands of satisfied clients who have grown their businesses with FIVESOM
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-colors">
                Find a Service
              </button>
              <button className={`px-8 py-4 backdrop-blur-lg rounded-xl font-semibold transition-colors ${isDarkMode ? 'bg-gray-800/50 text-white border border-gray-700/50 hover:bg-gray-700/50' : 'bg-card/50 text-foreground border border-white/20 hover:bg-card/70'}`}>
                Become a Freelancer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);

};
export default HowItWorks;