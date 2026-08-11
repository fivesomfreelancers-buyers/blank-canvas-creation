
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, X, Image, Video, FileText, CheckCircle } from 'lucide-react';
import { GigData } from '../../pages/CreateGig';

interface GalleryPublishProps {
  gigData: GigData;
  updateGigData: (data: Partial<GigData>) => void;
  onPrevious: () => void;
  onPublish: () => Promise<void>;
}

const GalleryPublish = ({ gigData, updateGigData, onPrevious, onPublish }: GalleryPublishProps) => {
  const [isPublishing, setIsPublishing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      const totalImages = gigData.images.length + newImages.length;
      
      if (totalImages <= 3) {
        updateGigData({ images: [...gigData.images, ...newImages] });
      }
    }
  };

  const [videoError, setVideoError] = useState<string | null>(null);

  const MAX_VIDEO_SECONDS = 60;

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setVideoError(null);
    const url = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.onloadedmetadata = () => {
      const duration = probe.duration;
      URL.revokeObjectURL(url);
      if (!isFinite(duration)) {
        setVideoError('Could not read the video length. Please try another file.');
        return;
      }
      if (duration > MAX_VIDEO_SECONDS + 0.5) {
        setVideoError(`Video is ${Math.round(duration)}s long. Maximum allowed is 1 minute (60s).`);
        return;
      }
      updateGigData({ video: file });
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      setVideoError('This file is not a supported video format.');
    };
    probe.src = url;
  };

  const handleVideoThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) updateGigData({ videoThumbnail: file });
  };


  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newDocs = Array.from(e.target.files);
      updateGigData({ documents: [...gigData.documents, ...newDocs] });
    }
  };

  const removeImage = (index: number) => {
    const newImages = gigData.images.filter((_, i) => i !== index);
    updateGigData({ images: newImages });
  };

  const removeVideo = () => {
    updateGigData({ video: undefined });
    setVideoError(null);
  };

  const removeVideoThumbnail = () => {
    updateGigData({ videoThumbnail: undefined });
  };


  const removeDocument = (index: number) => {
    const newDocs = gigData.documents.filter((_, i) => i !== index);
    updateGigData({ documents: newDocs });
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish();
    } finally {
      setIsPublishing(false);
    }
  };

  const isValid = true; // Allow publishing even without images

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Step 4: Gallery & Publish</h2>
        <p className="text-muted-foreground">Upload visuals and publish your gig</p>
      </div>

      {/* Gig Images */}
      <div>
        <Label className="text-foreground font-medium text-lg">Gig Images (Optional, up to 3)</Label>
        <p className="text-sm text-muted-foreground mb-2">Upload high-quality images that showcase your work</p>
        
        {/* Current Images */}
        {gigData.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {gigData.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Gig image ${index + 1}`}
                  className="w-full h-32 object-contain bg-muted rounded-lg border"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Images */}
        {gigData.images.length < 3 && (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-cyan-400 transition-colors">
            <Image className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <label htmlFor="images" className="cursor-pointer">
              <span className="font-medium text-cyan-600 hover:text-cyan-500">
                Upload gig images
              </span>
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
              />
            </label>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB each</p>
            <p className="text-xs text-muted-foreground">
              {gigData.images.length}/3 images uploaded
            </p>
          </div>
        )}
      </div>

      {/* Gig Video (Optional) */}
      <div>
        <Label className="text-foreground font-medium text-lg">Gig Video (Optional)</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Add a short video (max 1 minute) and a cover image that shows on top of it
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Video */}
          <div>
            {gigData.video ? (
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
                <Video className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className="text-sm truncate flex-1">{gigData.video.name}</span>
                <Button size="sm" variant="outline" onClick={removeVideo}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-cyan-400 transition-colors h-full flex flex-col justify-center">
                <Video className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <label htmlFor="video" className="cursor-pointer">
                  <span className="font-medium text-cyan-600 hover:text-cyan-500">Upload gig video</span>
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="sr-only"
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-1">MP4 up to 100MB — maximum 1 minute</p>
              </div>
            )}
            {videoError && <p className="text-xs text-destructive mt-2">{videoError}</p>}
          </div>

          {/* Video cover image (thumbnail) */}
          <div>
            {gigData.videoThumbnail ? (
              <div className="relative">
                <img
                  src={URL.createObjectURL(gigData.videoThumbnail)}
                  alt="Video cover"
                  className="w-full h-32 object-contain bg-muted rounded-lg border"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={removeVideoThumbnail}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-cyan-400 transition-colors h-full flex flex-col justify-center">
                <Image className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <label htmlFor="video-thumbnail" className="cursor-pointer">
                  <span className="font-medium text-cyan-600 hover:text-cyan-500">Upload video thumbnail</span>
                  <input
                    id="video-thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleVideoThumbnailUpload}
                    className="sr-only"
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Shown on the video and as your gig card image
                </p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Documents (Optional) */}
      <div>
        <Label className="text-foreground font-medium text-lg">Additional Documents (Optional)</Label>
        <p className="text-sm text-muted-foreground mb-2">Upload portfolios, samples, or other relevant files</p>
        
        {gigData.documents.length > 0 && (
          <div className="space-y-2 mb-4">
            {gigData.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{doc.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeDocument(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-cyan-400 transition-colors">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <label htmlFor="documents" className="cursor-pointer">
            <span className="font-medium text-cyan-600 hover:text-cyan-500">
              Upload documents
            </span>
            <input
              id="documents"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleDocumentUpload}
              className="sr-only"
            />
          </label>
          <p className="text-xs text-muted-foreground mt-1">PDF, DOC, TXT up to 10MB each</p>
        </div>
      </div>

      {/* Publish Summary */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          Ready to Publish
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Title:</strong> {gigData.title}</p>
            <p><strong>Category:</strong> {gigData.category} → {gigData.subcategory}</p>
            <p><strong>Tags:</strong> {gigData.tags.join(', ')}</p>
          </div>
          <div>
            <p><strong>Active Packages:</strong> {Object.values(gigData.packages).filter(pkg => pkg.isActive).length}</p>
            <p><strong>Images:</strong> {gigData.images.length}</p>
            <p><strong>Video:</strong> {gigData.video ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-border">
        <Button onClick={onPrevious} variant="outline" className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>
        
        <Button
          onClick={handlePublish}
          disabled={!isValid || isPublishing}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8"
        >
          {isPublishing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Publish Gig</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default GalleryPublish;
