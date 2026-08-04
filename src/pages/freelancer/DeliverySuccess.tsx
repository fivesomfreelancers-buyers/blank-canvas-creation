import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, ArrowLeft, FileText, Link2, Calendar, Loader2, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { safeExternalUrl } from '@/lib/safeUrl';

const DeliverySuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!orderId) return;
      const { data: order } = await supabase
        .from('orders')
        .select('*, gigs(title), buyer:profiles!orders_buyer_id_fkey(full_name, avatar_url)')
        .eq('id', orderId)
        .maybeSingle();

      const { data: delivery } = await supabase
        .from('order_deliveries')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setData({ order, delivery });
      setLoading(false);
    };
    load();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const buyer = data?.order?.buyer;
  const delivery = data?.delivery;
  const order = data?.order;
  const buyerName = buyer?.full_name || 'Buyer';
  const initials = buyerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const createdAt = delivery?.created_at ? new Date(delivery.created_at) : new Date();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/freelancer/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Delivery Submitted!</h1>
          <p className="text-muted-foreground">Your work has been successfully delivered.</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Buyer */}
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <Avatar className="w-14 h-14">
                <AvatarImage src={buyer?.avatar_url || undefined} alt={buyerName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Delivered to</p>
                <h2 className="font-semibold text-foreground truncate">{buyerName}</h2>
              </div>
              <Badge className="bg-green-500/15 text-green-600 hover:bg-green-500/20 border-0">
                Delivered Successfully
              </Badge>
            </div>

            {/* Order */}
            {order?.gigs?.title && (
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Order</p>
                  <p className="font-medium text-foreground">{order.gigs.title}</p>
                </div>
              </div>
            )}

            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="font-medium text-foreground">
                  {format(createdAt, 'PPp')}{' '}
                  <span className="text-muted-foreground text-sm">
                    ({formatDistanceToNow(createdAt, { addSuffix: true })})
                  </span>
                </p>
              </div>
            </div>

            {/* Message */}
            {delivery?.delivery_message && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Delivery Message</p>
                <div className="bg-muted rounded-lg p-4 text-foreground whitespace-pre-wrap">
                  {delivery.delivery_message}
                </div>
              </div>
            )}

            {/* File */}
            {delivery?.delivery_file_url && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Attached File</p>
                <a
                  href={delivery.delivery_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground truncate">
                    {delivery.delivery_file_url.split('/').pop()}
                  </span>
                </a>
              </div>
            )}

            {/* Link */}
            {safeExternalUrl(delivery?.delivery_link) && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Delivery Link</p>
                <a
                  href={safeExternalUrl(delivery.delivery_link)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <Link2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground truncate">
                    {delivery.delivery_link}
                  </span>
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3 mt-6">
          <Button variant="outline" asChild>
            <Link to="/freelancer/orders">View All Orders</Link>
          </Button>
          <Button asChild>
            <Link to="/freelancer/messages">Message Buyer</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeliverySuccess;
