import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Trophy, Star, Medal } from 'lucide-react';
import { toast } from 'sonner';

interface RankedFreelancer {
  id: string;
  user_id: string;
  rating: number;
  completed_orders: number;
  ranking_score: number;
  is_featured: boolean;
  is_verified: boolean;
  name: string;
}

const AdminRanking = () => {
  const [freelancers, setFreelancers] = useState<RankedFreelancer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = async () => {
    const { data, error } = await supabase
      .from('freelancers')
      .select('id, user_id, rating, completed_orders, ranking_score, is_featured, is_verified')
      .order('ranking_score', { ascending: false })
      .limit(50);

    if (error) { console.error(error); setLoading(false); return; }

    const withNames = await Promise.all(
      (data || []).map(async (f) => {
        const { data: p } = await supabase.from('profiles').select('full_name').eq('id', f.user_id).maybeSingle();
        return { ...f, name: p?.full_name || 'Unknown' };
      })
    );

    setFreelancers(withNames as RankedFreelancer[]);
    setLoading(false);
  };

  useEffect(() => { fetchRanking(); }, []);

  const updateScore = async (id: string, score: number) => {
    const { error } = await supabase.from('freelancers').update({ ranking_score: score }).eq('id', id);
    if (error) { toast.error('Failed'); return; }
    toast.success('Score updated');
    fetchRanking();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from('freelancers').update({ is_featured: !current }).eq('id', id);
    if (error) { toast.error('Failed'); return; }
    toast.success(!current ? 'Featured as Weekly Winner!' : 'Feature removed');
    fetchRanking();
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-muted-foreground font-medium">#{index + 1}</span>;
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {freelancers.slice(0, 3).map((f, i) => (
          <Card key={f.id} className={i === 0 ? 'border-yellow-400 border-2' : ''}>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              {getRankIcon(i)}
              <div>
                <CardTitle className="text-base">{f.name}</CardTitle>
                <p className="text-xs text-muted-foreground">Score: {Number(f.ranking_score || 0).toFixed(0)}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>⭐ {Number(f.rating || 0).toFixed(1)}</span>
                <span>📦 {f.completed_orders || 0} orders</span>
              </div>
              {f.is_featured && <Badge className="mt-2 bg-yellow-500/10 text-yellow-600 border-yellow-200">🏆 Weekly Winner</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {freelancers.map((f, i) => (
                <TableRow key={f.id}>
                  <TableCell>{getRankIcon(i)}</TableCell>
                  <TableCell className="font-medium text-foreground">{f.name}</TableCell>
                  <TableCell>⭐ {Number(f.rating || 0).toFixed(1)}</TableCell>
                  <TableCell>{f.completed_orders || 0}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={Number(f.ranking_score || 0)}
                      className="w-20 h-8"
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (val !== Number(f.ranking_score)) updateScore(f.id, val);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant={f.is_featured ? "outline" : "default"} onClick={() => toggleFeatured(f.id, !!f.is_featured)}>
                      <Star className="h-3 w-3 mr-1" />
                      {f.is_featured ? 'Remove Winner' : 'Weekly Winner'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRanking;
