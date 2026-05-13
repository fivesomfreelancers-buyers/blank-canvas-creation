import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, 
  MessageSquare, 
  Shield, 
  FileText, 
  Lock, 
  Users, 
  Star, 
  MessageCircleQuestion,
  BookOpen,
  Calendar,
  Search
} from 'lucide-react';
import Navbar from '../../components/Navbar';

const Support = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const supportCategories = [
    {
      title: "Get Help",
      description: "Find answers and get assistance",
      items: [
        {
          icon: HelpCircle,
          title: "Help Center",
          description: "Browse FAQs and common questions",
          link: "/support/help-center",
          color: "from-blue-400 to-cyan-500"
        },
        {
          icon: MessageSquare,
          title: "Contact Us",
          description: "Get in touch with our support team",
          link: "/support/contact",
          color: "from-green-400 to-emerald-500"
        }
      ]
    },
    {
      title: "Safety & Legal",
      description: "Your protection and platform policies",
      items: [
        {
          icon: Shield,
          title: "Trust & Safety",
          description: "Learn how we protect users and payments",
          link: "/support/trust-safety",
          color: "from-purple-400 to-pink-500"
        },
        {
          icon: FileText,
          title: "Terms of Service",
          description: "Platform terms and conditions",
          link: "/support/terms",
          color: "from-orange-400 to-red-500"
        },
        {
          icon: Lock,
          title: "Privacy Policy",
          description: "How we handle your data",
          link: "/support/privacy",
          color: "from-indigo-400 to-purple-500"
        }
      ]
    },
    {
      title: "Community & Resources",
      description: "Connect, learn, and grow with FIVESOM",
      items: [
        {
          icon: Users,
          title: "Community",
          description: "Join our vibrant community hub",
          link: "/support/community",
          color: "from-teal-400 to-blue-500"
        },
        {
          icon: Star,
          title: "Success Stories",
          description: "Real examples of platform success",
          link: "/support/success-stories",
          color: "from-yellow-400 to-orange-500"
        },
        {
          icon: MessageCircleQuestion,
          title: "Community Forum",
          description: "Discuss and ask questions",
          link: "/support/forum",
          color: "from-pink-400 to-red-500"
        },
        {
          icon: BookOpen,
          title: "Freelancer Tips",
          description: "Expert advice for freelancers",
          link: "/support/freelancer-tips",
          color: "from-emerald-400 to-teal-500"
        },
        {
          icon: FileText,
          title: "Blog",
          description: "Latest news and platform updates",
          link: "/support/blog",
          color: "from-blue-400 to-indigo-500"
        },
        {
          icon: Calendar,
          title: "Events",
          description: "Upcoming webinars and workshops",
          link: "/support/events",
          color: "from-violet-400 to-purple-500"
        }
      ]
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-muted/30'
    }`}>
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-foreground'
            }`}>
              Support & Resources
            </h1>
            <p className={`text-xl max-w-3xl mx-auto mb-8 ${
              isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'
            }`}>
              Everything you need to succeed on FIVESOM. Get help, learn best practices, 
              and connect with our community.
            </p>
            
            {/* Quick Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help..."
                  className="pl-10 py-3"
                />
              </div>
            </div>
          </div>

          {/* Support Categories */}
          <div className="space-y-12">
            {supportCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="mb-6">
                  <h2 className={`text-2xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-foreground'
                  }`}>
                    {category.title}
                  </h2>
                  <p className={isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}>
                    {category.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item, itemIndex) => (
                    <Link key={itemIndex} to={item.link}>
                      <Card className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${
                        isDarkMode 
                          ? 'bg-gray-800/50 hover:bg-gray-800/70 border-gray-700' 
                          : 'bg-card hover:bg-muted/30 border-border'
                      }`}>
                        <CardHeader>
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <CardTitle className={`group-hover:text-cyan-500 transition-colors ${
                            isDarkMode ? 'text-white' : 'text-foreground'
                          }`}>
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className={isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}>
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className={`mt-16 p-8 rounded-2xl ${
            isDarkMode 
              ? 'bg-gray-800/50 border border-gray-700' 
              : 'bg-card border border-border'
          }`}>
            <h3 className={`text-xl font-bold mb-4 text-center ${
              isDarkMode ? 'text-white' : 'text-foreground'
            }`}>
              Need Immediate Help?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/support/contact">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  Contact Support
                </Button>
              </Link>
              <Link to="/support/help-center">
                <Button variant="outline" className={
                  isDarkMode ? 'border-gray-600 text-muted-foreground' : 'border-border text-foreground'
                }>
                  Browse Help Center
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
