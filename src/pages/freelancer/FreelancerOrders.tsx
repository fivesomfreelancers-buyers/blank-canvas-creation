import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MessageSquare, Package, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const FreelancerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: freelancer } = await supabase
        .from('freelancers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!freelancer) return;

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*, gigs(title)')
        .eq('freelancer_id', freelancer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch buyer profiles manually since there's no direct FK
      if (ordersData && ordersData.length > 0) {
        const buyerIds = [...new Set(ordersData.map(o => o.buyer_id))];
        const { data: profiles } = await (supabase as any)
          .from('public_profiles')
          .select('id, full_name')
          .in('id', buyerIds);
        
        const profileMap = new Map((profiles as any[] | null)?.map((p: any) => [p.id, p.full_name]) || []);
        
        const enrichedOrders = ordersData.map(order => ({
          ...order,
          buyer_name: profileMap.get(order.buyer_id) || 'Buyer'
        }));
        setOrders(enrichedOrders as any);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-muted text-foreground';
    }
  };
  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Orders Received</h1>
          <p className="mt-2 text-muted-foreground">Track and manage all incoming orders</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">No orders yet</h3>
                <p className="text-muted-foreground">When buyers order your gigs, they will appear here</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order: any) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/freelancer/order/${order.id}`)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{order.gigs?.title || 'Order'}</CardTitle>
                      <p className="mt-1 text-muted-foreground">Ordered by: {order.buyer_name || 'Buyer'}</p>
                      <p className="text-sm text-muted-foreground">Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-2">${Number(order.amount).toFixed(2)}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-foreground">{order.status === 'completed' ? 'Completed' : order.status}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/freelancer/order/${order.id}`); }}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      {order.status === 'in_progress' && (
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate('/freelancer/deliver', { state: { orderId: order.id } }); }}>
                          <Package className="w-4 h-4 mr-1" />
                          Deliver Work
                        </Button>
                      )}
                    </div>
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
export default FreelancerOrders;