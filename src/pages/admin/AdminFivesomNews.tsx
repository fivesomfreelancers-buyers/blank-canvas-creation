import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Send, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { SocialLinks } from '@/components/SocialLinks';

const AdminFivesomNews: React.FC = () => {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'all' | 'buyers' | 'freelancers'>('all');
  const [attachment, setAttachment] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    // Latest news messages grouped (show one per body+attachment+created_at)
    const { data } = await (supabase as any)
      .from('system_messages')
      .select('id, body, attachment_url, created_at, admin_id, conversation_id, system_conversations!inner(type)')
      .eq('sender_type', 'admin')
      .eq('system_conversations.type', 'news')
      .order('created_at', { ascending: false })
      .limit(200);
    // group by body|created_at (rough)
    const seen = new Map<string, any>();
    (data || []).forEach((m: any) => {
      const key = `${m.body}|${Math.floor(new Date(m.created_at).getTime() / 60000)}`;
      if (!seen.has(key)) seen.set(key, { ...m, count: 1 });
      else seen.get(key).count++;
    });
    setHistory(Array.from(seen.values()));
  };

  useEffect(() => { fetchHistory(); }, []);

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
    }
  };

  const broadcast = async () => {
    if (!body.trim()) return toast.error('Message required');
    setSending(true);
    const { data, error } = await (supabase as any).rpc('broadcast_news', {
      _body: body.trim(),
      _attachment_url: attachment || null,
      _audience: audience,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    toast.success(`Sent to ${data} users`);
    setBody(''); setAttachment('');
    fetchHistory();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">Follow Fivesom:</span>
        <SocialLinks iconSize={18} />
      </div>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="h-4 w-4" /> Fivesom News · Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Qor announcement…  (Markdown ah ma laha — text + sawir)" />
          {attachment && (
            <div className="relative inline-block">
              <img src={attachment} alt="attachment" className="max-h-40 rounded border" />
              <Button size="sm" variant="destructive" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => setAttachment('')}><Trash2 className="h-3 w-3" /></Button>
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
              Broadcast
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base">Recent News</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {history.map(h => (
            <div key={h.id} className="p-3 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline">📣 News</Badge>
                <span className="text-[10px] text-muted-foreground">{new Date(h.created_at).toLocaleString()} · sent to ~{h.count}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap text-foreground">{h.body}</p>
              {h.attachment_url && <img src={h.attachment_url} alt="" className="mt-2 max-h-32 rounded" />}
            </div>
          ))}
          {history.length === 0 && <p className="text-center text-muted-foreground py-6">No news yet</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFivesomNews;
