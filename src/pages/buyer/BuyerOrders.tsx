import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, CheckCircle, RefreshCw, Eye, PackageCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const BuyerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [freelancerNames, setFreelancerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*, gigs(title, thumbnail_url)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(ordersData || []);

      // Fetch freelancer names via freelancers -> public_profiles
      const flIds = Array.from(new Set((ordersData || []).map((o: any) => o.freelancer_id).filter(Boolean)));
      if (flIds.length > 0) {
        const { data: freelancers } = await supabase
          .from('freelancers')
          .select('id, user_id')
          .in('id', flIds);
        const userIds = (freelancers || []).map(f => f.user_id);
        const { data: profiles } = await (supabase as any)
          .from('public_profiles')
          .select('id, full_name')
          .in('id', userIds);
        const nameByUser = new Map((profiles || []).map((p: any) => [p.id, p.full_name]));
        const map: Record<string, string> = {};
        (freelancers || []).forEach(f => {
          map[f.id] = (nameByUser.get(f.user_id) as string) || 'Freelancer';
        });
        setFreelancerNames(map);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-muted text-muted-foreground';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Track your current and past orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium text-foreground">No orders yet</h3>
              <p className="text-muted-foreground mt-2">Browse services and place your first order</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg sm:text-xl leading-tight">{order.gigs?.title || 'Order'}</CardTitle>
                      <p className="text-muted-foreground mt-1 text-sm sm:text-base">by {freelancerNames[order.freelancer_id] || 'Freelancer'}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-left sm:text-right flex sm:flex-col items-start sm:items-end gap-2">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">${Number(order.amount).toFixed(2)}</div>
                      <Badge className={`capitalize ${getStatusColor(order.status)}`}>{order.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {order.status === 'delivered' && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                      <PackageCheck className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-700 dark:text-yellow-400">Your order has been delivered 🎉</p>
                        <p className="text-muted-foreground">Review the delivery and accept it to release payment, or request a revision.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/buyer/messages')}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Message
                    </Button>

                    {order.status === 'delivered' && (
                      <Button size="sm" onClick={() => navigate(`/buyer/orders/${order.id}`)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Review Delivery
                      </Button>
                    )}

                    {order.status === 'completed' && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/buyer/orders/${order.id}`)}>
                        <Star className="w-4 h-4 mr-1" />
                        Leave Review
                      </Button>
                    )}

                    {order.status !== 'delivered' && order.status !== 'completed' && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/buyer/orders/${order.id}`)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerOrders;
