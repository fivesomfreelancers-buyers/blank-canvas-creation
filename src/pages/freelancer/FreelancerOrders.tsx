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
    const channel = supabase
      .channel('freelancer-orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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
        const orderIds = ordersData.map(o => o.id);

        const [{ data: profiles }, { data: deliveries }] = await Promise.all([
          (supabase as any)
            .from('public_profiles')
            .select('id, full_name, username, profile_image_url')
            .in('id', buyerIds),
          supabase
            .from('order_deliveries')
            .select('order_id')
            .in('order_id', orderIds),
        ]);

        const profileMap = new Map((profiles as any[] | null)?.map((p: any) => [p.id, p]) || []);
        const deliveredSet = new Set((deliveries as any[] | null)?.map((d: any) => d.order_id) || []);

        const enrichedOrders = ordersData.map(order => {
          const p: any = profileMap.get(order.buyer_id);
          return {
            ...order,
            buyer_name: p?.full_name || p?.username || 'Buyer',
            buyer_avatar: p?.profile_image_url || null,
            is_delivered: deliveredSet.has(order.id) || order.status === 'completed' || order.status === 'delivered',
          };
        });
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
              <Card
                key={order.id}
                className={`transition-shadow cursor-pointer border ${
                  order.is_delivered
                    ? 'border-green-500/40 shadow-[0_0_0_3px_hsl(142_70%_45%/0.12)] hover:shadow-[0_0_0_4px_hsl(142_70%_45%/0.18)]'
                    : 'border-red-500/50 shadow-[0_0_0_3px_hsl(0_84%_60%/0.15)] hover:shadow-[0_0_0_4px_hsl(0_84%_60%/0.22)]'
                }`}
                onClick={() => navigate(`/freelancer/order/${order.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <Avatar className="w-11 h-11 shrink-0">
                        <AvatarImage src={order.buyer_avatar || undefined} alt={order.buyer_name || 'Buyer'} className="object-cover" />
                        <AvatarFallback>
                          {(order.buyer_name || 'B').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <CardTitle className="text-xl truncate">{order.gigs?.title || 'Order'}</CardTitle>
                        <p className="mt-1 text-muted-foreground truncate">Ordered by: {order.buyer_name || 'Buyer'}</p>
                        <p className="text-sm text-muted-foreground">Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-green-600 mb-2">${Number(order.amount).toFixed(2)}</div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge
                          className={
                            order.is_delivered
                              ? 'bg-green-500/15 text-green-600 border-0 hover:bg-green-500/20'
                              : 'bg-red-500/15 text-red-600 border-0 hover:bg-red-500/20'
                          }
                        >
                          {order.is_delivered ? 'Work delivered' : 'Not delivered yet'}
                        </Badge>
                      </div>
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