import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const ContactSupportForm: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!user) {
      toast.error('Please log in to contact support.');
      return;
    }
    const s = subject.trim();
    const m = message.trim();
    if (!s) return toast.error('Subject cannot be empty.');
    if (!m) return toast.error('Message cannot be empty.');
    if (s.length > 200) return toast.error('Subject is too long (max 200).');
    if (m.length > 4000) return toast.error('Message is too long (max 4000).');

    try {
      setSending(true);
      // Get or create the user's support conversation
      let convoId: string | null = null;
      const { data: existing } = await (supabase as any)
        .from('system_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'support')
        .maybeSingle();
      convoId = existing?.id ?? null;

      if (!convoId) {
        await (supabase as any).rpc('bootstrap_system_conversations', { _user_id: user.id });
        const { data: after } = await (supabase as any)
          .from('system_conversations')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'support')
          .maybeSingle();
        convoId = after?.id ?? null;
        if (!convoId) throw new Error('Could not open a support conversation.');
      }

      const body = `📌 ${s}\n\n${m}`;
      const { error } = await (supabase as any).from('system_messages').insert({
        conversation_id: convoId,
        sender_type: 'user',
        sender_id: user.id,
        body,
      });
      if (error) throw error;

      toast.success('Message sent! Our support team will reply shortly.');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cs-subject">Subject</Label>
        <Input
          id="cs-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Describe your issue briefly..."
          maxLength={200}
        />
      </div>
      <div>
        <Label htmlFor="cs-message">Message</Label>
        <Textarea
          id="cs-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please describe your issue in detail..."
          rows={6}
          maxLength={4000}
        />
      </div>
      <Button className="w-full" onClick={send} disabled={sending}>
        {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
        {sending ? 'Sending…' : 'Send Message'}
      </Button>
      <p className="text-xs text-muted-foreground">
        Your message will be delivered directly to Fivesom Support. You can continue the conversation from your Messages / Support inbox.
      </p>
    </div>
  );
};

export default ContactSupportForm;
