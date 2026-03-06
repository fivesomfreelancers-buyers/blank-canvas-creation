import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Plus, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const MAX_GIGS = 2;

const FreelancerGigs = () => {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: freelancer } = await supabase
        .from('freelancers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!freelancer) return;

      const { data: gigsData, error } = await supabase
        .from('gigs')
        .select('*')
        .eq('freelancer_id', freelancer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGigs(gigsData || []);
    } catch (error) {
      console.error('Error fetching gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewGig = () => {
    if (gigs.length >= MAX_GIGS) {
      toast({
        title: "You’ve reached your gig limit",
        description: "Please delete an existing gig to add a new one.",
        variant: "destructive"
      });
      return;
    }
    navigate('/create-gig');
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gigs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGigs(prev => prev.filter(g => g.id !== id));
      toast({
        title: "Gig Deleted",
        description: "This gig has been removed.",
      });
    } catch (error) {
      console.error('Error deleting gig:', error);
      toast({
        title: "Error",
        description: "Failed to delete gig. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Gigs</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage all your service offerings</p>
        </div>
        <Button onClick={handleCreateNewGig} className="flex items-center justify-center space-x-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span>Create New Gig</span>
        </Button>
      </div>

      <div className="text-right text-xs sm:text-sm text-gray-500 mb-2">
        {gigs.length} / {MAX_GIGS} gigs used
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading gigs...</div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {gigs.map((gig) => (
            <Card key={gig.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl leading-tight">{gig.title}</CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-4 mt-2">
                      <span className="text-xl sm:text-2xl font-bold text-green-600">${Number(gig.base_price).toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground">{gig.delivery_time_days} days delivery</span>
                    </div>
                  </div>
                  <Badge variant={gig.status === 'active' ? 'default' : 'secondary'} className="w-fit">
                    {gig.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {gig.description}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate(`/edit-gig/${gig.id}`)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                      onClick={() => handleDelete(gig.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {gigs.length === 0 && (
        <Card>
          <CardContent className="p-6 sm:p-12 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900">No gigs yet</h3>
                <p className="text-sm sm:text-base text-gray-500 mt-1">Create your first gig to start offering your services</p>
              </div>
              <Button onClick={handleCreateNewGig} className="mt-4 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Gig
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
          </div>
        </div>
      </div>
  );
};

export default FreelancerGigs;
