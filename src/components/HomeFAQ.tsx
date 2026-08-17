import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HOME_FAQ } from '@/lib/seo/homeFaq';

const HomeFAQ: React.FC = () => (
  <section id="faq" aria-labelledby="faq-heading" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          FAQ
        </div>
        <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Frequently asked questions
        </h2>
        <p className="text-muted-foreground">
          Everything about how FIVESOM works for buyers and freelancers.
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {HOME_FAQ.map((item, i) => (
          <AccordionItem
            key={item.question}
            value={`faq-${i}`}
            className="border border-border rounded-xl bg-card px-4"
          >
            <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Still have a question?{' '}
        <Link to="/support" className="text-primary underline">
          Contact FIVESOM support
        </Link>
        {' · '}
        <Link to="/how-it-works" className="text-primary underline">
          See how it works
        </Link>
      </p>
    </div>
  </section>
);

export default HomeFAQ;
