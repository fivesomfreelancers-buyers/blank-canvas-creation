import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

export default function AdminBuyerActivity() {
  const [days, setDays] = useState('28');
  const [counts, setCounts] = useState<number[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    const start = new Date(Date.now() - Number(days) * 86400000).toISOString();
    const results = await Promise.all([
      supabase.from('buyers').select('id', { count: 'exact', head: true }).gte('created_at', start),
      supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', start),
      supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', start)
        .in('payment_status', ['paid', 'succeeded', 'held', 'released', 'verified']),
      supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', start).eq('status', 'completed'),
    ]);
    if (results.some(result => result.error)) {
      setCounts(null);
      setError(true);
    } else setCounts(results.map(result => result.count ?? 0));
    setLoading(false);
  }, [days]);

  useEffect(() => {
    void refresh();
    const channel = supabase.channel('admin-buyer-activity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'buyers' }, () => { void refresh(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { void refresh(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [refresh]);

  return (
    <section className="space-y-6 text-foreground" aria-labelledby="buyer-activity-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="buyer-activity-heading" className="text-xl font-semibold">Buyer activity</h2>
        <div className="flex items-center gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-40" aria-label="Activity period"><SelectValue /></SelectTrigger>
            <SelectContent>{['7', '28', '60', '365'].map(value => <SelectItem key={value} value={value}>Last {value} days</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" size="icon" disabled={loading} onClick={() => void refresh()} aria-label="Refresh buyer activity" title="Refresh buyer activity">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Buyer accounts and orders created in the selected period. Payment and completion counts reflect their current status.</p>
      {error ? <p role="alert" className="text-destructive">Buyer activity could not be loaded. Please try again.</p> : (
        <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4" aria-busy={loading}>
          {['New buyer accounts', 'Orders created', 'Payment confirmed', 'Completed orders'].map((label, index) => (
            <div key={label} className="min-w-0 border-t border-border pt-4">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-2 text-3xl font-semibold">{loading ? '…' : counts?.[index] ?? '—'}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="border-t border-border pt-5">
        <h3 className="font-semibold">Search and checkout traffic</h3>
        <p className="mt-2 text-sm text-muted-foreground">Consented searches, service views, seller contacts and checkout events are measured in Google Analytics. Traffic source and conversion reports are not connected to this dashboard.</p>
      </div>
    </section>
  );
}