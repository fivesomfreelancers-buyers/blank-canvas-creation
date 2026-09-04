import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, X, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SOFTWARE_CATALOG, SoftwareDef, findTool } from '@/lib/verificationCatalog';
import ToolIcon from '@/components/ToolIcon';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: any;
  freelancerData: any;
  userId: string;
  onSaved: () => void;
}

const EXPERIENCE_OPTIONS = ['Less than 1 year', '1-2 years', '3-5 years', '5-10 years', '10+ years'];
const EDUCATION_OPTIONS = ['Self-taught', 'High School', 'Diploma / Certificate', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'];
const COMMON_LANGUAGES = ['Somali', 'English', 'Arabic', 'Swahili', 'Amharic', 'French', 'Italian', 'Turkish'];

const EditProfileModal = ({ open, onClose, profile, freelancerData, userId, onSaved }: EditProfileModalProps) => {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [professionalTitle, setProfessionalTitle] = useState(profile?.professional_title || freelancerData?.professional_title || '');
  const [bio, setBio] = useState(freelancerData?.bio || profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [skillsText, setSkillsText] = useState((freelancerData?.skills || []).join(', '));
  const [imageUrl, setImageUrl] = useState(profile?.profile_image_url || '');
  const [languages, setLanguages] = useState<string[]>(profile?.languages || []);
  const [yearsExperience, setYearsExperience] = useState<string>(freelancerData?.years_experience || '');
  const [educationLevel, setEducationLevel] = useState<string>(freelancerData?.education_level || '');
  const [tools, setTools] = useState<SoftwareDef[]>((freelancerData?.software_tools as SoftwareDef[]) || []);
  const [toolPicker, setToolPicker] = useState('');
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
      const { error: uploadErr } = await supabase.storage.from('profile-images').upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from('profile-images').getPublicUrl(path);
      setImageUrl(`${publicUrl}?t=${Date.now()}`);
      toast({ title: 'Image uploaded' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const addLanguage = (lang: string) => {
    const v = lang.trim();
    if (!v || languages.includes(v)) return;
    setLanguages([...languages, v]);
  };

  const addTool = (slug: string) => {
    const def = findTool(slug);
    if (!def || tools.some(t => t.slug === slug)) return;
    setTools([...tools, def]);
    setToolPicker('');
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
          languages,
          profile_image_url: imageUrl || null,
        } as any)
        .eq('id', userId);
      if (profileErr) throw profileErr;

      const { error: freelancerErr } = await supabase
        .from('freelancers')
        .update({
          bio,
          skills,
          professional_title: professionalTitle,
          years_experience: yearsExperience || null,
          education_level: educationLevel || null,
          software_tools: tools as any,
        } as any)
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
        <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={imageUrl} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow" disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {imageUrl && <Button variant="ghost" size="sm" onClick={() => setImageUrl('')}><X className="w-3 h-3 mr-1" /> Remove photo</Button>}
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Professional Title</Label>
            <Input value={professionalTitle} onChange={e => setProfessionalTitle(e.target.value)} placeholder="e.g. Full-stack Web Developer" />
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

          <div className="space-y-2">
            <Label>Languages</Label>
            <div className="flex flex-wrap gap-1.5 mb-1">
              {languages.map(l => (
                <Badge key={l} variant="secondary" className="gap-1">
                  {l}
                  <button onClick={() => setLanguages(languages.filter(x => x !== l))}><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {COMMON_LANGUAGES.filter(l => !languages.includes(l)).map(l => (
                <Button key={l} type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => addLanguage(l)}>
                  <Plus className="w-3 h-3 mr-1" />{l}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Experience</Label>
              <Select value={yearsExperience} onValueChange={setYearsExperience}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{EXPERIENCE_OPTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Education</Label>
              <Select value={educationLevel} onValueChange={setEducationLevel}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{EDUCATION_OPTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Software & Tools</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tools.map(t => (
                <div key={t.slug} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-background text-xs text-foreground/90 hover:border-primary/50 transition-colors">
                  <ToolIcon slug={t.slug} name={t.name} className="w-3.5 h-3.5" />
                  <span>{t.name}</span>
                  <button onClick={() => setTools(tools.filter(x => x.slug !== t.slug))}><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            <Select value={toolPicker} onValueChange={addTool}>
              <SelectTrigger><SelectValue placeholder="Add a tool..." /></SelectTrigger>
              <SelectContent className="max-h-64">
                {SOFTWARE_CATALOG.filter(s => !tools.some(t => t.slug === s.slug)).map(s => (
                  <SelectItem key={s.slug} value={s.slug}>
                    <span className="flex items-center gap-2"><ToolIcon slug={s.slug} name={s.name} className="w-4 h-4" />{s.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
