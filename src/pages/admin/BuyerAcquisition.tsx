import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
interface Summary {
  total_buyers: number; new_today: number; new_week: number; new_month: number;
  active_buyers_30d: number; paid_orders: number; purchasing_buyers: number; repeat_buyers: number;
  daily: { date: string; registrations: number }[];
}
export default function BuyerAcquisition() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    const result = await supabase.rpc('buyer_acquisition_summary');
    if (result.error) { setData(null); setError(result.error.message); }
    else setData(result.data as unknown as Summary);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const metrics = data ? [
    ['Registered buyers', data.total_buyers], ['New today · UTC', data.new_today],
    ['New this week · UTC', data.new_week], ['New this month · UTC', data.new_month],
    ['Active buyers · 30 days', data.active_buyers_30d], ['Paid purchases · all time', data.paid_orders],
    ['Purchasing buyers · all time', data.purchasing_buyers], ['Repeat buyers · all time', data.repeat_buyers],
  ] : [];
  return <section className="space-y-8 text-foreground">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><span className="flex items-center gap-2 text-sm font-semibold text-primary"><TrendingUp size={17} /> Buyer growth</span><h1 className="mt-3 text-2xl font-bold sm:text-3xl">Buyer Acquisition & Conversion Analytics</h1></div><Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw size={16} />Refresh</Button></header>
    {error ? <p role="alert" className="text-destructive">{error}</p> : loading ? <p className="text-muted-foreground">Loading buyer performance…</p> : data && <>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="border-t border-border pt-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{Number(value).toLocaleString()}</p></div>)}</div>
      <section className="border-y border-border py-6"><h2 className="text-lg font-semibold">Daily target: 5–10 potential buyers</h2><p className="mt-2 text-sm text-muted-foreground">Registered today: {data.new_today}. Registrations are one signal; they do not prove a qualified lead or a purchase.</p><p className="mt-3 text-sm">Registered buyers with a paid purchase: {data.total_buyers ? `${(data.purchasing_buyers / data.total_buyers * 100).toFixed(1)}%` : '—'} · all time</p></section>
      <section><h2 className="mb-4 text-lg font-semibold">Daily buyer registrations · last 30 days</h2><div className="max-h-80 overflow-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border"><th className="py-3">Date · UTC</th><th className="py-3 text-right">Buyers</th></tr></thead><tbody>{data.daily.map(row => <tr key={row.date} className="border-b border-border"><td className="py-3">{row.date}</td><td className="py-3 text-right">{row.registrations}</td></tr>)}</tbody></table></div></section>
      <section className="border-t border-border pt-6"><h2 className="text-lg font-semibold">Acquisition sources</h2><dl className="mt-4 space-y-3 text-sm">{['Google organic traffic', 'Identifiable AI referrals', 'Top acquisition countries', 'Most visited buyer pages', 'Checkout-start conversion'].map(label => <div key={label} className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">{label}</dt><dd>Not available · GA4 report access needed</dd></div>)}</dl></section>
    </>}
  </section>;
}