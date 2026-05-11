import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, Video, X, CheckCircle, Clock, Link2, Plus, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BackToDashboard from '@/components/BackToDashboard';


const FreelancerDeliverWork = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const preselectedOrderId = (location.state as any)?.orderId || '';

  const [selectedOrder, setSelectedOrder] = useState(preselectedOrderId);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryLink, setDeliveryLink] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: freelancer } = await supabase
        .from('freelancers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!freelancer) return;

      const { data: orders } = await supabase
        .from('orders')
        .select('*, gigs(title)')
        .eq('freelancer_id', freelancer.id)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false });

      setPendingOrders(orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const totalSize = [...uploadedFiles, ...newFiles].reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        toast({ title: "Files too large", description: "Total file size must be under 50MB. Use an external link for large files.", variant: "destructive" });
        return;
      }
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return <Image className="w-5 h-5 text-blue-500" />;
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) return <Video className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-muted-foreground" />;
  };

  const handleSubmitDelivery = async () => {
    if (!selectedOrder) {
      toast({ title: "Error", description: "Please select an order to deliver.", variant: "destructive" });
      return;
    }
    if (!deliveryMessage.trim()) {
      toast({ title: "Error", description: "Please add a delivery message.", variant: "destructive" });
      return;
    }
    if (uploadedFiles.length === 0 && !deliveryLink.trim()) {
      toast({ title: "Error", description: "Please upload a file or paste a delivery link.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let deliveryFileUrl: string | null = null;

      // Upload first file to delivery-files bucket
      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        const filePath = `${selectedOrder}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('delivery-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('delivery-files')
          .getPublicUrl(filePath);
        deliveryFileUrl = publicUrl;
      }

      // Insert delivery record
      const { error: deliveryError } = await supabase
        .from('order_deliveries')
        .insert({
          order_id: selectedOrder,
          delivery_message: deliveryMessage.trim(),
          delivery_file_url: deliveryFileUrl,
          delivery_link: deliveryLink.trim() || null,
          status: 'submitted' as const,
        } as any);

      if (deliveryError) throw deliveryError;

      // Update order status to delivered
      await supabase.from('orders').update({ status: 'delivered' as const }).eq('id', selectedOrder);

      toast({ title: "Delivery Submitted! 🎉", description: "Your work has been delivered to the buyer for review." });
      navigate('/freelancer/orders');
    } catch (error) {
      console.error('Delivery error:', error);
      toast({ title: "Error", description: "Failed to submit delivery. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <BackToDashboard />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Deliver Work</h1>
          <p className="text-muted-foreground mt-2">Submit your completed work to buyers</p>
        </div>

        <div className="space-y-6">
          {/* Order Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Order to Deliver</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
              ) : pendingOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending orders to deliver.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedOrder === order.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-foreground">{order.gigs?.title || 'Order'}</h3>
                          {order.package_name && <p className="text-sm text-muted-foreground">{order.package_name} Package</p>}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">${Number(order.amount).toFixed(2)}</div>
                          <Badge variant="outline" className="capitalize">{order.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedOrder && (
            <>
              {/* Upload File */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🅰️ Upload Final File</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-1">Upload your delivery file</p>
                    <p className="text-xs text-muted-foreground mb-3">Images, Documents, Archives — Max 50MB</p>
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="delivery-files"
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar,.ai,.psd,.sketch,.fig,.xd"
                    />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('delivery-files')?.click()}>
                      Choose Files
                    </Button>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            {getFileIcon(file.name)}
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="text-destructive hover:text-destructive">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* External Link */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    🅱️ Paste Delivery Link
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={deliveryLink}
                    onChange={(e) => setDeliveryLink(e.target.value)}
                    placeholder="https://drive.google.com/... or Dropbox / YouTube link"
                  />
                  <p className="text-xs text-muted-foreground">Use for large files like videos. Upload to Google Drive, Dropbox, etc. and paste the link here.</p>
                </CardContent>
              </Card>

              {/* Delivery Message */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">✍️ Delivery Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={deliveryMessage}
                    onChange={(e) => setDeliveryMessage(e.target.value)}
                    placeholder="Describe what you've delivered, any notes for the buyer, how to use the files..."
                    rows={5}
                    className="resize-none"
                  />
                </CardContent>
              </Card>

              {/* Info */}
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Delivery Tips</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Small files (&lt;50MB) → Upload directly</li>
                      <li>Large files (videos, etc.) → Use Google Drive / Dropbox link</li>
                      <li>The buyer will review and accept your delivery</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => navigate('/freelancer/orders')}>Cancel</Button>
                <Button onClick={handleSubmitDelivery} disabled={isSubmitting} className="min-w-40">
                  {isSubmitting ? (
                    <><Clock className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" />Deliver Work</>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerDeliverWork;
