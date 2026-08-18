import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2, Upload, Users } from 'lucide-react';
import { sortTeam, type TeamMember } from '@/pages/About';

const SOCIAL_KEYS = ['x', 'linkedin', 'instagram', 'facebook', 'website'] as const;

type FormState = {
  id?: string;
  full_name: string;
  job_title: string;
  description: string;
  profile_image: string;
  is_active: boolean;
  social: Record<string, string>;
};

const emptyForm = (): FormState => ({
  full_name: '',
  job_title: '',
  description: '',
  profile_image: '',
  is_active: true,
  social: {},
});

const AdminAboutTeam = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from('about_team_members')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) {
      toast({ title: 'Could not load team members', description: error.message, variant: 'destructive' });
    } else {
      setRows(sortTeam((data ?? []) as unknown as TeamMember[]));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('about-team-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'about_team_members' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const startCreate = () => { setForm(emptyForm()); setOpen(true); };

  const startEdit = (m: TeamMember) => {
    setForm({
      id: m.id,
      full_name: m.full_name,
      job_title: m.job_title,
      description: m.description ?? '',
      profile_image: m.profile_image ?? '',
      is_active: m.is_active,
      social: (m.social_links ?? {}) as Record<string, string>,
    });
    setOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Images only', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/about-team/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('profile-images').upload(path, file, { upsert: true });
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } else {
      const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
      setForm((f) => ({ ...f, profile_image: data.publicUrl }));
    }
    setUploading(false);
  };

  const save = async () => {
    if (!form.full_name.trim() || !form.job_title.trim()) {
      toast({ title: 'Full name and job title are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const social = Object.fromEntries(
      Object.entries(form.social).filter(([, v]) => (v ?? '').trim() !== ''),
    );
    const payload = {
      full_name: form.full_name.trim(),
      job_title: form.job_title.trim(),
      description: form.description.trim() || null,
      profile_image: form.profile_image.trim() || null,
      is_active: form.is_active,
      social_links: social,
    };

    const { error } = form.id
      ? await supabase.from('about_team_members').update(payload).eq('id', form.id)
      : await supabase.from('about_team_members').insert({
          ...payload,
          display_order: rows.length ? Math.max(...rows.map((r) => r.display_order ?? 0)) + 1 : 0,
        });

    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: form.id ? 'Team member updated' : 'Team member added' });
    setOpen(false);
    load();
  };

  const remove = async (m: TeamMember) => {
    if (!window.confirm(`Delete ${m.full_name}?`)) return;
    const { error } = await supabase.from('about_team_members').delete().eq('id', m.id);
    if (error) toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Team member deleted' }); load(); }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const a = rows[index];
    const b = rows[target];
    const next = [...rows];
    next[index] = b; next[target] = a;
    setRows(next);
    await Promise.all(
      next.map((m, i) => supabase.from('about_team_members').update({ display_order: i }).eq('id', m.id)),
    );
    load();
  };

  const toggleActive = async (m: TeamMember) => {
    const { error } = await supabase
      .from('about_team_members')
      .update({ is_active: !m.is_active })
      .eq('id', m.id);
    if (error) toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    else load();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> About / Team
          </CardTitle>
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4 mr-1" /> Add member
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Members appear on the public About page instantly. The CEO is always shown first.
          </p>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No team members yet. Add the first one to populate the About page.
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  {m.profile_image ? (
                    <img src={m.profile_image} alt={m.full_name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{m.full_name}</p>
                      {/\bceo\b/i.test(m.job_title) && <Badge variant="secondary">CEO</Badge>}
                      {!m.is_active && <Badge variant="outline">Hidden</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{m.job_title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={m.is_active} onCheckedChange={() => toggleActive(m)} aria-label="Active" />
                    <Button variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down">
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(m)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(m)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit team member' : 'Add team member'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {form.profile_image ? (
                <img src={form.profile_image} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-muted" />
              )}
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
                />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                  {form.profile_image ? 'Change photo' : 'Upload photo'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tm-name">Full name</Label>
              <Input id="tm-name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-title">Job title</Label>
              <Input id="tm-title" placeholder="CEO, CTO, COO…" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-desc">Short description</Label>
              <Textarea id="tm-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SOCIAL_KEYS.map((key) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`tm-${key}`} className="capitalize text-xs">{key}</Label>
                  <Input
                    id={`tm-${key}`}
                    placeholder="https://…"
                    value={form.social[key] ?? ''}
                    onChange={(e) => setForm({ ...form, social: { ...form.social, [key]: e.target.value } })}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Visible on About page</p>
                <p className="text-xs text-muted-foreground">Turn off to hide without deleting.</p>
              </div>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAboutTeam;
