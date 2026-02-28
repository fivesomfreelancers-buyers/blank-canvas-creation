
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, X, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const FreelancerDeliverWork = () => {
  const [selectedOrder, setSelectedOrder] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          gigs(title),
          profiles!orders_buyer_id_fkey(full_name)
        `)
        .eq('freelancer_id', freelancer.id)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingOrders(orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      console.log('Files uploaded:', newFiles.map(f => f.name));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDelivery = async () => {
    if (!selectedOrder) {
      toast({
        title: "Error",
        description: "Please select an order to deliver",
        variant: "destructive",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "Error", 
        description: "Please upload at least one file",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryMessage.trim()) {
      toast({
        title: "Error",
        description: "Please add a delivery message",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting delivery for order:', selectedOrder);
    console.log('Files:', uploadedFiles.map(f => f.name));
    console.log('Message:', deliveryMessage);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Delivery Submitted! 🎉",
        description: "Your work has been delivered to the buyer for review",
      });
      
      // Reset form
      setSelectedOrder('');
      setDeliveryMessage('');
      setUploadedFiles([]);
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Deliver Work</h1>
        <p className="text-gray-600 mt-2">Submit your completed work to buyers</p>
      </div>

      <div className="grid gap-6">
        {/* Order Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Order to Deliver</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No pending orders to deliver</p>
                <p className="text-sm text-gray-500">Orders will appear here when buyers purchase your gigs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order.id)}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedOrder === order.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium">{order.gigs?.title || 'Order'}</h3>
                        <p className="text-gray-600 text-sm">Buyer: {order.profiles?.full_name || 'Buyer'}</p>
                        <p className="text-gray-500 text-sm mt-1">{order.requirements || 'No requirements specified'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600 mb-1">${Number(order.amount).toFixed(2)}</div>
                        <Badge variant={order.status === 'in_progress' ? 'default' : 'secondary'}>
                          <Clock className="w-3 h-3 mr-1" />
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedOrder && (
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div>
                <Label htmlFor="files">Upload Files *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop your files here, or click to browse</p>
                  <Input
                    type="file"
                    id="files"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".zip,.rar,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.svg,.ai,.psd,.sketch"
                  />
                  <Button variant="outline" onClick={() => document.getElementById('files')?.click()}>
                    Choose Files
                  </Button>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Uploaded Files:</h4>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.name)}
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery Message */}
              <div>
                <Label htmlFor="message">Delivery Message *</Label>
                <Textarea
                  id="message"
                  value={deliveryMessage}
                  onChange={(e) => setDeliveryMessage(e.target.value)}
                  placeholder="Describe what you've delivered, any important notes for the buyer, how to use the files, etc..."
                  rows={5}
                  className="mt-2"
                />
              </div>

              {/* File Types Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Supported File Types:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                  <div className="flex items-center">
                    <Image className="w-4 h-4 mr-1" />
                    Images (JPG, PNG, GIF, SVG)
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Documents (PDF, DOC, TXT)
                  </div>
                  <div className="flex items-center">
                    <Upload className="w-4 h-4 mr-1" />
                    Archives (ZIP, RAR)
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" disabled={isSubmitting}>
                  Save as Draft
                </Button>
                <Button 
                  onClick={handleSubmitDelivery}
                  disabled={isSubmitting}
                  className="min-w-32"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Deliver Work
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FreelancerDeliverWork;
