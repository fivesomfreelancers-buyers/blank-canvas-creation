import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  freelancerId: string;
}

const FreelancerFAQManager = ({ freelancerId }: Props) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, [freelancerId]);

  const fetchFAQs = async () => {
    const { data } = await supabase
      .from('freelancer_faqs' as any)
      .select('*')
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: true });
    setFaqs((data as any[]) || []);
  };

  const handleAdd = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast({ title: 'Please fill both fields', variant: 'destructive' });
      return;
    }
    setAdding(true);
    const { error } = await supabase
      .from('freelancer_faqs' as any)
      .insert({ freelancer_id: freelancerId, question: newQuestion.trim(), answer: newAnswer.trim() } as any);
    if (error) {
      toast({ title: 'Error adding FAQ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'FAQ added successfully' });
      setNewQuestion('');
      setNewAnswer('');
      setShowForm(false);
      fetchFAQs();
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('freelancer_faqs' as any)
      .delete()
      .eq('id', id);
    if (error) {
      toast({ title: 'Error deleting FAQ', variant: 'destructive' });
    } else {
      toast({ title: 'FAQ deleted' });
      fetchFAQs();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Frequently Asked Questions
        </CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Add FAQ
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
            <Input
              placeholder="Question (e.g., What is your turnaround time?)"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <Textarea
              placeholder="Answer..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={adding} size="sm">
                {adding ? 'Adding...' : 'Save FAQ'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {faqs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <div className="flex items-center">
                  <AccordionTrigger className="flex-1">{faq.question}</AccordionTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(faq.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          !showForm && (
            <p className="text-muted-foreground text-center py-6">
              No FAQs yet. Add some to help buyers understand your services better.
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default FreelancerFAQManager;
