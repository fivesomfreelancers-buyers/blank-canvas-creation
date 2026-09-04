import React, { useEffect, useState, useRef } from 'react';
import SmartImage from '@/components/media/SmartImage';
import { useSignedAttachmentUrl } from '@/hooks/useSignedAttachmentUrl';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Send, Image as ImageIcon, Loader2, Trash2, Pencil, X, Check } from 'lucide-react';
import newsLogo from '@/assets/fivesom-news-logo.png';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Broadcast {
  id: string;
  body: string;
  attachment_url: string | null;
  audience: string;
  created_at: string;
  updated_at: string;
  delivered: number;
  read_count: number;
}

const AdminFivesomNews: React.FC = () => {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'all' | 'buyers' | 'freelancers'>('all');
  const [attachment, setAttachment] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<Broadcast[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    const { data, error } = await (supabase as any).rpc('list_news_broadcasts');
    if (error) {
      toast.error('Could not load news history', { description: error.message });
      return;
    }
    setHistory(
      ((data as any[]) || []).map((b) => ({
        ...b,
        delivered: Number(b.delivered || 0),
        read_count: Number(b.read_count || 0),
      })),
    );
  };

  useEffect(() => {
    fetchHistory();
    const channel = supabase
      .channel('admin-news-broadcasts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news_broadcasts' }, () => {
        fetchHistory();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      setUploading(true);
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('message-attachments').upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('message-attachments').getPublicUrl(path);
      setAttachment(publicUrl);
      toast.success('Image attached');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const broadcast = async () => {
    if (!body.trim()) return toast.error('Message required');
    setSending(true);
    const { data, error } = await (supabase as any).rpc('publish_news', {
      _body: body.trim(),
      _attachment_url: attachment || null,
      _audience: audience,
    });
    setSending(false);
    if (error) return toast.error('Broadcast failed', { description: error.message });
    toast.success(`News delivered to ${(data as any)?.delivered ?? 0} users`);
    setBody('');
    setAttachment('');
    fetchHistory();
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editBody.trim()) return toast.error('Message cannot be empty');
    const current = history.find((h) => h.id === editingId);
    const { error } = await (supabase as any).rpc('admin_update_news', {
      _broadcast_id: editingId,
      _body: editBody.trim(),
      _attachment_url: current?.attachment_url || null,
    });
    if (error) return toast.error('Update failed', { description: error.message });
    toast.success('News updated for all recipients');
    setEditingId(null);
    setEditBody('');
    fetchHistory();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await (supabase as any).rpc('admin_delete_news', { _broadcast_id: deleteId });
    setDeleteId(null);
    if (error) return toast.error('Delete failed', { description: error.message });
    toast.success('News removed from all inboxes');
    fetchHistory();
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <img src={newsLogo} alt="Fivesom News" className="h-6 w-6 object-contain" /> Fivesom News · Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="Write your announcement… (plain text + optional image)"
          />
          {attachment && (
            <div className="relative inline-block">
              <img src={attachment} alt="attachment" className="max-h-40 rounded border" />
              <Button size="sm" variant="destructive" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => setAttachment('')}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={audience} onValueChange={(v: any) => setAudience(v)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="buyers">Buyers only</SelectItem>
                <SelectItem value="freelancers">Freelancers only</SelectItem>
              </SelectContent>
            </Select>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-1" />}
              Attach image
            </Button>
            <Button onClick={broadcast} disabled={sending || !body.trim()}>
              {sending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
              Publish News
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base">Published News</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {history.map((h) => (
            <div key={h.id} className="p-3 border border-border rounded-lg">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">📣 News</Badge>
                  <Badge variant="outline" className="capitalize">{h.audience}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground mr-1">
                    {new Date(h.created_at).toLocaleString()} · delivered {h.delivered} · read {h.read_count}
                  </span>
                  {editingId === h.id ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={saveEdit} aria-label="Save"><Check className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditBody(''); }} aria-label="Cancel">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(h.id); setEditBody(h.body); }} aria-label="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(h.id)} aria-label="Delete">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {editingId === h.id ? (
                <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={4} />
              ) : (
                <p className="text-sm whitespace-pre-wrap text-foreground">{h.body}</p>
              )}
              {h.attachment_url && <NewsAttachmentImage url={h.attachment_url} />}
            </div>
          ))}
          {history.length === 0 && <p className="text-center text-muted-foreground py-6">No news published yet</p>}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this news announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed from every user's Fivesom News inbox. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const NewsAttachmentImage = ({ url }: { url: string }) => {
  const signed = useSignedAttachmentUrl(url);
  return (
    <SmartImage
      src={signed}
      alt="News attachment"
      wrapperClassName="mt-2 h-32 w-fit rounded"
      className="max-h-32 rounded object-contain"
    />
  );
};

export default AdminFivesomNews;
