import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Image, Video, X, Plus, Link2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';

const SubmitRequirements = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [instructions, setInstructions] = useState('');
  const [externalLinks, setExternalLinks] = useState<string[]>(['']);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const totalSize = [...uploadedFiles, ...newFiles].reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        toast({ title: "Files too large", description: "Total file size must be under 50MB", variant: "destructive" });
        return;
      }
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addLinkField = () => {
    setExternalLinks(prev => [...prev, '']);
  };

  const updateLink = (index: number, value: string) => {
    setExternalLinks(prev => prev.map((link, i) => i === index ? value : link));
  };

  const removeLink = (index: number) => {
    setExternalLinks(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return <Image className="w-5 h-5 text-blue-500" />;
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) return <Video className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-muted-foreground" />;
  };

  const handleSubmit = async () => {
    if (!orderId) return;
    if (!instructions.trim() && uploadedFiles.length === 0) {
      toast({ title: "Missing Requirements", description: "Please add instructions or upload files.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const validLinks = externalLinks.filter(l => l.trim().length > 0);

      // Create order requirements record
      const { data: reqData, error: reqError } = await supabase
        .from('order_requirements')
        .insert({
          order_id: orderId,
          instructions: instructions.trim() || null,
          external_links: validLinks.length > 0 ? validLinks : [],
        })
        .select()
        .single();

      if (reqError) throw reqError;

      // Upload files to storage and save records
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const filePath = `${orderId}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('order-requirements')
            .upload(filePath, file);

          if (uploadError) {
            console.error('File upload error:', uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('order-requirements')
            .getPublicUrl(filePath);

          await supabase.from('order_requirement_files').insert({
            order_requirement_id: reqData.id,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
          });
        }
      }

      // Update order status to in_progress
      await supabase.from('orders').update({ status: 'in_progress' }).eq('id', orderId);

      toast({ title: "Requirements Submitted! 🎉", description: "The freelancer can now start working on your project." });
      navigate(`/buyer/orders/${orderId}`, { replace: true });
    } catch (error) {
      console.error('Error submitting requirements:', error);
      toast({ title: "Error", description: "Failed to submit requirements. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/buyer/dashboard')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Submit Your Requirements</h1>
          <p className="text-muted-foreground mt-2">
            Provide all necessary details and files so the freelancer can start your project without delay.
          </p>
        </div>

        <div className="space-y-6">
          {/* Info Banner */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Help the freelancer deliver the best results</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Be as detailed as possible in your instructions</li>
                  <li>Upload reference files, mockups, or brand assets</li>
                  <li>Include links to Google Drive, YouTube, or any external resources</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Describe exactly what you need, including style preferences, brand colors, specific requirements, deadlines, etc..."
                rows={6}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-1">Drag and drop files or click to browse</p>
                <p className="text-xs text-muted-foreground mb-3">Images, Videos, Documents, ZIP — Max 50MB total</p>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="req-files"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar,.ai,.psd,.sketch,.fig,.xd"
                />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('req-files')?.click()}>
                  Choose Files
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.name)}
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="text-destructive hover:text-destructive">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* External Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                External Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {externalLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={link}
                    onChange={(e) => updateLink(index, e.target.value)}
                    placeholder="https://drive.google.com/... or YouTube link"
                    className="flex-1"
                  />
                  {externalLinks.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeLink(index)} className="text-destructive">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addLinkField} className="mt-2">
                <Plus className="w-4 h-4 mr-1" />
                Add Another Link
              </Button>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate('/buyer/orders')}>
              Skip for Now
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-40">
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Requirements
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitRequirements;
