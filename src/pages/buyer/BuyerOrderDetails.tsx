import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Download, Star, RefreshCw, CheckCircle, Clock, User, X, Link2, ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import AttachmentPreview from '@/components/chat/AttachmentPreview';
import DisputeChat from '@/components/dispute/DisputeChat';

const BuyerOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*, gigs(title, thumbnail_url)')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(orderData);

      // Fetch freelancer profile via freelancers table
      const { data: freelancer } = await supabase
        .from('freelancers')
        .select('user_id')
        .eq('id', orderData.freelancer_id)
        .single();

      if (freelancer) {
        const { data: profile } = await (supabase as any)
          .from('public_profiles')
          .select('full_name, profile_image_url')
          .eq('id', freelancer.user_id)
          .single();
        setFreelancerProfile(profile);
      }

      // Fetch deliveries
      const { data: deliveryData } = await supabase
        .from('order_deliveries')
        .select('*')
        .eq('order_id', orderId!)
        .order('delivered_at', { ascending: false });
      setDeliveries(deliveryData || []);
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDelivery = async () => {
    if (!orderId) return;
    setIsProcessing(true);
    try {
      await supabase.from('orders').update({ status: 'completed' as const }).eq('id', orderId);
      setOrder((prev: any) => ({ ...prev, status: 'completed' }));
      setShowFeedbackModal(true);
      toast({ title: "Delivery Accepted! 🎉", description: "Payment has been released to the freelancer." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to accept delivery.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionFeedback.trim() || !orderId) return;
    setIsProcessing(true);
    try {
      // Update latest delivery status with feedback
      if (deliveries.length > 0) {
        await supabase
          .from('order_deliveries')
          .update({
            status: 'revision_requested' as const,
            revision_feedback: revisionFeedback,
            revision_requested_at: new Date().toISOString(),
          } as any)
          .eq('id', deliveries[0].id);
      }
      await supabase.from('orders').update({ status: 'in_progress' as const }).eq('id', orderId);
      setOrder((prev: any) => ({ ...prev, status: 'in_progress' }));
      setShowRevisionModal(false);
      setRevisionFeedback('');
      toast({ title: "Revision Requested", description: "Your feedback has been sent to the freelancer." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to request revision.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenDispute = async () => {
    if (!disputeReason.trim() || !orderId || !order) return;
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error: dErr } = await supabase.from('disputes').insert({
        order_id: orderId,
        buyer_id: user.id,
        freelancer_id: order.freelancer_id,
        reason: disputeReason,
        details: disputeDetails || null,
        status: 'open',
      } as any);
      if (dErr) throw dErr;
      await supabase.from('orders').update({ status: 'disputed' as any }).eq('id', orderId);
      setOrder((prev: any) => ({ ...prev, status: 'disputed' }));
      setShowDisputeModal(false);
      setDisputeReason('');
      setDisputeDetails('');
      toast({ title: "Dispute Opened", description: "Your dispute has been sent to the admin team for review." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to open dispute.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-muted-foreground">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">Order not found</h2>
          <Button onClick={() => navigate('/buyer/dashboard')} className="mt-4">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const freelancerInitials = freelancerProfile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'F';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/buyer/dashboard')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{order.gigs?.title || 'Order'}</CardTitle>
                    {order.package_name && <p className="text-sm text-muted-foreground mt-1">{order.package_name} Package</p>}
                  </div>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Order Date: {new Date(order.created_at).toLocaleDateString()}</span>
                  <span className="text-xl font-bold text-green-600">${Number(order.amount).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Review */}
            {order.status === 'delivered' && deliveries.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Delivery Awaiting Your Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deliveries[0].delivery_message && (
                    <div className="p-4 bg-background rounded-lg border">
                      <h4 className="font-medium mb-2">Delivery Message:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{deliveries[0].delivery_message}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleAcceptDelivery} disabled={isProcessing}>
                      {isProcessing ? <><Clock className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <><CheckCircle className="w-4 h-4 mr-2" />Accept Delivery</>}
                    </Button>
                    <Button variant="outline" onClick={() => setShowRevisionModal(true)} disabled={isProcessing}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Request Revision
                    </Button>
                    <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setShowDisputeModal(true)} disabled={isProcessing}>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Open Dispute
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed */}
            {order.status === 'completed' && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-800 dark:text-green-200 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Order Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 dark:text-green-300 mb-3">Payment has been released to the freelancer.</p>
                  {!hasFeedback && (
                    <Button onClick={() => setShowFeedbackModal(true)} variant="outline">
                      <Star className="w-4 h-4 mr-2" />Leave Review
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Delivered Files & Links */}
            {deliveries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📥 Delivered Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.status !== 'completed' && (
                    <div className="p-3 rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200">
                      🔒 You can preview the delivery, but downloads will unlock once you accept the delivery and release the payment.
                    </div>
                  )}
                  {deliveries.map((delivery) => (
                    <div key={delivery.id} className="space-y-3 p-4 bg-muted rounded-lg">
                      {delivery.delivery_message && (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{delivery.delivery_message}</p>
                      )}
                      {delivery.delivery_file_url && (
                        <AttachmentPreview
                          url={delivery.delivery_file_url}
                          allowDownload={order.status === 'completed'}
                          lockedHint="Accept delivery to download"
                        />
                      )}
                      {delivery.delivery_link && (
                        <div>
                          {order.status === 'completed' ? (
                            <Button size="sm" variant="outline" onClick={() => window.open(delivery.delivery_link, '_blank')}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open Link
                            </Button>
                          ) : (
                            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground border rounded-md px-3 py-2">
                              <Link2 className="w-3.5 h-3.5" />
                              Link unlocks after you accept the delivery
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Delivered: {new Date(delivery.delivered_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Freelancer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Freelancer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={freelancerProfile?.profile_image_url || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground">{freelancerInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{freelancerProfile?.full_name || 'Freelancer'}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('/buyer/messages')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Freelancer
                </Button>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">${Number(order.amount).toFixed(2)}</span>
                </div>
                {order.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="capitalize">{order.payment_method}</span>
                  </div>
                )}
                {order.payment_status && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className="capitalize">{order.payment_status}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Revision Modal */}
        {showRevisionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Request Revision</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowRevisionModal(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Revision Feedback *</Label>
                  <Textarea value={revisionFeedback} onChange={(e) => setRevisionFeedback(e.target.value)} placeholder="Describe what changes you'd like..." rows={4} className="mt-2" />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowRevisionModal(false)} className="flex-1">Cancel</Button>
                  <Button onClick={handleRequestRevision} disabled={isProcessing} className="flex-1">
                    {isProcessing ? 'Sending...' : 'Send Request'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dispute Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-red-600" />Open Dispute</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowDisputeModal(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">A dispute will be sent to the admin team for review. Please describe the issue clearly.</p>
                <div>
                  <Label>Reason *</Label>
                  <Textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder="Briefly describe the reason for the dispute..." rows={2} className="mt-2" />
                </div>
                <div>
                  <Label>Additional Details</Label>
                  <Textarea value={disputeDetails} onChange={(e) => setDisputeDetails(e.target.value)} placeholder="Provide any additional context (optional)..." rows={3} className="mt-2" />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowDisputeModal(false)} className="flex-1">Cancel</Button>
                  <Button onClick={handleOpenDispute} disabled={isProcessing || !disputeReason.trim()} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    {isProcessing ? 'Submitting...' : 'Submit Dispute'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          orderId={orderId || ''}
          freelancerName={freelancerProfile?.full_name || 'Freelancer'}
          onFeedbackSubmitted={() => setHasFeedback(true)}
        />
      </div>
    </div>
  );
};

export default BuyerOrderDetails;
