import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Download, Star, RefreshCw, CheckCircle, Clock, User, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FeedbackModal from '@/components/feedback/FeedbackModal';

const BuyerOrderDetails = () => {
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState('Delivered');
  const [hasFeedback, setHasFeedback] = useState(false);
  const { toast } = useToast();

  const orderDetails = {
    id: "#ORD-2024-001",
    title: "Professional Logo Design for Tech Startup",
    description: "I need a modern, professional logo for my AI technology startup. The logo should be clean, scalable, and work well in both color and black & white versions.",
    freelancer: {
      name: "Alex Designer",
      avatar: "AD",
      rating: 4.9,
      reviews: 127
    },
    price: "$150",
    status: orderStatus,
    progress: 100,
    orderDate: "2024-01-15",
    expectedDelivery: "2024-01-18",
    deliveredDate: "2024-01-17",
    deliveryMessage: "Hello! I've completed your logo design project. Please find attached the final logo files including AI, PNG, and PDF versions. I've also included a brand guidelines document with proper usage instructions. The logo is modern, professional, and works perfectly in both color and black & white as requested. Looking forward to your feedback!"
  };

  const milestones = [
    {
      title: "Order Placed",
      date: "Jan 15, 2024",
      time: "2:30 PM",
      completed: true
    },
    {
      title: "Requirements Confirmed",
      date: "Jan 15, 2024",
      time: "3:45 PM",
      completed: true
    },
    {
      title: "Initial Concepts Shared",
      date: "Jan 16, 2024",
      time: "10:15 AM",
      completed: true
    },
    {
      title: "Work Delivered",
      date: "Jan 17, 2024",
      time: "2:30 PM",
      completed: true
    },
    {
      title: orderStatus === 'Completed' ? "Order Completed" : "Review & Acceptance",
      date: orderStatus === 'Completed' ? "Jan 17, 2024" : "Pending your review",
      time: orderStatus === 'Completed' ? "4:15 PM" : "",
      completed: orderStatus === 'Completed',
      current: orderStatus === 'Delivered'
    }
  ];

  const deliverables = [
    { name: "Logo-Final.ai", type: "Adobe Illustrator", size: "2.4 MB", status: "delivered" },
    { name: "Logo-PNG-Variations.zip", type: "Archive", size: "1.8 MB", status: "delivered" },
    { name: "Logo-Vector.pdf", type: "PDF Document", size: "1.5 MB", status: "delivered" },
    { name: "Brand-Guidelines.pdf", type: "PDF Document", size: "1.1 MB", status: "delivered" }
  ];

  const handleAcceptDelivery = async () => {
    setIsProcessing(true);
    console.log('Accepting delivery for order:', orderDetails.id);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setOrderStatus('Completed');
      setShowFeedbackModal(true);
      toast({
        title: "Delivery Accepted! 🎉",
        description: "Payment has been released to the freelancer.",
      });
    }, 2000);
  };

  const handleRequestRevision = async () => {
    if (!revisionFeedback.trim()) {
      toast({
        title: "Error",
        description: "Please provide feedback for the revision request",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    console.log('Requesting revision with feedback:', revisionFeedback);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setShowRevisionModal(false);
      setRevisionFeedback('');
      toast({
        title: "Revision Requested",
        description: "Your feedback has been sent to the freelancer. They will work on the revisions.",
      });
    }, 2000);
  };

  const handleFeedbackSubmitted = () => {
    setHasFeedback(true);
    console.log('Feedback submitted for order:', orderDetails.id);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-2">{orderDetails.id}</p>
          </div>
          <Badge className={`text-lg px-4 py-2 ${
            orderStatus === 'Completed' 
              ? 'bg-green-100 text-green-800' 
              : orderStatus === 'Delivered'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {orderStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>{orderDetails.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{orderDetails.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>Order Date: {orderDetails.orderDate}</span>
                <span>Delivered: {orderDetails.deliveredDate}</span>
                <span className="text-green-600 font-medium">Delivered on time!</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Review Alert - Only show if status is 'Delivered' */}
          {orderStatus === 'Delivered' && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Delivery Awaiting Your Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border mb-4">
                  <h4 className="font-medium mb-2">Delivery Message from {orderDetails.freelancer.name}:</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{orderDetails.deliveryMessage}</p>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleAcceptDelivery}
                    disabled={isProcessing}
                    className="min-w-32"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Delivery
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRevisionModal(true)}
                    disabled={isProcessing}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Request Revision
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Order Message */}
          {orderStatus === 'Completed' && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Order Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-3">
                  This order has been completed successfully. Payment has been released to the freelancer.
                </p>
                {!hasFeedback && (
                  <Button 
                    onClick={() => setShowFeedbackModal(true)}
                    variant="outline"
                    className="border-green-500 text-green-700 hover:bg-green-100"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Leave Review
                  </Button>
                )}
                {hasFeedback && (
                  <div className="flex items-center text-green-700">
                    <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                    <span>Thank you for your review!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{orderDetails.progress}%</span>
                </div>
                <Progress value={orderDetails.progress} className="h-3" />
              </div>
              
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                      milestone.completed 
                        ? 'bg-green-500' 
                        : milestone.current 
                        ? 'bg-yellow-500' 
                        : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <p className={`font-medium ${milestone.current ? 'text-yellow-600' : ''}`}>
                        {milestone.title}
                      </p>
                      <p className="text-sm text-gray-500">{milestone.date} {milestone.time && `at ${milestone.time}`}</p>
                    </div>
                    {milestone.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {milestone.current && (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle>Delivered Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deliverables.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium text-green-600">
                          {file.type.split(' ')[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.type} • {file.size}</p>
                      </div>
                    </div>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Freelancer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Freelancer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                  {orderDetails.freelancer.avatar}
                </div>
                <div>
                  <p className="font-medium">{orderDetails.freelancer.name}</p>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm">{orderDetails.freelancer.rating} ({orderDetails.freelancer.reviews} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" className="w-full">
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Service Price</span>
                  <span>{orderDetails.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>$7.50</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>$157.50</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Freelancer
                </Button>
                {orderStatus === 'Completed' && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowFeedbackModal(true)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {hasFeedback ? 'View Review' : 'Leave Review'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Request Revision</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowRevisionModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="feedback">Revision Feedback *</Label>
                <Textarea
                  id="feedback"
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  placeholder="Please describe what changes you'd like the freelancer to make..."
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRevisionModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRequestRevision}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Request'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        orderId={orderDetails.id}
        freelancerName={orderDetails.freelancer.name}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />
    </div>
  );
};

export default BuyerOrderDetails;
