import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Lock, 
  CreditCard, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle,
  ArrowLeft,
  Phone,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useTheme } from '../../components/ThemeProvider';
import { SocialLinks } from '@/components/SocialLinks';

const TrustSafety = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const safetyFeatures = [
    {
      icon: Shield,
      title: "Secure Escrow System",
      description: "Your payments are held securely until you approve the delivered work",
      details: [
        "Payments protected until work is approved",
        "Automatic dispute resolution process",
        "Full refund protection for eligible cases",
        "24/7 transaction monitoring"
      ],
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: UserCheck,
      title: "Verified Freelancers",
      description: "All freelancers go through our verification process",
      details: [
        "Identity verification required",
        "Skill assessments and portfolio reviews",
        "Background checks for premium freelancers",
        "Continuous performance monitoring"
      ],
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Lock,
      title: "Data Protection",
      description: "Your personal and financial information is encrypted and secure",
      details: [
        "Bank-level SSL encryption",
        "PCI DSS compliant payment processing",
        "Regular security audits and updates",
        "GDPR compliant data handling"
      ],
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: CreditCard,
      title: "Payment Security",
      description: "Multiple secure payment methods with fraud protection",
      details: [
        "Major credit cards accepted",
        "PayPal integration for extra security",
        "Advanced fraud detection systems",
        "Secure tokenization of payment data"
      ],
      color: "from-orange-400 to-red-500"
    }
  ];

  const reportingSteps = [
    {
      step: 1,
      title: "Recognize the Issue",
      description: "Identify suspicious behavior, inappropriate content, or policy violations"
    },
    {
      step: 2,
      title: "Document Everything",
      description: "Take screenshots, save messages, and gather evidence"
    },
    {
      step: 3,
      title: "Report Immediately",
      description: "Use our reporting system or contact support directly"
    },
    {
      step: 4,
      title: "Follow Up",
      description: "Our team will investigate and take appropriate action"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-muted/30'
    }`}>
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Link 
              to="/support" 
              className={`inline-flex items-center mb-4 text-cyan-500 hover:text-cyan-600 transition-colors`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Support
            </Link>
            <h1 className={`text-3xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-foreground'
            }`}>
              Trust & Safety
            </h1>
            <p className={`text-xl ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              Your security is our top priority. Learn how we protect users, payments, and data on FIVESOM.
            </p>
          </div>

          {/* Safety Features */}
          <div className="mb-12">
            <h2 className={`text-2xl font-bold mb-8 ${
              isDarkMode ? 'text-white' : 'text-foreground'
            }`}>
              How We Keep You Safe
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {safetyFeatures.map((feature, index) => (
                <Card key={index} className={
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-card border-border'
                }>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className={isDarkMode ? 'text-white' : 'text-foreground'}>
                          {feature.title}
                        </CardTitle>
                        <p className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className={`text-sm ${
                            isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'
                          }`}>
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Reporting Process */}
          <div className="mb-12">
            <h2 className={`text-2xl font-bold mb-8 ${
              isDarkMode ? 'text-white' : 'text-foreground'
            }`}>
              How to Report Issues
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {reportingSteps.map((step, index) => (
                <Card key={index} className={`text-center ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-card border-border'
                }`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-full bg-cyan-500 text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold`}>
                      {step.step}
                    </div>
                    <h3 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-foreground'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Safety Guidelines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className={
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-card border-border'
            }>
              <CardHeader>
                <CardTitle className={`flex items-center ${
                  isDarkMode ? 'text-white' : 'text-foreground'
                }`}>
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Best Practices for Buyers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Always communicate through FIVESOM's messaging system",
                    "Review freelancer profiles, portfolios, and ratings carefully",
                    "Start with smaller projects to test quality",
                    "Provide clear project requirements and expectations",
                    "Use the escrow system - never pay outside the platform",
                    "Report any suspicious behavior immediately"
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className={isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}>
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className={
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-card border-border'
            }>
              <CardHeader>
                <CardTitle className={`flex items-center ${
                  isDarkMode ? 'text-white' : 'text-foreground'
                }`}>
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Best Practices for Freelancers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Complete your profile verification process",
                    "Showcase authentic work in your portfolio",
                    "Communicate professionally and respond promptly",
                    "Deliver high-quality work on time",
                    "Be transparent about project scope and limitations",
                    "Never share personal contact information early on"
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className={isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}>
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          <Card className={`${
            isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className={`font-bold mb-2 ${
                    isDarkMode ? 'text-red-300' : 'text-red-800'
                  }`}>
                    Report Security Issues Immediately
                  </h3>
                  <p className={`mb-4 ${
                    isDarkMode ? 'text-red-200' : 'text-red-700'
                  }`}>
                    If you encounter suspicious activity, fraud attempts, or safety concerns, 
                    contact our security team immediately.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      <Mail className="w-4 h-4 mr-2" />
                      security@fivesom.com
                    </Button>
                    <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                      <Phone className="w-4 h-4 mr-2" />
                      Emergency Hotline: +1 (555) 911-HELP
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrustSafety;
