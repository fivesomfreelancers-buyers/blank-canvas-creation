import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const AdminNotifications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [severity, setSeverity] = useState('info');

  const fetch = async () => {
    const { data } = await supabase.from('admin_announcements' as any).select('*').order('created_at', { ascending: false });
    setItems((data as any) || []);
  };
  useEffect(() => { fetch(); }, []);

  const send = async () => {
    if (!title || !message || !user) return toast.error('Fill all fields');
    const { error } = await supabase.from('admin_announcements' as any).insert({ title, message, audience, severity, created_by: user.id });
    if (error) return toast.error(error.message);
    toast.success('Announcement broadcast');
    setTitle(''); setMessage('');
    fetch();
  };

  const del = async (id: string) => {
    await supabase.from('admin_announcements' as any).delete().eq('id', id);
    fetch();
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Broadcast Announcement</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
          <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message" rows={4} />
          <div className="flex gap-2 flex-wrap">
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Users</SelectItem><SelectItem value="buyers">Buyers Only</SelectItem><SelectItem value="freelancers">Freelancers Only</SelectItem></SelectContent>
            </Select>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="info">Info</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent>
            </Select>
            <Button onClick={send}><Send className="h-4 w-4 mr-1" /> Broadcast</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base">Recent Announcements</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {items.map(a => (
            <div key={a.id} className="p-3 border border-border rounded-lg flex items-start gap-3">
              <div className="flex-1">
                <div className="flex gap-2 items-center"><span className="font-medium text-foreground">{a.title}</span><Badge variant="outline">{a.audience}</Badge><Badge variant="outline" className={a.severity === 'critical' ? 'text-destructive' : a.severity === 'warning' ? 'text-yellow-500' : ''}>{a.severity}</Badge></div>
                <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(a.created_at).toLocaleString()}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => del(a.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-muted-foreground py-4">No announcements</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
