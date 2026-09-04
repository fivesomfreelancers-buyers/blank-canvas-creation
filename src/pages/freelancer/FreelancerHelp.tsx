import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, HelpCircle, MessageSquare, Mail } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ContactSupportForm from '@/components/support/ContactSupportForm';


const FreelancerHelp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  const faqs = [
    {
      question: "How do I create my first gig?",
      answer: "To create your first gig, go to 'My Gigs' and click 'Create New Gig'. Fill in all the required information including title, description, pricing, and upload relevant images."
    },
    {
      question: "When do I get paid for completed orders?",
      answer: "Payments are processed 7 days after the order is marked as complete. This allows time for the buyer to review the work and request any revisions if needed."
    },
    {
      question: "How can I improve my gig ranking?",
      answer: "Focus on providing high-quality work, maintain good communication with buyers, deliver on time, and encourage satisfied customers to leave positive reviews."
    },
    {
      question: "What should I do if a buyer requests a revision?",
      answer: "Review the buyer's feedback carefully and make the requested changes if they're within the scope of your original offer. Communicate clearly about any additional work that might be outside the original scope."
    },
    {
      question: "How do I handle disputes with buyers?",
      answer: "First, try to resolve the issue directly with the buyer through our messaging system. If that doesn't work, you can contact our support team who will help mediate the dispute."
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
          <p className="text-muted-foreground mt-2">Find answers to common questions and get support</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
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

          {/* Contact Support */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContactSupportForm />
              </CardContent>
            </Card>


            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Freelancer Guidelines
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Community Forum
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="mailto:fivesomsupport@gmail.com">
                    <Mail className="w-4 h-4 mr-2" />
                    fivesomsupport@gmail.com
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerHelp;
