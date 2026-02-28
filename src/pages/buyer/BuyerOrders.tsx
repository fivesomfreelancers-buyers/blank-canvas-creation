
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Star, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: buyer } = await supabase
        .from('buyers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!buyer) return;

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*, gigs(title), freelancers(user_id), profiles!orders_freelancer_id_fkey(full_name)')
        .eq('buyer_id', buyer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Track your current and past orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                <p className="text-gray-500">Browse services and place your first order</p>
              </div>
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
                      <p className="text-gray-600 mt-1 text-sm sm:text-base">by {order.profiles?.full_name || 'Freelancer'}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-left sm:text-right flex sm:flex-col items-start sm:items-end gap-2">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">${Number(order.amount).toFixed(2)}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="text-xs sm:text-sm text-gray-600">
                      <span>{order.status}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      
                      {order.status === 'delivered' && (
                        <>
                          <Button size="sm" className="w-full sm:w-auto">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Request Revision
                          </Button>
                          <Button size="sm" className="w-full sm:w-auto">Accept Delivery</Button>
                        </>
                      )}
                      
                      {order.status === 'completed' && (
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Star className="w-4 h-4 mr-1" />
                          Leave Review
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

export default BuyerOrders;
