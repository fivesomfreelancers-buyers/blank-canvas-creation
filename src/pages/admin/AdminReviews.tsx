import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const AdminReviews = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from('gig_reviews').select('*').order('created_at', { ascending: false });
    const enriched = await Promise.all((data || []).map(async (r: any) => {
      const [b, g] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', r.buyer_id).maybeSingle(),
        supabase.from('gigs').select('title').eq('id', r.gig_id).maybeSingle(),
      ]);
      return { ...r, buyer_name: b.data?.full_name, gig_title: g.data?.title };
    }));
    setItems(enriched);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const del = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    const { error } = await supabase.from('gig_reviews').delete().eq('id', id);
    if (error) return toast.error('Failed');
    toast.success('Review deleted');
    fetch();
  };

  const isSuspicious = (r: any) => !r.comment || r.comment.length < 5;

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Total Reviews</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold text-yellow-500">{items.filter(isSuspicious).length}</p><p className="text-xs text-muted-foreground">Flagged Suspicious</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold text-green-500">{(items.reduce((s, r) => s + r.rating, 0) / (items.length || 1)).toFixed(1)} ⭐</p><p className="text-xs text-muted-foreground">Average Rating</p></CardContent></Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4" /> All Reviews</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 && <p className="text-center text-muted-foreground py-8">No reviews</p>}
          {items.map(r => (
            <div key={r.id} className="p-3 border border-border rounded-lg flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground">{r.buyer_name || 'Anonymous'}</span>
                  <span className="text-yellow-500 text-sm">{'⭐'.repeat(r.rating)}</span>
                  {isSuspicious(r) && <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10 text-[10px]"><AlertTriangle className="h-3 w-3 mr-1" /> Suspicious</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">on "{r.gig_title}"</p>
                <p className="text-sm text-foreground mt-1">{r.comment || <em>No comment</em>}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString()}</p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReviews;
