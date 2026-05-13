
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, Plus, Minus } from 'lucide-react';
import { GigData, FAQ } from '../../pages/CreateGig';

interface GigDescriptionProps {
  gigData: GigData;
  updateGigData: (data: Partial<GigData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const GigDescription = ({ gigData, updateGigData, onNext, onPrevious }: GigDescriptionProps) => {
  const addFAQ = () => {
    if (gigData.faqs.length < 5) {
      updateGigData({ faqs: [...gigData.faqs, { question: '', answer: '' }] });
    }
  };

  const removeFAQ = (index: number) => {
    updateGigData({ faqs: gigData.faqs.filter((_, i) => i !== index) });
  };

  const updateFAQ = (index: number, field: keyof FAQ, value: string) => {
    const updatedFAQs = gigData.faqs.map((faq, i) => 
      i === index ? { ...faq, [field]: value } : faq
    );
    updateGigData({ faqs: updatedFAQs });
  };

  const handleNext = () => {
    if (gigData.description.length >= 120 && gigData.buyerRequirements) {
      onNext();
    }
  };

  const isValid = gigData.description.length >= 120 && gigData.buyerRequirements;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Step 3: Description & Requirements</h2>
        <p className="text-muted-foreground">Provide detailed information about your service</p>
      </div>

      {/* Gig Description */}
      <div>
        <Label htmlFor="description" className="text-foreground font-medium text-lg">Gig Description *</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Provide a detailed explanation of your service, process, and what buyers will receive (minimum 120 characters)
        </p>
        <Textarea
          id="description"
          value={gigData.description}
          onChange={(e) => updateGigData({ description: e.target.value })}
          className="bg-muted/50 border-border min-h-[120px]"
          placeholder="I will create a unique, minimalist logo perfect for your brand, delivered in vector (AI) and high-resolution PNG formats. My design process includes concept development and 3 revisions to ensure your satisfaction..."
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span className={gigData.description.length < 120 ? 'text-red-500' : 'text-green-600'}>
            {gigData.description.length >= 120 ? '✓' : '✗'} Minimum 120 characters
          </span>
          <span>{gigData.description.length}/1000 characters</span>
        </div>
      </div>

      {/* Buyer Requirements */}
      <div>
        <Label htmlFor="buyerRequirements" className="text-foreground font-medium text-lg">Buyer Requirements *</Label>
        <p className="text-sm text-muted-foreground mb-2">
          What information do you need from the buyer to get started?
        </p>
        <Textarea
          id="buyerRequirements"
          value={gigData.buyerRequirements}
          onChange={(e) => updateGigData({ buyerRequirements: e.target.value })}
          className="bg-muted/50 border-border min-h-[80px]"
          placeholder="Please provide your company name, preferred colors, industry, and any existing brand materials. If you have a specific style in mind, please share reference images."
        />
      </div>

      {/* FAQ Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-foreground font-medium text-lg">Frequently Asked Questions (Optional)</Label>
            <p className="text-sm text-muted-foreground">Help buyers understand your service better</p>
          </div>
          <Button
            type="button"
            onClick={addFAQ}
            disabled={gigData.faqs.length >= 5}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add FAQ
          </Button>
        </div>

        {gigData.faqs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <p>No FAQs added yet. Click "Add FAQ" to get started.</p>
          </div>
        )}

        {gigData.faqs.map((faq, index) => (
          <div key={index} className="mb-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">FAQ #{index + 1}</span>
              <Button
                type="button"
                onClick={() => removeFAQ(index)}
                variant="outline"
                size="sm"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Question (e.g., Do you offer source files?)"
                value={faq.question}
                onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                className="bg-card border-border"
              />
              <Textarea
                placeholder="Answer (e.g., Yes, I deliver .AI and .PNG files with the premium package.)"
                value={faq.answer}
                onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                className="bg-card border-border min-h-[60px]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-border">
        <Button onClick={onPrevious} variant="outline" className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600"
        >
          <span>Next: Gallery & Publish</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default GigDescription;
