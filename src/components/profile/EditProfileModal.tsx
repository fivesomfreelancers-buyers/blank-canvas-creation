import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: any;
  freelancerData: any;
  userId: string;
  onSaved: () => void;
}

const EditProfileModal = ({ open, onClose, profile, freelancerData, userId, onSaved }: EditProfileModalProps) => {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [professionalTitle, setProfessionalTitle] = useState(profile?.professional_title || '');
  const [bio, setBio] = useState(freelancerData?.bio || profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [skillsText, setSkillsText] = useState((freelancerData?.skills || []).join(', '));
  const [imageUrl, setImageUrl] = useState(profile?.profile_image_url || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('profile-images')
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(path);

      // Add cache-bust
      setImageUrl(`${publicUrl}?t=${Date.now()}`);
      toast({ title: 'Image uploaded' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          professional_title: professionalTitle,
          bio,
          location,
          skills,
          profile_image_url: imageUrl || null,
        })
        .eq('id', userId);
      if (profileErr) throw profileErr;

      const { error: freelancerErr } = await supabase
        .from('freelancers')
        .update({ bio, skills })
        .eq('user_id', userId);
      if (freelancerErr) throw freelancerErr;

      toast({ title: 'Profile updated!' });
      onSaved();
      onClose();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const initials = fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={imageUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow"
                disabled={uploading}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {imageUrl && (
              <Button variant="ghost" size="sm" onClick={() => setImageUrl('')}>
                <X className="w-3 h-3 mr-1" /> Remove photo
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Professional Title</Label>
            <Input value={professionalTitle} onChange={e => setProfessionalTitle(e.target.value)} placeholder="e.g. Web Developer" />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Tell buyers about yourself..." />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Mogadishu, Somalia" />
          </div>

          <div className="space-y-2">
            <Label>Skills (comma-separated)</Label>
            <Input value={skillsText} onChange={e => setSkillsText(e.target.value)} placeholder="React, Node.js, Design" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
