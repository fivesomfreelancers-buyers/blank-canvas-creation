import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Clock, MessageSquare, Package, Download, FileText, Image, Video, Link2, ArrowLeft, User, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AttachmentPreview from '@/components/chat/AttachmentPreview';
import DisputeChat from '@/components/dispute/DisputeChat';

const FreelancerOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [requirements, setRequirements] = useState<any>(null);
  const [reqFiles, setReqFiles] = useState<any[]>([]);
  const [buyerProfile, setBuyerProfile] = useState<any>(null);
  const [revisionDelivery, setRevisionDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*, gigs(title, thumbnail_url)')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(orderData);

      // Fetch buyer profile
      const { data: profile } = await (supabase as any)
        .from('public_profiles')
        .select('full_name, profile_image_url')
        .eq('id', orderData.buyer_id)
        .single();
      setBuyerProfile(profile);

      // Fetch requirements
      const { data: reqData } = await supabase
        .from('order_requirements')
        .select('*')
        .eq('order_id', orderId!)
        .maybeSingle();

      if (reqData) {
        setRequirements(reqData);
        // Fetch requirement files
        const { data: files } = await supabase
          .from('order_requirement_files')
          .select('*')
          .eq('order_requirement_id', reqData.id);
        setReqFiles(files || []);
      }

      // Fetch latest revision-requested delivery
      const { data: revData } = await (supabase as any)
        .from('order_deliveries')
        .select('*')
        .eq('order_id', orderId!)
        .eq('status', 'revision_requested')
        .order('revision_requested_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setRevisionDelivery(revData || null);
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
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

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return <Image className="w-5 h-5 text-blue-500" />;
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) return <Video className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <Button onClick={() => navigate('/freelancer/dashboard')} className="mt-4">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const initials = buyerProfile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'B';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/freelancer/dashboard')} className="mb-6">
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
                    {order.package_name && (
                      <p className="text-sm text-muted-foreground mt-1">{order.package_name} Package</p>
                    )}
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

            {/* Revision Requested */}
            {revisionDelivery && (
              <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700">
                <CardHeader>
                  <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Revision Requested
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={buyerProfile?.profile_image_url || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{buyerProfile?.full_name || 'Buyer'}</p>
                      {revisionDelivery.revision_requested_at && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(revisionDelivery.revision_requested_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {revisionDelivery.revision_feedback ? (
                    <div className="p-4 bg-background rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h4 className="font-medium mb-2 text-sm">Buyer's Feedback:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {revisionDelivery.revision_feedback}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No feedback provided.</p>
                  )}
                  <Button
                    onClick={() => navigate('/freelancer/deliver', { state: { orderId: order.id } })}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Submit Revised Delivery
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Buyer Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📋 Buyer Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {!requirements ? (
                  <div className="text-center py-8">
                    <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">The buyer hasn't submitted requirements yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">You'll be notified when they do.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Instructions */}
                    {requirements.instructions && (
                      <div>
                        <h4 className="font-medium mb-2">Instructions</h4>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{requirements.instructions}</p>
                        </div>
                      </div>
                    )}

                    {/* External Links */}
                    {requirements.external_links && requirements.external_links.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Link2 className="w-4 h-4" />
                          External Links
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {requirements.external_links.map((link: string, idx: number) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-xs font-medium"
                              title={link}
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              Open Link {requirements.external_links.length > 1 ? idx + 1 : ''}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uploaded Files */}
                    {reqFiles.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Uploaded Files ({reqFiles.length})</h4>
                        <div className="space-y-3">
                          {reqFiles.map((file) => (
                            <AttachmentPreview key={file.id} url={file.file_url} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Buyer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Buyer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={buyerProfile?.profile_image_url || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{buyerProfile?.full_name || 'Buyer'}</p>
                    {buyerProfile?.email && (
                      <p className="text-xs text-muted-foreground">{buyerProfile.email}</p>
                    )}
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('/freelancer/messages')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Buyer
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(order.status === 'in_progress' || order.status === 'pending') && (
                  <Button className="w-full" onClick={() => navigate('/freelancer/deliver', { state: { orderId: order.id } })}>
                    <Package className="w-4 h-4 mr-2" />
                    Deliver Work
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => navigate('/freelancer/messages')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Buyer
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
      </div>
    </div>
  );
};

export default FreelancerOrderDetails;
