
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, Star, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import BackToDashboard from '@/components/BackToDashboard';

const BuyerBrowse = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const { data, error } = await supabase
        .from('gigs')
        .select(`
          *,
          freelancers(
            user_id,
            rating
          ),
          profiles!gigs_freelancer_id_fkey(
            full_name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGigs(data || []);
    } catch (error) {
      console.error('Error fetching gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <BackToDashboard />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Gigs</h1>
          <p className="text-gray-600 mt-2">Find the perfect freelancer for your project</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for services..."
                  className="pl-10"
                />
              </div>
              <Select>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-50">Under $50</SelectItem>
                  <SelectItem value="50-200">$50 - $200</SelectItem>
                  <SelectItem value="200-500">$200 - $500</SelectItem>
                  <SelectItem value="over-500">Over $500</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gigs Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading gigs...</div>
        ) : gigs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">No gigs available yet</h3>
                <p className="text-gray-500">Check back soon for new services from talented freelancers</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gigs.map((gig) => (
              <Card key={gig.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative h-48 bg-gray-200">
                  {gig.images && gig.images.length > 0 ? (
                    <img 
                      src={gig.images[0]} 
                      alt={gig.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
                      <span className="text-white text-6xl font-bold">{gig.title[0]}</span>
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{gig.title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {gig.profiles?.full_name?.[0]?.toUpperCase() || 'F'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">
                      by {gig.profiles?.full_name || 'Freelancer'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{gig.freelancers?.rating || 'New'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-green-600">${Number(gig.base_price).toFixed(2)}</span>
                    <span className="text-sm text-gray-500">{gig.delivery_time_days} days</span>
                  </div>
                  <Button size="sm" className="w-full mt-3" asChild>
                    <Link to={`/gig/${gig.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerBrowse;
