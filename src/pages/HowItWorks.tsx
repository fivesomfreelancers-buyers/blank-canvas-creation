import React from 'react';
import { Shield, Clock, Star, Users, FileText, HelpCircle, Mail, Lock, BookOpen, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import HowItWorksSection from '../components/HowItWorksSection';
import { useTheme } from '../components/ThemeProvider';

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
      <Navbar />
      
      {/* Use the updated HowItWorksSection component */}
      <div className="pt-20">
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
          <section id="help-center" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <HelpCircle className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Help Center
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Get answers to frequently asked questions, access guides, and find solutions to common issues.
            </p>
            <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>• Getting started guides for new users</li>
              <li>• Step-by-step tutorials for placing orders</li>
              <li>• Troubleshooting common technical issues</li>
              <li>• Payment and billing support</li>
              <li>• Account management help</li>
            </ul>
          </section>

          {/* Contact Us Section */}
          <section id="contact-us" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <Mail className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Contact Us
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Reach out to our support team through multiple channels for personalized assistance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Live Chat</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Available 24/7 for instant help</p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email Support</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Response within 24 hours</p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Phone Support</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>
          </section>

          {/* Trust & Safety Section */}
          <section id="trust-safety" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <Shield className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Trust & Safety
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Your security is our priority. Learn about our comprehensive protection measures.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Security</h3>
                <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Secure escrow payment system</li>
                  <li>• Bank-level encryption</li>
                  <li>• Fraud prevention measures</li>
                  <li>• Protected transactions</li>
                </ul>
              </div>
              <div>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User Protection</h3>
                <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Identity verification</li>
                  <li>• 24/7 monitoring</li>
                  <li>• Dispute resolution</li>
                  <li>• Report system</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Terms of Service Section */}
          <section id="terms-of-service" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <FileText className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Terms of Service
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Important legal information about using FIVESOM platform services.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Platform Usage</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  By using FIVESOM, you agree to comply with our community guidelines and platform rules.
                </p>
              </div>
              <div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Service Agreements</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Understanding the legal relationship between buyers, freelancers, and the platform.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Policy Section */}
          <section id="privacy-policy" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <Lock className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Privacy Policy
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Learn how we collect, use, and protect your personal information.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Data Collection</h3>
                <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Account information</li>
                  <li>• Project details</li>
                  <li>• Communication records</li>
                  <li>• Usage analytics</li>
                </ul>
              </div>
              <div>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Data Protection</h3>
                <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Secure storage</li>
                  <li>• Limited access</li>
                  <li>• No unauthorized sharing</li>
                  <li>• Regular security audits</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Success Stories Section */}
          <section id="success-stories" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <Star className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Success Stories
              </h2>
            </div>
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Real testimonials from our community of successful freelancers and satisfied clients.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <p className={`text-sm mb-4 italic ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  "FIVESOM helped me grow my design business from a side hustle to a full-time career. The platform's tools and support made all the difference."
                </p>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>- Rahma Xamuud, Graphic Designer

                </p>
              </div>
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <p className={`text-sm mb-4 italic ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  "Finding quality freelancers was always challenging until I discovered FIVESOM. Now I have a reliable team for all my projects."
                </p>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>- Aden Yusuf, Startup Co&Founder

                </p>
              </div>
            </div>
          </section>

          {/* Community Forum Section */}
          <section id="community-forum" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <Users className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Community Forum
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Connect with other freelancers and clients, share experiences, and get advice from the community.
            </p>
            <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>• Ask questions and get answers from experienced users</li>
              <li>• Share your success stories and learn from others</li>
              <li>• Network with professionals in your industry</li>
              <li>• Stay updated with platform news and updates</li>
            </ul>
          </section>

          {/* Freelancer Tips Section */}
          <section id="freelancer-tips" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <BookOpen className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Freelancer Tips
              </h2>
            </div>
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Expert advice and strategies to help freelancers succeed on the platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Optimization</h3>
                <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Create compelling gig descriptions</li>
                  <li>• Showcase your best work</li>
                  <li>• Set competitive pricing</li>
                  <li>• Use relevant keywords</li>
                </ul>
              </div>
              <div>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Client Relations</h3>
                <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Communicate clearly and promptly</li>
                  <li>• Deliver work on time</li>
                  <li>• Ask for feedback and reviews</li>
                  <li>• Build long-term relationships</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Blog Section */}
          <section id="blog" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <FileText className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Blog
              </h2>
            </div>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Stay informed with the latest news, updates, and insights from the FIVESOM team.
            </p>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Platform Updates</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Learn about new features, improvements, and changes to the platform.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Industry Insights</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Expert analysis and trends in the freelancing and gig economy space.
                </p>
              </div>
            </div>
          </section>

          {/* Events Section */}
          <section id="events" className={`mb-16 p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/50 border border-white/20'} shadow-xl`}>
            <div className="flex items-center mb-6">
              <Calendar className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Events
              </h2>
            </div>
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Join our webinars, workshops, and community events to learn and network.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Monthly Webinars</h3>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Expert-led sessions on freelancing tips and platform updates.
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`}>Next: First Friday of every month</p>
              </div>
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Skill Workshops</h3>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Interactive sessions to improve your freelancing skills.
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`}>Various dates throughout the month</p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <div className="text-center mb-16">
            <h2 className={`text-2xl md:text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Frequently Asked Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[{
                question: 'How does the escrow system work?',
                answer: 'Your payment is held securely until you approve the delivered work. This protects both buyers and freelancers.'
              }, {
                question: 'What if I\'m not satisfied with the work?',
                answer: 'You can request revisions or work with our support team to resolve any issues before releasing payment.'
              }, {
                question: 'How do I know if a freelancer is qualified?',
                answer: 'All freelancers have verified profiles, portfolios, ratings, and reviews from previous clients.'
              }, {
                question: 'Are there any hidden fees?',
                answer: 'No, we believe in transparent pricing. All fees are clearly displayed before you make any payment.'
              }].map((faq, index) => <div key={index} className={`backdrop-blur-lg rounded-xl p-6 text-left ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white/50 border border-white/20'}`}>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {faq.question}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {faq.answer}
                  </p>
                </div>)}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Ready to Get Started?
            </h2>
            <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Join thousands of satisfied clients who have grown their businesses with FIVESOM
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-colors">
                Find a Service
              </button>
              <button className={`px-8 py-4 backdrop-blur-lg rounded-xl font-semibold transition-colors ${isDarkMode ? 'bg-gray-800/50 text-white border border-gray-700/50 hover:bg-gray-700/50' : 'bg-white/50 text-gray-900 border border-white/20 hover:bg-white/70'}`}>
                Become a Freelancer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);

};
export default HowItWorks;