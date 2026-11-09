import { useNavigate } from 'react-router-dom';
import { CreditCard, FileCheck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Agreement, jobLabel } from '@/lib/jobs';
import { supabase } from '@/integrations/supabase/client';
import { getOrCreateConversation, inboxPath } from '@/lib/conversations';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
export default function AgreementPanel({ agreement: a, refresh }: { agreement: Agreement; refresh: () => void }) {
  const { user } = useAuth(); const navigate = useNavigate(); const isBuyer = user?.id === a.buyer_id;
  const [price, setPrice] = useState(String(a.price)); const [days, setDays] = useState(String(a.delivery_days));
  return <section className="space-y-4 border-t border-border pt-5">
    <h3 className="flex items-center gap-2 font-semibold"><FileCheck size={18} className="text-primary" />Project Agreement</h3>
    <p className="text-sm text-muted-foreground">{jobLabel(a.status)}</p>
    <dl className="grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Total project price</dt><dd className="font-bold">${a.price}</dd></div><div><dt className="text-muted-foreground">Delivery</dt><dd>{a.delivery_days} days after payment</dd></div></dl>
    <p className="whitespace-pre-wrap text-sm">{a.scope}</p><p className="whitespace-pre-wrap text-sm text-muted-foreground">{a.deliverables}</p>
    {isBuyer && a.status === 'awaiting_freelancer' && <div className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><div><Label htmlFor={`price-${a.id}`}>Fixed total project price (USD)</Label><Input id={`price-${a.id}`} type="number" min="0.01" step="0.01" value={price} onChange={e => setPrice(e.target.value)} /></div><div><Label htmlFor={`days-${a.id}`}>Delivery days</Label><Input id={`days-${a.id}`} type="number" min="1" value={days} onChange={e => setDays(e.target.value)} /></div></div><Button variant="outline" onClick={async () => { const { error } = await supabase.rpc('set_job_agreement_terms', { _agreement_id: a.id, _price: Number(price), _days: Number(days) }); if (error) toast.error(error.message); else { toast.success('Terms saved for freelancer acceptance.'); refresh(); } }}>Confirm Project Terms</Button></div>}
    {!a.terms_confirmed && <p className="text-sm text-muted-foreground">Awaiting the buyer’s fixed total project price. The hourly proposal is not the total payment.</p>}
    <div className="flex flex-wrap gap-2">
      {!isBuyer && a.status === 'awaiting_freelancer' && <Button disabled={!a.terms_confirmed} onClick={async () => { const { error } = await supabase.rpc('accept_job_agreement', { _agreement_id: a.id }); if (error) toast.error(error.message); else { toast.success('Agreement accepted. Awaiting buyer payment.'); refresh(); } }}>Accept Agreement</Button>}
      {isBuyer && a.status === 'awaiting_payment' && <Button onClick={async () => { const { data, error } = await supabase.functions.invoke('create-order-checkout', { body: { agreementId: a.id } }); if (error || !data?.url) toast.error(data?.error || 'Checkout could not start.'); else window.location.assign(data.url); }}><CreditCard size={16} />Secure Checkout · ${Number(a.price) + 1}</Button>}
      {a.order_id && <Button onClick={() => navigate(isBuyer ? `/buyer/orders/${a.order_id}` : `/freelancer/order/${a.order_id}`)}>Open Order</Button>}
      <Button variant="outline" onClick={async () => { if (!user) return; const convo = await getOrCreateConversation(user.id, isBuyer ? a.freelancer_user_id : a.buyer_id); if (convo) navigate(inboxPath(convo)); else toast.error('Could not open the conversation.'); }}><MessageSquare size={16} />Message Selected {isBuyer ? 'Freelancer' : 'Buyer'}</Button>
    </div>
    {a.status === 'awaiting_payment' && <p className="text-xs text-muted-foreground">Includes the existing $1 buyer service fee. Work is not funded until payment is confirmed.</p>}
  </section>;
}