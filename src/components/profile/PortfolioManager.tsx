import React, { useEffect, useRef, useState } from 'react';
import SmartImage from '@/components/media/SmartImage';
import SmartVideo from '@/components/media/SmartVideo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Upload, ImageIcon, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PortfolioItem {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  position: number;
}

interface Props { freelancerId: string; }

const PortfolioManager: React.FC<Props> = ({ freelancerId }) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('freelancer_portfolio')
      .select('id, media_url, media_type, position')
      .eq('freelancer_id', freelancerId)
      .order('position', { ascending: true });
    setItems((data as PortfolioItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { if (freelancerId) load(); }, [freelancerId]);

  const upload = async (file: File, mediaType: 'image' | 'video') => {
    const sizeLimit = mediaType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > sizeLimit) {
      toast({ title: 'File too large', description: `Max ${mediaType === 'video' ? '50MB' : '10MB'}`, variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('verification-portfolio').upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('verification-portfolio').getPublicUrl(path);
      const nextPos = items.length;
      const { error } = await (supabase as any).from('freelancer_portfolio').insert({
        freelancer_id: freelancerId,
        media_url: pub.publicUrl,
        media_type: mediaType,
        position: nextPos,
      });
      if (error) throw error;
      toast({ title: 'Added to portfolio' });
      load();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this portfolio item?')) return;
    const { error } = await (supabase as any).from('freelancer_portfolio').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Removed' });
      load();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg sm:text-xl">Portfolio</CardTitle>
          <div className="flex gap-2">
            <input ref={imageInput} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'image')} />
            <input ref={videoInput} type="file" accept="video/*" hidden onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'video')} />
            <Button size="sm" variant="outline" disabled={uploading} onClick={() => imageInput.current?.click()}>
              <ImageIcon className="w-4 h-4 mr-1" /> Add image
            </Button>
            <Button size="sm" variant="outline" disabled={uploading} onClick={() => videoInput.current?.click()}>
              <Video className="w-4 h-4 mr-1" /> Add video
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Loading...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No portfolio items yet. Upload images or videos to showcase your work.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map(it => (
              <div key={it.id} className="relative group rounded-md overflow-hidden bg-muted aspect-square">
                {it.media_type === 'image'
                  ? <SmartImage src={it.media_url} alt="Portfolio item" wrapperClassName="w-full h-full" className="w-full h-full object-cover" showRetry />
                  : <SmartVideo src={it.media_url} controls label="portfolio video" />
                }
                <button
                  onClick={() => remove(it.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition"
                  aria-label="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {uploading && <p className="text-xs text-muted-foreground mt-3"><Loader2 className="w-3 h-3 animate-spin inline mr-1" /> Uploading...</p>}
      </CardContent>
    </Card>
  );
};

export default PortfolioManager;
