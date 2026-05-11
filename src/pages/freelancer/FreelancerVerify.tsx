import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Shield, Upload, FileCheck, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const FreelancerVerify = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    skill: '',
    education: '',
    experience: '',
    documentType: '',
    personalNote: ''
  });

  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [selfieWithDocument, setSelfieWithDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');

  // Check existing verification status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('verification_documents')
        .select('status')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setVerificationStatus(data.status as 'pending' | 'approved' | 'rejected');
      }
    };
    checkStatus();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setter(file);
    }
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'email', 'phoneNumber', 'skill', 'documentType'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Validation Error",
          description: `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    // Check if front document is uploaded
    if (!documentFront) {
      toast({
        title: "Validation Error",
        description: "Please upload the front image of your ID document.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "Please log in first.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      // Upload document front to storage
      const frontPath = `${user.id}/front-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(frontPath, documentFront!);

      if (uploadError) {
        // If storage bucket doesn't exist, save document URL as placeholder
        console.warn('Storage upload failed, saving reference:', uploadError);
      }

      const docUrl = uploadError ? `pending-upload-${Date.now()}` : frontPath;

      // Map document type to enum value
      const docTypeMap: Record<string, string> = {
        'passport': 'id',
        'national-id': 'id',
      };

      // Save verification document to database
      const { error: dbError } = await supabase
        .from('verification_documents')
        .insert({
          user_id: user.id,
          document_type: (docTypeMap[formData.documentType] || 'id') as 'id' | 'bank_statement' | 'proof_of_address' | 'business_license',
          document_url: docUrl,
          status: 'pending'
        });

      if (dbError) throw dbError;

      toast({
        title: "✅ Verification Submitted!",
        description: "Your verification request has been submitted successfully. We'll review it within 24-48 hours.",
      });

      setVerificationStatus('pending');
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Verify Your Account</h1>
            </div>
            {getStatusBadge()}
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Complete your profile verification to build trust with potential clients and unlock premium features.
          </p>
        </div>

        {(verificationStatus === 'pending' || verificationStatus === 'approved') && (
          <Card className={`mb-6 ${verificationStatus === 'approved' ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              {verificationStatus === 'approved' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-green-600 mb-2">You're Verified! ✓</h2>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Your account has been verified. You now have a verified badge on your profile.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="w-10 h-10 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-yellow-600 mb-2">Your verification is under review</h2>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Thanks for submitting! Our admin team is reviewing your documents.
                      You'll be notified once your verification is approved (usually within 24–48 hours).
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {verificationStatus === 'rejected' && (
          <Card className="mb-6 border-red-500/30 bg-red-500/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-600">Verification Rejected</p>
                <p className="text-sm text-muted-foreground">Please resubmit with clearer documents. Make sure all information is visible.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {(verificationStatus as string) !== 'pending' && (verificationStatus as string) !== 'approved' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm sm:text-base">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className="h-10 sm:h-12"
                    required
                    disabled={verificationStatus === 'pending'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="h-10 sm:h-12"
                    required
                    disabled={verificationStatus === 'pending'}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm sm:text-base">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+252 61 1234567"
                  className="h-10 sm:h-12"
                  required
                  disabled={verificationStatus === 'pending'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Professional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skill">Skill / Expertise *</Label>
                <Select 
                  value={formData.skill} 
                  onValueChange={(value) => handleInputChange('skill', value)}
                  disabled={verificationStatus === 'pending'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="logo-design">Logo Design</SelectItem>
                    <SelectItem value="web-development">Web Development</SelectItem>
                    <SelectItem value="video-editing">Video Editing</SelectItem>
                    <SelectItem value="content-writing">Content Writing</SelectItem>
                    <SelectItem value="graphic-design">Graphic Design</SelectItem>
                    <SelectItem value="mobile-app">Mobile App Development</SelectItem>
                    <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                    <SelectItem value="ui-ux-design">UI/UX Design</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="education">Education Level</Label>
                  <Select 
                    value={formData.education} 
                    onValueChange={(value) => handleInputChange('education', value)}
                    disabled={verificationStatus === 'pending'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="certification">Professional Certification</SelectItem>
                      <SelectItem value="self-taught">Self-Taught</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Select 
                    value={formData.experience} 
                    onValueChange={(value) => handleInputChange('experience', value)}
                    disabled={verificationStatus === 'pending'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5-10">5-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5" />
                <span>Verify Your Identity *</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Why we need this:</strong> Upload a clear photo of your official ID to verify your identity. 
                  This helps us prevent fake accounts and keep the platform safe for everyone.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type *</Label>
                <Select 
                  value={formData.documentType} 
                  onValueChange={(value) => handleInputChange('documentType', value)}
                  disabled={verificationStatus === 'pending'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="national-id">National ID Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Front Image */}
                <div className="space-y-2">
                  <Label htmlFor="documentFront" className="text-sm font-medium">
                    Front of Document *
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="documentFront"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, setDocumentFront)}
                      disabled={verificationStatus === 'pending'}
                    />
                    <label htmlFor="documentFront" className="cursor-pointer">
                      {documentFront ? (
                        <div className="space-y-2">
                          <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                          <p className="text-sm font-medium text-green-600">{documentFront.name}</p>
                          <p className="text-xs text-muted-foreground">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload front image</p>
                          <p className="text-xs text-muted-foreground">JPG, PNG (max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Back Image */}
                <div className="space-y-2">
                  <Label htmlFor="documentBack" className="text-sm font-medium">
                    Back of Document (if applicable)
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="documentBack"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, setDocumentBack)}
                      disabled={verificationStatus === 'pending'}
                    />
                    <label htmlFor="documentBack" className="cursor-pointer">
                      {documentBack ? (
                        <div className="space-y-2">
                          <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                          <p className="text-sm font-medium text-green-600">{documentBack.name}</p>
                          <p className="text-xs text-muted-foreground">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload back image</p>
                          <p className="text-xs text-muted-foreground">JPG, PNG (max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Selfie with Document */}
              <div className="space-y-2">
                <Label htmlFor="selfieWithDocument" className="text-sm font-medium">
                  Selfie Holding Your Document (Optional)
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  A selfie holding your ID helps speed up the verification process.
                </p>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors max-w-md">
                  <input
                    type="file"
                    id="selfieWithDocument"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setSelfieWithDocument)}
                    disabled={verificationStatus === 'pending'}
                  />
                  <label htmlFor="selfieWithDocument" className="cursor-pointer">
                    {selfieWithDocument ? (
                      <div className="space-y-2">
                        <CheckCircle className="w-8 h-8 mx-auto text-green-500" />
                        <p className="text-sm font-medium text-green-600">{selfieWithDocument.name}</p>
                        <p className="text-xs text-muted-foreground">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload selfie</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG (max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Note */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Note / Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="personalNote">Tell us more about you or your motivation</Label>
                <Textarea
                  id="personalNote"
                  value={formData.personalNote}
                  onChange={(e) => handleInputChange('personalNote', e.target.value)}
                  placeholder="Share your passion, goals, or what makes you unique as a freelancer..."
                  rows={4}
                  disabled={verificationStatus === 'pending'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting || verificationStatus === 'pending' || verificationStatus === 'approved'}
              className="w-full sm:w-auto px-6 sm:px-8"
            >
              {isSubmitting ? 'Submitting...' : verificationStatus === 'pending' ? 'Under Review' : 'Submit Verification'}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default FreelancerVerify;
