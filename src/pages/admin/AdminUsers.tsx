import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Star, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FreelancerUser {
  id: string;
  user_id: string;
  rating: number;
  completed_orders: number;
  is_verified: boolean;
  is_featured: boolean;
  ranking_score: number;
  profile?: { full_name: string; email: string; profile_image_url: string | null };
}

const AdminUsers = () => {
  const [freelancers, setFreelancers] = useState<FreelancerUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFreelancers = async () => {
    const { data, error } = await supabase
      .from('freelancers')
      .select('id, user_id, rating, completed_orders, is_verified, is_featured, ranking_score');

    if (error) { console.error(error); return; }

    const withProfiles = await Promise.all(
      (data || []).map(async (f) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, profile_image_url')
          .eq('id', f.user_id)
          .maybeSingle();
        return { ...f, profile: profile || { full_name: 'Unknown', email: '', profile_image_url: null } };
      })
    );

    setFreelancers(withProfiles as FreelancerUser[]);
    setLoading(false);
  };

  useEffect(() => { fetchFreelancers(); }, []);

  const toggleVerified = async (id: string, current: boolean) => {
    const { error } = await supabase.from('freelancers').update({ is_verified: !current }).eq('id', id);
    if (error) { toast.error('Failed to update'); return; }
    toast.success(!current ? 'Verified!' : 'Verification removed');
    fetchFreelancers();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from('freelancers').update({ is_featured: !current }).eq('id', id);
    if (error) { toast.error('Failed to update'); return; }
    toast.success(!current ? 'Featured!' : 'Feature removed');
    fetchFreelancers();
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Freelancer Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {freelancers.map((f) => (
              <TableRow key={f.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{f.profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{f.profile?.email}</p>
                  </div>
                </TableCell>
                <TableCell>⭐ {Number(f.rating || 0).toFixed(1)}</TableCell>
                <TableCell>{f.completed_orders || 0}</TableCell>
                <TableCell>{Number(f.ranking_score || 0).toFixed(0)}</TableCell>
                <TableCell className="space-x-1">
                  {f.is_verified && <Badge className="bg-green-500/10 text-green-600 border-green-200">Verified</Badge>}
                  {f.is_featured && <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Featured</Badge>}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant={f.is_verified ? "destructive" : "default"} onClick={() => toggleVerified(f.id, !!f.is_verified)}>
                    {f.is_verified ? <XCircle className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                    {f.is_verified ? 'Unverify' : 'Verify'}
                  </Button>
                  <Button size="sm" variant={f.is_featured ? "outline" : "secondary"} onClick={() => toggleFeatured(f.id, !!f.is_featured)}>
                    <Star className="h-3 w-3 mr-1" />
                    {f.is_featured ? 'Unfeature' : 'Feature'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
