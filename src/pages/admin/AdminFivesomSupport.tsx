import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAdminProfile, fetchAdminProfiles, fetchAllAdminProfiles, findAdminProfileByEmail, displayName } from '@/lib/adminUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, Paperclip, Loader2 } from 'lucide-react';
import supportLogo from '@/assets/fivesom-support-logo.png';
import AttachmentPreview from '@/components/chat/AttachmentPreview';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { moderateText, moderateImageFile } from '@/lib/chatModeration';


interface SupportConvo {
  id: string;
  user_id: string;
  last_message: string;
  last_message_at: string;
  unread_admin: number;
  status: string;
  user_name?: string;
  user_email?: string;
  user_image?: string | null;
}

interface SysMsg {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'admin' | 'system';
  body: string;
  attachment_url: string | null;
  created_at: string;
}

const AdminFivesomSupport: React.FC = () => {
  const { user } = useAuth();
  const [convos, setConvos] = useState<SupportConvo[]>([]);
  const [selected, setSelected] = useState<SupportConvo | null>(null);
  const [messages, setMessages] = useState<SysMsg[]>([]);
  const [reply, setReply] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchConvos = async () => {
    const { data } = await (supabase as any)
      .from('system_conversations')
      .select('*')
      .eq('type', 'support')
      .order('last_message_at', { ascending: false });
    const list = (data || []) as SupportConvo[];
    if (list.length) {
      const ids = list.map(c => c.user_id);
      const pm = await fetchAdminProfiles(ids);
      list.forEach(c => {
        const p: any = pm.get(c.user_id);
        c.user_name = displayName(p);
        c.user_email = p?.email;
        c.user_image = p?.profile_image_url || null;
      });
    }
    setConvos(list);
    setLoading(false);
  };

  const markRead = async (cid: string) => {
    await (supabase as any)
      .from('system_conversations')
      .update({ unread_admin: 0 })
      .eq('id', cid);
    await (supabase as any)
      .from('system_messages')
      .update({ is_read_admin: true })
      .eq('conversation_id', cid)
      .eq('is_read_admin', false);
    setConvos(prev => prev.map(c => c.id === cid ? { ...c, unread_admin: 0 } : c));
  };

  const fetchMessages = async (cid: string) => {
    const { data } = await (supabase as any)
      .from('system_messages')
      .select('*')
      .eq('conversation_id', cid)
      .order('created_at');
    setMessages((data || []) as SysMsg[]);
    await markRead(cid);
  };

  useEffect(() => { fetchConvos(); }, []);

  useEffect(() => {
    const ch = supabase
      .channel('admin-support-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_messages' }, async (p: any) => {
        if (selected && p.new?.conversation_id === selected.id) {
          await fetchMessages(selected.id);
        } else {
          fetchConvos();
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_conversations' }, () => {
        fetchConvos();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selected?.id]);

  useEffect(() => { if (selected) fetchMessages(selected.id); }, [selected?.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendReply = async () => {
    if (!reply.trim() || !selected || !user) return;
    const check = moderateText(reply);
    if (check.allowed === false) return toast.error(check.message);
    const { error } = await (supabase as any).from('system_messages').insert({
      conversation_id: selected.id,
      sender_type: 'admin',
      admin_id: user.id,
      body: reply.trim(),
    });
    if (error) return toast.error(error.message);
    setReply('');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selected || !user) return;
    try {
      if (file.type.startsWith('image/')) {
        const check = await moderateImageFile(file);
        if (check.allowed === false) {
          toast.error(check.message);
          if (fileRef.current) fileRef.current.value = '';
          return;
        }
      }
      setUploading(true);
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('message-attachments').upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('message-attachments').getPublicUrl(path);
      const label = file.type.startsWith('image/') ? 'Sent an image'
        : file.type.startsWith('video/') ? 'Sent a video'
        : `Sent a file: ${file.name}`;
      await (supabase as any).from('system_messages').insert({
        conversation_id: selected.id,
        sender_type: 'admin',
        admin_id: user.id,
        body: label,
        attachment_url: publicUrl,
      });
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const setResolved = async (status: string) => {
    if (!selected) return;
    await (supabase as any).from('system_conversations').update({ status }).eq('id', selected.id);
    toast.success(`Marked ${status}`);
    setSelected({ ...selected, status });
    fetchConvos();
  };

  const filtered = convos.filter(c => (c.user_name || '').toLowerCase().includes(search.toLowerCase()) || (c.user_email || '').toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin h-8 w-8" /></div>;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-2rem)]">
      <Card className="border-border bg-card flex flex-col min-h-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><img src={supportLogo} alt="Fivesom Support" className="h-6 w-6 object-contain" /> Fivesom Support · {convos.length}</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="pl-8 h-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto">
          {filtered.map(c => (
            <div key={c.id} onClick={() => setSelected(c)} className={`p-3 border-b cursor-pointer hover:bg-muted ${selected?.id === c.id ? 'bg-muted' : ''}`}>
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9"><AvatarImage src={c.user_image || undefined} /><AvatarFallback>{(c.user_name || '?').slice(0, 2)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium truncate">{c.user_name}</p>
                    {c.unread_admin > 0 && <Badge variant="destructive" className="text-[10px]">{c.unread_admin}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.last_message || '—'}</p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">No conversations</p>}
        </CardContent>
      </Card>

      <Card className="border-border bg-card lg:col-span-2 flex flex-col min-h-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{selected ? selected.user_name : 'Select a conversation'}</span>
            {selected && (
              <div className="flex gap-2">
                <Badge variant="outline" className={selected.status === 'resolved' ? 'text-green-500' : ''}>{selected.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => setResolved(selected.status === 'resolved' ? 'open' : 'resolved')}>
                  {selected.status === 'resolved' ? 'Reopen' : 'Mark resolved'}
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          {selected ? (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2">
                {messages.map(m => {
                  const mine = m.sender_type !== 'user';
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                        {m.sender_type === 'system' && <p className="text-[10px] opacity-70 mb-0.5">SYSTEM</p>}
                        <p>{m.body}</p>
                        {m.attachment_url && <AttachmentPreview url={m.attachment_url} isOwn={mine} />}
                        <p className={`text-[10px] mt-1 ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <div className="flex gap-2 pt-2 border-t items-center">
                <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*,.pdf,.doc,.docx,.zip" />
                <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                </Button>
                <Input value={reply} onChange={e => setReply(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendReply()} placeholder="Reply as Fivesom Support…" />
                <Button onClick={sendReply} disabled={!reply.trim()}><Send className="h-4 w-4" /></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a user to chat</div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
  );
};

export default AdminFivesomSupport;
