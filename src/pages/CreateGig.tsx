import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StepIndicator from '@/components/gig/StepIndicator';
import GigOverview from '@/components/gig/GigOverview';
import PricingPackages from '@/components/gig/PricingPackages';
import GigDescription from '@/components/gig/GigDescription';
import GalleryPublish from '@/components/gig/GalleryPublish';
import { supabase } from '@/integrations/supabase/client';

export interface GigData {
  title: string;
  category: string;
  subcategory: string;
  tags: string[];
  packages: {
    basic: PackageData;
    standard: PackageData;
    premium: PackageData;
  };
  description: string;
  faqs: FAQ[];
  buyerRequirements: string;
  images: File[];
  video?: File;
  documents: File[];
}
export interface PackageData {
  name: string;
  price: string;
  deliveryTime: string;
  revisions: string;
  features: string[];
  isActive: boolean;
}
export interface FAQ {
  question: string;
  answer: string;
}

const CreateGig = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [gigData, setGigData] = useState<GigData>({
    title: '',
    category: '',
    subcategory: '',
    tags: [],
    packages: {
      basic: { name: 'Basic', price: '', deliveryTime: '', revisions: '', features: [], isActive: true },
      standard: { name: 'Standard', price: '', deliveryTime: '', revisions: '', features: [], isActive: false },
      premium: { name: 'Premium', price: '', deliveryTime: '', revisions: '', features: [], isActive: false }
    },
    description: '',
    faqs: [],
    buyerRequirements: '',
    images: [],
    documents: []
  });
  const { toast } = useToast();

  const steps = [
    { number: 1, title: 'Gig Overview', component: GigOverview },
    { number: 2, title: 'Pricing Packages', component: PricingPackages },
    { number: 3, title: 'Description & Requirements', component: GigDescription },
    { number: 4, title: 'Gallery & Publish', component: GalleryPublish }
  ];

  const updateGigData = (stepData: Partial<GigData>) => {
    setGigData(prev => ({ ...prev, ...stepData }));
  };
  const goToNextStep = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };
  const goToPreviousStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handlePublish = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Required", description: "Please log in to create a gig.", variant: "destructive" });
        return;
      }

      // Get or create freelancer record
      let { data: freelancer } = await supabase
        .from('freelancers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!freelancer) {
        const { data: newFreelancer, error: createError } = await supabase
          .from('freelancers')
          .insert({ user_id: user.id })
          .select('id')
          .single();

        if (createError) {
          toast({ title: "Error", description: "Could not create freelancer profile.", variant: "destructive" });
          return;
        }
        freelancer = newFreelancer;
      }

      // Upload images to storage
      const imageUrls: string[] = [];
      for (const imageFile of gigData.images) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('gig-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          // If bucket doesn't exist, just skip image upload
          continue;
        }

        const { data: publicUrl } = supabase.storage
          .from('gig-images')
          .getPublicUrl(fileName);
        
        imageUrls.push(publicUrl.publicUrl);
      }

      // Get active package for pricing
      const activePackage = Object.values(gigData.packages).find(pkg => pkg.isActive);
      if (!activePackage || !activePackage.price) {
        toast({ title: "Package Required", description: "Please set a price for at least one package.", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('gigs')
        .insert({
          freelancer_id: freelancer.id,
          title: gigData.title,
          description: gigData.description || 'No description provided',
          base_price: parseFloat(activePackage.price),
          delivery_time_days: parseInt(activePackage.deliveryTime) || 7,
          images: imageUrls.length > 0 ? imageUrls : null,
          status: 'active'
        });

      if (error) throw error;

      toast({ title: "Gig Published Successfully!", description: "Your gig is now live on the Explore page." });
      navigate('/freelancer/dashboard');
    } catch (error) {
      console.error('Error publishing gig:', error);
      toast({ title: "Error Publishing Gig", description: "Please try again later.", variant: "destructive" });
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 py-4 sm:py-8 px-3 sm:px-4 pt-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-sm sm:text-base text-muted-foreground px-2">Follow these steps to create your service offering</p>
        </div>
        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <StepIndicator currentStep={currentStep} steps={steps} />
        </div>
        <div className="bg-card/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-border mt-4 sm:mt-8">
          <CurrentStepComponent gigData={gigData} updateGigData={updateGigData} onNext={goToNextStep} onPrevious={goToPreviousStep} onPublish={handlePublish} isFirstStep={currentStep === 1} isLastStep={currentStep === 4} />
        </div>
        <div className="mt-4 sm:mt-6 text-center">
          <Link to="/freelancer/dashboard" className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-medium text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default CreateGig;
