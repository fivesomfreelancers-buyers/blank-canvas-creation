import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAdminProfile, fetchAdminProfiles, fetchAllAdminProfiles, findAdminProfileByEmail, displayName } from '@/lib/adminUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Trophy, Star, Medal, Crown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface RankedFreelancer {
  id: string;
  user_id: string;
  rating: number;
  completed_orders: number;
  ranking_score: number;
  is_featured: boolean;
  is_verified: boolean;
  total_earnings: number;
  name: string;
  email: string;
}

const AdminRanking = () => {
  const [freelancers, setFreelancers] = useState<RankedFreelancer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = async () => {
    const { data, error } = await supabase
      .from('freelancers')
      .select('id, user_id, rating, completed_orders, ranking_score, is_featured, is_verified, total_earnings')
      .order('ranking_score', { ascending: false })
      .limit(50);

    if (error) { console.error(error); setLoading(false); return; }

    const withNames = await Promise.all(
      (data || []).map(async (f) => {
        const p = await fetchAdminProfile(f.user_id);
        return { ...f, name: displayName(p), email: p?.email || '' };
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

  const forceToTop = async (id: string) => {
    const topScore = freelancers.length > 0 ? Number(freelancers[0].ranking_score || 0) + 100 : 1000;
    const { error } = await supabase.from('freelancers').update({ ranking_score: topScore }).eq('id', id);
    if (error) { toast.error('Failed'); return; }
    toast.success('User promoted to #1!');
    fetchRanking();
  };

  const getRankDisplay = (index: number) => {
    if (index === 0) return <div className="flex items-center gap-1"><Crown className="h-5 w-5 text-yellow-500" /><span className="font-bold text-yellow-500">#1</span></div>;
    if (index === 1) return <div className="flex items-center gap-1"><Medal className="h-5 w-5 text-muted-foreground" /><span className="font-bold text-muted-foreground">#2</span></div>;
    if (index === 2) return <div className="flex items-center gap-1"><Medal className="h-5 w-5 text-amber-700" /><span className="font-bold text-amber-700">#3</span></div>;
    return <span className="font-medium text-muted-foreground">#{index + 1}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {freelancers.slice(0, 3).map((f, i) => {
          const colors = [
            'border-yellow-400 bg-yellow-500/5',
            'border-border bg-gray-500/5',
            'border-amber-600 bg-amber-500/5',
          ];
          const icons = [
            <Crown className="h-8 w-8 text-yellow-500" />,
            <Medal className="h-8 w-8 text-muted-foreground" />,
            <Medal className="h-8 w-8 text-amber-700" />,
          ];
          return (
            <Card key={f.id} className={`border-2 ${colors[i]}`}>
              <CardContent className="pt-6 text-center space-y-3">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  {icons[i]}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{f.name}</h3>
                  <p className="text-xs text-muted-foreground">{f.email}</p>
                </div>
                <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                  <span>⭐ {Number(f.rating || 0).toFixed(1)}</span>
                  <span>📦 {f.completed_orders || 0}</span>
                  <span>💰 ${Number(f.total_earnings || 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Score: {Number(f.ranking_score || 0).toFixed(0)}
                  </Badge>
                  {f.is_featured && <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">🏆 Winner</Badge>}
                </div>
                <div className="flex justify-center gap-2 pt-2">
                  <Button size="sm" variant={f.is_featured ? "outline" : "default"} className="h-7 text-xs" onClick={() => toggleFeatured(f.id, !!f.is_featured)}>
                    {f.is_featured ? 'Remove Winner' : '🏆 Weekly Winner'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Full Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {freelancers.map((f, i) => (
                <TableRow key={f.id} className="hover:bg-muted/50">
                  <TableCell>{getRankDisplay(i)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground text-sm">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">⭐ {Number(f.rating || 0).toFixed(1)}</TableCell>
                  <TableCell className="text-foreground">{f.completed_orders || 0}</TableCell>
                  <TableCell className="text-foreground font-medium">${Number(f.total_earnings || 0).toFixed(0)}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={Number(f.ranking_score || 0)}
                      className="w-24 h-8 text-sm"
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (val !== Number(f.ranking_score)) updateScore(f.id, val);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => forceToTop(f.id)}>
                        🚀 Top
                      </Button>
                      <Button size="sm" variant={f.is_featured ? "outline" : "secondary"} className="h-7 text-xs" onClick={() => toggleFeatured(f.id, !!f.is_featured)}>
                        {f.is_featured ? '✕ Remove' : '🏆 Winner'}
                      </Button>
                    </div>
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
