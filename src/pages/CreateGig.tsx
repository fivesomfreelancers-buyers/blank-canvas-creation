import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  const { gigId } = useParams<{ gigId?: string }>();
  const isEditMode = !!gigId;
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingGig, setLoadingGig] = useState(!!gigId);
  const [gigData, setGigData] = useState<GigData>({
    title: '',
    category: '',
    subcategory: '',
    tags: [],
    packages: {
      basic: { name: 'Basic', price: '', deliveryTime: '', revisions: '', features: [], isActive: true },
      standard: { name: 'Standard', price: '', deliveryTime: '', revisions: '', features: [], isActive: true },
      premium: { name: 'Premium', price: '', deliveryTime: '', revisions: '', features: [], isActive: true }
    },
    description: '',
    faqs: [],
    buyerRequirements: '',
    images: [],
    documents: []
  });
  const { toast } = useToast();

  // Load existing gig data for editing
  useEffect(() => {
    if (!gigId) return;
    const loadGig = async () => {
      try {
        const { data: gig } = await supabase.from('gigs').select('*').eq('id', gigId).single();
        if (!gig) { navigate('/freelancer/gigs'); return; }

        const { data: packages } = await supabase.from('gig_packages').select('*').eq('gig_id', gigId);

        const pkgMap: any = {
          basic: { name: 'Basic', price: '', deliveryTime: '', revisions: '', features: [], isActive: false },
          standard: { name: 'Standard', price: '', deliveryTime: '', revisions: '', features: [], isActive: false },
          premium: { name: 'Premium', price: '', deliveryTime: '', revisions: '', features: [], isActive: false },
        };
        (packages || []).forEach((p: any) => {
          pkgMap[p.package_type] = {
            name: p.name,
            price: String(p.price),
            deliveryTime: p.delivery_time || '',
            revisions: p.revisions || '',
            features: p.features || [],
            isActive: p.is_active,
          };
        });

        // Load FAQs
        const { data: freelancer } = await supabase.from('freelancers').select('id').eq('id', gig.freelancer_id).single();
        let faqs: FAQ[] = [];
        if (freelancer) {
          const { data: faqData } = await supabase.from('freelancer_faqs').select('*').eq('freelancer_id', freelancer.id);
          faqs = (faqData || []).map((f: any) => ({ question: f.question, answer: f.answer }));
        }

        setGigData({
          title: gig.title,
          category: '',
          subcategory: '',
          tags: gig.tags || [],
          packages: pkgMap,
          description: gig.description || '',
          faqs,
          buyerRequirements: gig.buyer_requirements || '',
          images: [],
          documents: [],
        });
      } catch (err) {
        console.error('Error loading gig:', err);
      } finally {
        setLoadingGig(false);
      }
    };
    loadGig();
  }, [gigId]);

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

      let { data: freelancer } = await supabase.from('freelancers').select('id').eq('user_id', user.id).single();
      if (!freelancer) {
        const { data: newFreelancer, error: createError } = await supabase.from('freelancers').insert({ user_id: user.id }).select('id').single();
        if (createError) { toast({ title: "Error", description: "Could not create freelancer profile.", variant: "destructive" }); return; }
        freelancer = newFreelancer;
      }

      // Upload images
      const imageUrls: string[] = [];
      for (const imageFile of gigData.images) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('gig-images').upload(fileName, imageFile);
        if (uploadError) { console.error('Image upload error:', uploadError); continue; }
        const { data: publicUrl } = supabase.storage.from('gig-images').getPublicUrl(fileName);
        imageUrls.push(publicUrl.publicUrl);
      }

      // Upload video (if any) to gig-media bucket
      let videoUrl: string | null = null;
      if (gigData.video) {
        const ext = gigData.video.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { error: vErr } = await supabase.storage.from('gig-media').upload(fileName, gigData.video, { contentType: gigData.video.type || 'video/mp4' });
        if (vErr) { console.error('Video upload error:', vErr); }
        else { videoUrl = supabase.storage.from('gig-media').getPublicUrl(fileName).data.publicUrl; }
      }

      // Upload documents
      const docUrls: { url: string; name: string }[] = [];
      for (const doc of gigData.documents) {
        const ext = doc.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { error: dErr } = await supabase.storage.from('gig-media').upload(fileName, doc, { contentType: doc.type || 'application/octet-stream' });
        if (dErr) { console.error('Doc upload error:', dErr); continue; }
        docUrls.push({ url: supabase.storage.from('gig-media').getPublicUrl(fileName).data.publicUrl, name: doc.name });
      }

      const activePackage = Object.values(gigData.packages).find(pkg => pkg.isActive);
      if (!activePackage || !activePackage.price) {
        toast({ title: "Package Required", description: "Please set a price for at least one package.", variant: "destructive" });
        return;
      }

      const thumbnailUrl = imageUrls.length > 0 ? imageUrls[0] : null;

      let gigRecord: any;

      if (isEditMode && gigId) {
        // Update existing gig
        const updateData: any = {
          title: gigData.title,
          description: gigData.description || 'No description provided',
          base_price: parseFloat(activePackage.price),
          delivery_time_days: parseInt(activePackage.deliveryTime) || 7,
          status: 'active',
          tags: gigData.tags,
          buyer_requirements: gigData.buyerRequirements,
        };
        if (imageUrls.length > 0) {
          updateData.images = imageUrls;
          updateData.thumbnail_url = thumbnailUrl;
        }

        const { data, error } = await supabase.from('gigs').update(updateData).eq('id', gigId).select().single();
        if (error) throw error;
        gigRecord = data;

        // Delete old packages and re-insert
        await supabase.from('gig_packages').delete().eq('gig_id', gigId);
      } else {
        // Create new gig
        const { data, error } = await supabase.from('gigs').insert({
          freelancer_id: freelancer.id,
          title: gigData.title,
          description: gigData.description || 'No description provided',
          base_price: parseFloat(activePackage.price),
          delivery_time_days: parseInt(activePackage.deliveryTime) || 7,
          images: imageUrls.length > 0 ? imageUrls : null,
          thumbnail_url: thumbnailUrl,
          status: 'active',
          tags: gigData.tags,
          buyer_requirements: gigData.buyerRequirements,
        }).select().single();
        if (error) throw error;
        gigRecord = data;
      }

      // Insert packages
      const packageEntries = Object.entries(gigData.packages)
        .filter(([, pkg]) => pkg.isActive)
        .map(([type, pkg]) => ({
          gig_id: gigRecord.id,
          package_type: type,
          name: pkg.name,
          price: parseFloat(pkg.price) || 0,
          delivery_time: pkg.deliveryTime,
          revisions: pkg.revisions,
          features: pkg.features,
          is_active: true,
        }));

      if (packageEntries.length > 0) {
        const { error: pkgError } = await supabase.from('gig_packages').insert(packageEntries);
        if (pkgError) console.error('Error saving packages:', pkgError);
      }

      // Save FAQs
      if (gigData.faqs.length > 0 && freelancer) {
        // Delete old FAQs for this freelancer then re-insert
        if (isEditMode) {
          await supabase.from('freelancer_faqs').delete().eq('freelancer_id', freelancer.id);
        }
        const faqEntries = gigData.faqs
          .filter(f => f.question.trim() && f.answer.trim())
          .map(f => ({ freelancer_id: freelancer.id, question: f.question, answer: f.answer }));
        if (faqEntries.length > 0) {
          await supabase.from('freelancer_faqs').insert(faqEntries);
        }
      }

      toast({ title: isEditMode ? "Gig Updated!" : "Gig Published Successfully!", description: isEditMode ? "Your gig has been updated." : "Your gig is now live on the Explore page." });
      navigate('/freelancer/gigs');
    } catch (error) {
      console.error('Error publishing gig:', error);
      toast({ title: "Error Publishing Gig", description: "Please try again later.", variant: "destructive" });
    }
  };

  if (loadingGig) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading gig data...</div>;
  }

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 py-4 sm:py-8 px-3 sm:px-4 pt-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">{isEditMode ? 'Edit Gig' : 'Create New Gig'}</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">Follow these steps to {isEditMode ? 'update' : 'create'} your service offering</p>
        </div>
        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <StepIndicator currentStep={currentStep} steps={steps} />
        </div>
        <div className="bg-card/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-border mt-4 sm:mt-8">
          <CurrentStepComponent gigData={gigData} updateGigData={updateGigData} onNext={goToNextStep} onPrevious={goToPreviousStep} onPublish={handlePublish} isFirstStep={currentStep === 1} isLastStep={currentStep === 4} />
        </div>
        <div className="mt-4 sm:mt-6 text-center">
          <Link to="/freelancer/gigs" className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-medium text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Gigs</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default CreateGig;
