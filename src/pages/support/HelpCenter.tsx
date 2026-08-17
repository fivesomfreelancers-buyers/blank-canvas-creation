import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, HelpCircle, MessageSquare, ArrowLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';


const HelpCenter = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      title: "Getting Started",
      faqs: [
        {
          question: "How do I create an account on FIVESOM?",
          answer: "Creating an account is simple! Click 'Join' in the top navigation, choose whether you're a freelancer or buyer, and fill out the registration form. You'll need to verify your email address to complete the process."
        },
        {
          question: "What's the difference between freelancer and buyer accounts?",
          answer: "Freelancer accounts allow you to offer services, create gigs, and earn money from your skills. Buyer accounts let you browse services, hire freelancers, and manage projects. You can switch between account types later if needed."
        },
        {
          question: "How do I find the right freelancer for my project?",
          answer: "Use our search and filter tools to browse freelancers by category, budget, rating, and delivery time. Review portfolios, read reviews from previous clients, and check response times before making your decision."
        }
      ]
    },
    {
      title: "Payments & Billing",
      faqs: [
        {
          question: "How does the escrow payment system work?",
          answer: "When you place an order, your payment is held securely in escrow. The freelancer receives payment only after you approve the delivered work. This protects both buyers and freelancers throughout the transaction."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment system."
        },
        {
          question: "When do freelancers get paid?",
          answer: "Freelancers receive payment 7 days after the order is marked complete, giving buyers time to review the work and request revisions if needed. This ensures quality and satisfaction for all parties."
        }
      ]
    },
    {
      title: "Orders & Projects",
      faqs: [
        {
          question: "How do I place an order?",
          answer: "Browse services, select the package that fits your needs, provide project details, and make payment. Your order will be sent to the freelancer, and you'll receive updates throughout the project."
        },
        {
          question: "Can I request revisions?",
          answer: "Yes! Most packages include revisions. Check the gig details for the number of revisions included. You can request changes through the order page, and the freelancer will update the delivery accordingly."
        },
        {
          question: "What if I'm not satisfied with the work?",
          answer: "First, communicate with the freelancer about your concerns and request revisions. If issues persist, contact our support team who will help mediate and find a fair resolution."
        }
      ]
    },
    {
      title: "For Freelancers",
      faqs: [
        {
          question: "How do I create my first gig?",
          answer: "Go to your dashboard, click 'Create New Gig', and fill out all required information including title, description, pricing, and gallery images. Make sure to highlight your unique skills and include relevant keywords for better visibility."
        },
        {
          question: "How can I improve my gig ranking?",
          answer: "Maintain high-quality work, respond quickly to messages, deliver on time, encourage positive reviews, and optimize your gig with relevant keywords and attractive visuals."
        },
        {
          question: "What fees does FIVESOM charge?",
          answer: "Fivesom charges a 15% commission on freelancer withdrawals. When you withdraw your earnings, 15% is deducted as the Fivesom fee and you receive the remaining 85%. Buyers are not charged any extra fee."
        }
      ]
    }
  ];

  const quickHelp = [
    {
      title: "Account Issues",
      description: "Login problems, password reset, profile updates"
    },
    {
      title: "Payment Problems",
      description: "Billing questions, refunds, payment methods"
    },
    {
      title: "Technical Support",
      description: "Site bugs, upload issues, performance problems"
    },
    {
      title: "Safety Concerns",
      description: "Report suspicious activity or inappropriate content"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-muted/30'
    }`}>
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
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
              Help Center
            </h1>
            <p className={isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}>
              Find answers to frequently asked questions and get the help you need
            </p>
          </div>

          {/* Search */}
          <Card className={`mb-8 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-card border-border'
          }`}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-foreground'}>
                Search Help Articles
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help articles..."
                  className="pl-10"
                />
              </div>
            </CardHeader>
          </Card>

          {/* Quick Help */}
          <div className="mb-8">
            <h2 className={`text-xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-foreground'
            }`}>
              Quick Help
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickHelp.map((item, index) => (
                <Card key={index} className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-card border-border hover:bg-muted/30'
                }`}>
                  <CardContent className="p-4">
                    <h3 className={`font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-foreground'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'
                    }`}>
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className={
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-card border-border'
              }>
                <CardHeader>
                  <CardTitle className={`flex items-center ${
                    isDarkMode ? 'text-white' : 'text-foreground'
                  }`}>
                    <HelpCircle className="w-5 h-5 mr-2" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className={
                          isDarkMode ? 'text-gray-200' : 'text-foreground'
                        }>
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className={
                          isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'
                        }>
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Support */}
          <Card className={`mt-8 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-card border-border'
          }`}>
            <CardContent className="p-6 text-center">
              <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${
                isDarkMode ? 'text-cyan-400' : 'text-cyan-500'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-foreground'
              }`}>
                Still need help?
              </h3>
              <p className={`mb-4 ${
                isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'
              }`}>
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <Link to="/support/contact">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  Contact Support
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
