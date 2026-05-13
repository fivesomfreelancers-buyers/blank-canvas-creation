
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Tag, ArrowRight, X } from 'lucide-react';
import { GigData } from '../../pages/CreateGig';
import { CATEGORIES, getCategoryBySlug } from '@/lib/categories';

interface GigOverviewProps {
  gigData: GigData;
  updateGigData: (data: Partial<GigData>) => void;
  onNext: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const GigOverview = ({ gigData, updateGigData, onNext }: GigOverviewProps) => {
  const [newTag, setNewTag] = useState('');
  const activeCategory = getCategoryBySlug(gigData.category);

  const addTag = () => {
    if (newTag.trim() && gigData.tags.length < 5 && !gigData.tags.includes(newTag.trim())) {
      updateGigData({ tags: [...gigData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateGigData({ tags: gigData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleNext = () => {
    if (gigData.title && gigData.category && gigData.subcategory && gigData.tags.length >= 3) {
      onNext();
    }
  };

  const isValid = gigData.title && gigData.category && gigData.subcategory && gigData.tags.length >= 3;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Gig Overview</h2>
        <p className="text-gray-600">Tell us about the service you want to offer</p>
      </div>

      {/* Gig Title */}
      <div>
        <Label htmlFor="title" className="text-gray-700 font-medium text-lg">Gig Title *</Label>
        <p className="text-sm text-gray-500 mb-2">Create a catchy title that clearly describes your service</p>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            id="title"
            value={gigData.title}
            onChange={(e) => updateGigData({ title: e.target.value })}
            className="pl-10 h-12 bg-gray-50/50 border-gray-200"
            placeholder="I will design a professional modern logo"
            maxLength={80}
          />
        </div>
        <div className="text-right text-xs text-gray-500 mt-1">
          {gigData.title.length}/80 characters
        </div>
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category" className="text-gray-700 font-medium text-lg">Category *</Label>
        <select
          id="category"
          value={gigData.category}
          onChange={(e) => updateGigData({ category: e.target.value, subcategory: '' })}
          className="mt-2 w-full h-12 px-3 bg-gray-50/50 border border-gray-200 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="">Select your service category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Subcategory */}
      {gigData.category && (
        <div>
          <Label htmlFor="subcategory" className="text-gray-700 font-medium text-lg">Subcategory *</Label>
          <select
            id="subcategory"
            value={gigData.subcategory}
            onChange={(e) => updateGigData({ subcategory: e.target.value })}
            className="mt-2 w-full h-12 px-3 bg-gray-50/50 border border-gray-200 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="">Select subcategory</option>
            {subcategories[gigData.category]?.map(subcat => (
              <option key={subcat} value={subcat}>{subcat}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tags */}
      <div>
        <Label className="text-gray-700 font-medium text-lg">Tags * (3-5 required)</Label>
        <p className="text-sm text-gray-500 mb-2">Add relevant keywords to help buyers find your gig</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {gigData.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
              <span>{tag}</span>
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>

        {gigData.tags.length < 5 && (
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="pl-10 h-12 bg-gray-50/50 border-gray-200"
                placeholder="Type a tag and press Enter"
                maxLength={20}
              />
            </div>
            <Button onClick={addTag} disabled={!newTag.trim()}>
              Add Tag
            </Button>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-1">
          {gigData.tags.length}/5 tags added {gigData.tags.length < 3 && `(${3 - gigData.tags.length} more required)`}
        </p>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600"
        >
          <span>Next: Pricing Packages</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default GigOverview;
