import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Eye, Image as ImageIcon, Video as VideoIcon, ExternalLink } from 'lucide-react';
import { SomAdCreative } from '@/components/ads/SomAdSlot';

type Placement = 'dashboard_banner' | 'gig_price';
type Audience = 'all' | 'buyers' | 'freelancers';

// Placement frame ratios (WYSIWYG preview matches the live slot)
const PLACEMENT_META: Record<Placement, { label: string; ratio: string; aspect: number; desc: string }> = {
  dashboard_banner: {
    label: 'Dashboard Welcome Banner',
    ratio: '1200 × 160',
    aspect: 1200 / 160,
    desc: 'Buluugga "Welcome back" ee dashboard-ka. Wide banner.',
  },
  gig_price: {
    label: 'Gigs Price Section',
    ratio: '600 × 120',
    aspect: 600 / 120,
    desc: 'Horizontal ad ku dhow qiimaha gig-ka.',
  },
};

interface AdForm {
  id?: string;
  title: string;
  placement: Placement;
  media_path: string;
  media_type: 'image' | 'video';
  focal_x: number;
  focal_y: number;
  zoom: number;
  cta_text: string;
  cta_url: string;
  cta_style: string;
  cta_color: string;
  cta_size: string;
  cta_position: string;
  audience: Audience;
  is_active: boolean;
}

const EMPTY_FORM: AdForm = {
  title: '',
  placement: 'dashboard_banner',
  media_path: '',
  media_type: 'image',
  focal_x: 50,
  focal_y: 50,
  zoom: 1,
  cta_text: 'Learn More',
  cta_url: '',
  cta_style: 'solid',
  cta_color: '#00A3FF',
  cta_size: 'md',
  cta_position: 'bottom-right',
  audience: 'all',
  is_active: false,
};

export default function AdminSomAdz() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<AdForm>(EMPTY_FORM);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragState = useRef<{ dragging: boolean; startX: number; startY: number; fx: number; fy: number; rect: DOMRect | null }>({
    dragging: false, startX: 0, startY: 0, fx: 50, fy: 50, rect: null,
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Fivesom_ad')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast({ title: 'Failed to load ads', description: error.message, variant: 'destructive' });
    setAds(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('admin-somadz')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Fivesom_ad' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setMediaPreviewUrl('');
    setEditorOpen(true);
  };

  const openEdit = async (row: any) => {
    setForm({
      id: row.id,
      title: row.title,
      placement: row.placement,
      media_path: row.media_path,
      media_type: row.media_type,
      focal_x: Number(row.focal_x),
      focal_y: Number(row.focal_y),
      zoom: Number(row.zoom),
      cta_text: row.cta_text || '',
      cta_url: row.cta_url || '',
      cta_style: row.cta_style,
      cta_color: row.cta_color,
      cta_size: row.cta_size,
      cta_position: row.cta_position,
      audience: row.audience,
      is_active: row.is_active,
    });
    const { data } = await supabase.storage.from('somadz-media').createSignedUrl(row.media_path, 3600);
    setMediaPreviewUrl(data?.signedUrl || '');
    setEditorOpen(true);
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      toast({ title: 'Fayl aan la aqbali karin', description: 'Kaliya sawir (JPG/PNG/WebP) ama video (MP4).', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id || 'anon';
    const ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
    const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('somadz-media').upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    setUploading(false);
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return;
    }
    const { data: signed } = await supabase.storage.from('somadz-media').createSignedUrl(path, 3600);
    setForm(f => ({ ...f, media_path: path, media_type: isVideo ? 'video' : 'image', focal_x: 50, focal_y: 50, zoom: 1 }));
    setMediaPreviewUrl(signed?.signedUrl || '');
  };

  const save = async () => {
    if (!form.title.trim()) { toast({ title: 'Title waa lagama maarmaan', variant: 'destructive' }); return; }
    if (!form.media_path) { toast({ title: 'Please upload an image or video', variant: 'destructive' }); return; }
    setSaving(true);
    const payload: any = {
      title: form.title.trim(),
      placement: form.placement,
      media_path: form.media_path,
      media_type: form.media_type,
      focal_x: form.focal_x,
      focal_y: form.focal_y,
      zoom: form.zoom,
      cta_text: form.cta_text?.trim() || null,
      cta_url: form.cta_url?.trim() || null,
      cta_style: form.cta_style,
      cta_color: form.cta_color,
      cta_size: form.cta_size,
      cta_position: form.cta_position,
      audience: form.audience,
      is_active: form.is_active,
    };
    let err;
    if (form.id) {
      ({ error: err } = await supabase.from('Fivesom_ad').update(payload).eq('id', form.id));
    } else {
      const { data: u } = await supabase.auth.getUser();
      payload.created_by = u.user?.id;
      ({ error: err } = await supabase.from('Fivesom_ad').insert(payload));
    }
    setSaving(false);
    if (err) { toast({ title: 'Save failed', description: err.message, variant: 'destructive' }); return; }
    toast({ title: form.id ? 'Ad updated' : 'Ad created' });
    setEditorOpen(false);
    load();
  };

  const toggleActive = async (row: any) => {
    const { error } = await supabase.from('Fivesom_ad').update({ is_active: !row.is_active }).eq('id', row.id);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else load();
  };

  const remove = async (row: any) => {
    if (!confirm('Xayeysiiskan si buuxda ma ka tirtiraysaa?')) return;
    await supabase.storage.from('somadz-media').remove([row.media_path]);
    const { error } = await supabase.from('Fivesom_ad').delete().eq('id', row.id);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Ad removed' }); load(); }
  };

  // Frame drag → focal point
  const onFrameMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dragState.current = {
      dragging: true, startX: e.clientX, startY: e.clientY,
      fx: form.focal_x, fy: form.focal_y, rect,
    };
  };
  const onFrameMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s.dragging || !s.rect) return;
    const dx = ((e.clientX - s.startX) / s.rect.width) * 100;
    const dy = ((e.clientY - s.startY) / s.rect.height) * 100;
    const nx = Math.max(0, Math.min(100, s.fx - dx));
    const ny = Math.max(0, Math.min(100, s.fy - dy));
    setForm(f => ({ ...f, focal_x: nx, focal_y: ny }));
  };
  const onFrameMouseUp = () => { dragState.current.dragging = false; };

  const meta = PLACEMENT_META[form.placement];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fivesom Ads</h2>
          <p className="text-sm text-muted-foreground">Maamul xayeysiisyada Dashboard Banner iyo Gigs Price Section.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> New Ad</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All Ads</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : ads.length === 0 ? (
            <p className="text-muted-foreground text-sm">Weli ma jiraan xayeysiisyo. Guji "New Ad" si aad u bilowdo.</p>
          ) : (
            <div className="space-y-3">
              {ads.map(row => (
                <AdRow
                  key={row.id}
                  row={row}
                  onEdit={() => openEdit(row)}
                  onToggle={() => toggleActive(row)}
                  onDelete={() => remove(row)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit Ad' : 'New Ad'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT: Settings */}
            <div className="space-y-4">
              <div>
                <Label>Title (internal)</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Summer promo banner" />
              </div>

              <div>
                <Label>Placement</Label>
                <RadioGroup
                  value={form.placement}
                  onValueChange={(v) => setForm({ ...form, placement: v as Placement, focal_x: 50, focal_y: 50, zoom: 1 })}
                  className="grid grid-cols-1 gap-2 mt-1"
                >
                  {(Object.keys(PLACEMENT_META) as Placement[]).map(p => (
                    <label key={p} className="flex items-start gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/40">
                      <RadioGroupItem value={p} className="mt-1" />
                      <div>
                        <div className="font-medium text-sm">{PLACEMENT_META[p].label}</div>
                        <div className="text-xs text-muted-foreground">{PLACEMENT_META[p].ratio} — {PLACEMENT_META[p].desc}</div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Upload media (image / video)</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />
                <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full">
                  {uploading ? 'Uploading…' : form.media_path ? 'Replace media' : 'Choose file'}
                </Button>
              </div>

              {form.media_path && (
                <>
                  <div>
                    <Label>Zoom ({form.zoom.toFixed(2)}×)</Label>
                    <Slider value={[form.zoom]} min={1} max={3} step={0.05} onValueChange={([v]) => setForm({ ...form, zoom: v })} />
                    <p className="text-xs text-muted-foreground mt-1">Jiid frame-ka si aad u dhaqaajiso focal point.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>CTA Text</Label>
                      <Input value={form.cta_text} onChange={e => setForm({ ...form, cta_text: e.target.value })} placeholder="Learn More" />
                    </div>
                    <div>
                      <Label>CTA URL</Label>
                      <Input value={form.cta_url} onChange={e => setForm({ ...form, cta_url: e.target.value })} placeholder="https://…" />
                    </div>
                    <div>
                      <Label>Style</Label>
                      <Select value={form.cta_style} onValueChange={v => setForm({ ...form, cta_style: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="outline">Outline</SelectItem>
                          <SelectItem value="ghost">Ghost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Size</Label>
                      <Select value={form.cta_size} onValueChange={v => setForm({ ...form, cta_size: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sm">Small</SelectItem>
                          <SelectItem value="md">Medium</SelectItem>
                          <SelectItem value="lg">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Color</Label>
                      <div className="flex gap-2">
                        <input type="color" value={form.cta_color} onChange={e => setForm({ ...form, cta_color: e.target.value })} className="h-10 w-14 rounded border" />
                        <Input value={form.cta_color} onChange={e => setForm({ ...form, cta_color: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Select value={form.cta_position} onValueChange={v => setForm({ ...form, cta_position: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top-left">Top left</SelectItem>
                          <SelectItem value="top-center">Top center</SelectItem>
                          <SelectItem value="top-right">Top right</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="bottom-left">Bottom left</SelectItem>
                          <SelectItem value="bottom-center">Bottom center</SelectItem>
                          <SelectItem value="bottom-right">Bottom right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Audience</Label>
                    <Select value={form.audience} onValueChange={v => setForm({ ...form, audience: v as Audience })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All users</SelectItem>
                        <SelectItem value="buyers">Buyers only</SelectItem>
                        <SelectItem value="freelancers">Freelancers only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <div className="font-medium text-sm">Active</div>
                      <div className="text-xs text-muted-foreground">Marka la shido, xayeysiiska waa la muujiyaa.</div>
                    </div>
                    <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                  </div>
                </>
              )}
            </div>

            {/* RIGHT: Preview */}
            <div className="space-y-3">
              <Label>Live preview — {meta.label} ({meta.ratio})</Label>
              <div
                className="relative w-full bg-muted/40 rounded-lg border-2 border-dashed border-primary/40 select-none"
                style={{ aspectRatio: `${meta.aspect}` }}
                onMouseDown={onFrameMouseDown}
                onMouseMove={onFrameMouseMove}
                onMouseUp={onFrameMouseUp}
                onMouseLeave={onFrameMouseUp}
              >
                {/* Rule of thirds guides */}
                <div className="pointer-events-none absolute inset-0 z-20">
                  <div className="absolute top-1/3 left-0 right-0 border-t border-white/40" />
                  <div className="absolute top-2/3 left-0 right-0 border-t border-white/40" />
                  <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/40" />
                  <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/40" />
                </div>

                {form.media_path && mediaPreviewUrl ? (
                  <SomAdCreative
                    ad={{
                      id: 'preview',
                      title: form.title,
                      placement: form.placement,
                      media_path: form.media_path,
                      media_type: form.media_type,
                      media_url: mediaPreviewUrl,
                      focal_x: form.focal_x,
                      focal_y: form.focal_y,
                      zoom: form.zoom,
                      cta_text: form.cta_text || null,
                      cta_url: form.cta_url || null,
                      cta_style: form.cta_style,
                      cta_color: form.cta_color,
                      cta_size: form.cta_size,
                      cta_position: form.cta_position,
                      audience: form.audience,
                      is_active: form.is_active,
                    }}
                    className="cursor-move"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                    Upload media to see a preview
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                The image or video fills the frame completely. Drag the frame to move the focal point, and use the zoom slider to get closer.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : form.id ? 'Save changes' : 'Create ad'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdRow({ row, onEdit, onToggle, onDelete }: { row: any; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  const [thumb, setThumb] = useState<string>('');
  useEffect(() => {
    let cancelled = false;
    supabase.storage.from('somadz-media').createSignedUrl(row.media_path, 3600).then(({ data }) => {
      if (!cancelled) setThumb(data?.signedUrl || '');
    });
    return () => { cancelled = true; };
  }, [row.media_path]);

  return (
    <div className="flex items-center gap-4 rounded-lg border p-3">
      <div className="h-14 w-24 rounded overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
        {thumb && row.media_type === 'image' && (
          <img src={thumb} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${row.focal_x}% ${row.focal_y}%` }} />
        )}
        {thumb && row.media_type === 'video' && (
          <video src={thumb} className="w-full h-full object-cover" muted />
        )}
        {!thumb && (row.media_type === 'video' ? <VideoIcon className="h-5 w-5 text-muted-foreground" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{row.title}</span>
          <Badge variant={row.is_active ? 'default' : 'outline'}>{row.is_active ? 'Active' : 'Inactive'}</Badge>
          <Badge variant="secondary">{PLACEMENT_META[row.placement as Placement]?.label || row.placement}</Badge>
          <Badge variant="outline">{row.audience}</Badge>
        </div>
        {row.cta_url && (
          <a href={row.cta_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary inline-flex items-center gap-1 mt-1 truncate">
            <ExternalLink className="h-3 w-3" /> {row.cta_url}
          </a>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Switch checked={row.is_active} onCheckedChange={onToggle} />
        <Button size="sm" variant="ghost" onClick={onEdit}><Edit className="h-4 w-4" /></Button>
        <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
    </div>
  );
}
