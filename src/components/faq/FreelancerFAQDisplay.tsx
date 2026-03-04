import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  freelancerId: string;
}

const FreelancerFAQDisplay = ({ freelancerId }: Props) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    const fetchFAQs = async () => {
      const { data } = await supabase
        .from('freelancer_faqs' as any)
        .select('*')
        .eq('freelancer_id', freelancerId)
        .order('created_at', { ascending: true });
      setFaqs((data as any[]) || []);
    };
    if (freelancerId) fetchFAQs();
  }, [freelancerId]);

  if (faqs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FreelancerFAQDisplay;
