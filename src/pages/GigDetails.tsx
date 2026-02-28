import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, MessageSquare, Shield, Clock, CheckCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    const fetchGig = async () => {
      if (!id) return;

      const { data: gigData, error } = await supabase
        .from('gigs')
        .select(`*, freelancers ( user_id, rating, completed_orders, is_verified, bio )`)
        .eq('id', id)
        .single();

      if (error || !gigData) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, profile_image_url')
        .eq('id', gigData.freelancers?.user_id)
        .single();

      const { data: reviews } = await supabase
        .from('gig_reviews')
        .select('rating, comment, created_at, buyer_id')
        .eq('gig_id', id);

      // Fetch buyer names for reviews
      const reviewsWithNames = await Promise.all((reviews || []).map(async (review) => {
        const { data: buyerProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', review.buyer_id)
          .single();
        return { ...review, buyerName: buyerProfile?.full_name || 'Anonymous Buyer' };
      }));

      const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      setGig({
        ...gigData,
        freelancerName: profile?.full_name || 'Anonymous',
        freelancerImageUrl: profile?.profile_image_url,
        freelancerUserId: gigData.freelancers?.user_id,
        rating: avgRating,
        totalReviews: reviews?.length || 0,
        reviews: reviewsWithNames,
        isVerified: gigData.freelancers?.is_verified || false,
        completedOrders: gigData.freelancers?.completed_orders || 0,
        freelancerBio: gigData.freelancers?.bio || '',
      });
      setLoading(false);
    };

    fetchGig();
  }, [id]);

  const handleContact = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to contact a freelancer.", variant: "destructive" });
      return;
    }
    if (!contactMessage.trim()) {
      toast({ title: "Empty message", description: "Please type a message.", variant: "destructive" });
      return;
    }
    setSendingMessage(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: gig.freelancerUserId,
        message: contactMessage.trim(),
      });
      if (error) throw error;
      toast({ title: "Message Sent!", description: `Your message has been sent to ${gig.freelancerName}.` });
      setContactMessage('');
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleOrder = () => {
    navigate('/payment', {
      state: {
        gig: { id: gig.id, title: gig.title, freelancer: { name: gig.freelancerName } },
        selectedPackage: { name: 'Standard', price: gig.base_price, delivery: `${gig.delivery_time_days} days`, revisions: '2', features: [] }
      }
    });
  };

  const initials = gig?.freelancerName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'F';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 pt-24 text-center text-muted-foreground">Loading gig details...</div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 pt-24 text-center">
          <h2 className="text-2xl font-bold text-foreground">Gig not found</h2>
          <Button onClick={() => navigate('/explore')} className="mt-4">Browse Services</Button>
        </div>
      </div>
    );
  }

  const images = gig.images && gig.images.length > 0 ? gig.images : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            {images.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <img src={images[selectedImageIdx]} alt={gig.title} className="w-full h-96 object-cover rounded-t-lg" />
                  {images.length > 1 && (
                    <div className="flex gap-2 p-3">
                      {images.map((img: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIdx(idx)}
                          className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                            idx === selectedImageIdx ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Title & Info */}
            <Card>
              <CardHeader>
                <h1 className="text-2xl font-bold mb-2">{gig.title}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={gig.freelancerImageUrl || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{gig.freelancerName}</span>
                  </div>
                  {gig.totalReviews > 0 && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{gig.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground ml-1">({gig.totalReviews})</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="description">
                  <TabsList>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews ({gig.totalReviews})</TabsTrigger>
                    <TabsTrigger value="about">About Seller</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="mt-4">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{gig.description}</p>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-4">
                    {gig.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {gig.reviews.map((review: any, idx: number) => (
                          <div key={idx} className="border-b border-border pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{review.buyerName}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center mb-2">
                              {[1,2,3,4,5].map((star) => (
                                <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                              ))}
                            </div>
                            {review.comment && <p className="text-muted-foreground text-sm">{review.comment}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No reviews yet</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="about" className="mt-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={gig.freelancerImageUrl || ''} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg">{gig.freelancerName}</h3>
                        <p className="text-muted-foreground">{gig.completedOrders} orders completed</p>
                        {gig.freelancerBio && <p className="text-muted-foreground mt-2">{gig.freelancerBio}</p>}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Order Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order This Gig</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <span className="text-2xl font-bold text-green-600">${Number(gig.base_price).toFixed(2)}</span>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{gig.delivery_time_days} days delivery</span>
                </div>
                <Button onClick={handleOrder} className="w-full">Continue (${Number(gig.base_price).toFixed(2)})</Button>
              </CardContent>
            </Card>

            {/* About Seller */}
            <Card>
              <CardHeader><CardTitle>About the Seller</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={gig.freelancerImageUrl || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{gig.freelancerName}</h4>
                    <p className="text-sm text-muted-foreground">{gig.completedOrders} orders completed</p>
                  </div>
                </div>
                {gig.isVerified && (
                  <div className="flex items-center text-sm">
                    <Shield className="w-4 h-4 mr-2 text-green-500" />
                    <span>Verified seller</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Seller */}
            <Card>
              <CardHeader><CardTitle>Contact Seller</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Hi, I'm interested in your service..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleContact} disabled={sendingMessage} className="w-full" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetails;
