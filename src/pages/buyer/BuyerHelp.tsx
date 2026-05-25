import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, HelpCircle, MessageSquare, Mail, Shield, CreditCard } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import BackToDashboard from '@/components/BackToDashboard';


const BuyerHelp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  const faqs = [
    {
      question: "How does the escrow system work?",
      answer: "Our escrow system protects your payments. When you hire a freelancer, your payment is held securely until you approve the work. You have 7 days to review and request revisions before funds are automatically released."
    },
    {
      question: "What if I'm not satisfied with the work delivered?",
      answer: "If the work doesn't meet your expectations, you can request revisions during the review period. If issues persist, you can contact our support team for assistance with dispute resolution."
    },
    {
      question: "How do I choose the right freelancer?",
      answer: "Look at their portfolio, read reviews from previous clients, check their response time, and consider their expertise in your specific area. Don't hesitate to message them before placing an order."
    },
    {
      question: "Can I get a refund if the freelancer doesn't deliver?",
      answer: "Yes, if a freelancer fails to deliver as promised, you're eligible for a full refund. Our support team will investigate and process refunds for legitimate cases."
    },
    {
      question: "How long does it take to get my project completed?",
      answer: "Delivery times vary by service and freelancer. Each gig listing shows the expected delivery time. Complex projects may take longer, and you can discuss timelines directly with the freelancer."
    }
  ];

  const helpCategories = [
    { icon: Shield, title: "Payment Protection", description: "Learn about our escrow system" },
    { icon: CreditCard, title: "Billing & Refunds", description: "Payment methods and refund policy" },
    { icon: MessageSquare, title: "Communication", description: "How to message freelancers effectively" },
    { icon: HelpCircle, title: "General Support", description: "Common questions and issues" }
  ];

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto">
        <BackToDashboard />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
          <p className="text-muted-foreground mt-2">Get help with your orders and account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Help Content */}
          <div className="lg:col-span-2">
            {/* Search */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Search Help Articles</CardTitle>
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

            {/* Help Categories */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Browse by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {helpCategories.map((category, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-muted/30 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <category.icon className="w-8 h-8 text-purple-600" />
                        <div>
                          <h3 className="font-medium">{category.title}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            {/* Contact Support */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Describe your issue briefly..." />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Please describe your issue in detail..."
                    rows={6}
                  />
                </div>
                <Button className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Follow Fivesom</CardTitle>
              </CardHeader>
              <CardContent>
                <SocialLinks iconSize={22} />
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Payment Protection Guide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Report an Issue
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Support Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9AM - 6PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10AM - 4PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  We aim to respond to all inquiries within 24 hours during business days.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerHelp;
