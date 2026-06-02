import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import OnlineIndicator from '@/components/presence/OnlineIndicator';
import { Textarea } from '@/components/ui/textarea';
import { Star, MapPin, Calendar, MessageSquare, CheckCircle, Globe, GraduationCap, Briefcase, Wrench } from 'lucide-react';
import Navbar from '@/components/Navbar';
import FreelancerFAQDisplay from '@/components/faq/FreelancerFAQDisplay';
import VerifiedBadge from '@/components/VerifiedBadge';
import VipBadge from '@/components/VipBadge';
import { resolveVipTier, getVipTheme } from '@/lib/vipTheme';
import { useTheme } from '@/components/ThemeProvider';
import ReportDialog from '@/components/ReportDialog';
import FreelancerProfileCard from '@/components/profile/FreelancerProfileCard';
import { softwareLogo, SoftwareDef } from '@/lib/verificationCatalog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';


const FreelancerProfilePage = () => {
  const { freelancerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme: mode } = useTheme();
  const [profileData, setProfileData] = useState<any>(null);
  const [gigs, setGigs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<{ media_url: string; media_type: 'image' | 'video' }[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!freelancerId) return;

      // freelancerId here is the freelancers table id
      const { data: freelancer } = await (supabase as any)
        .from('public_freelancers')
        .select('*')
        .eq('id', freelancerId)
        .single();

      if (!freelancer) {
        setLoading(false);
        return;
      }

      const { data: profile } = await (supabase as any)
        .from('public_profiles')
        .select('*')
        .eq('id', freelancer.user_id)
        .single();

      // Fetch gigs by this freelancer
      const { data: gigsData } = await supabase
        .from('gigs')
        .select('*')
        .eq('freelancer_id', freelancerId)
        .eq('status', 'active');

      // Fetch reviews for all gigs
      const gigIds = (gigsData || []).map(g => g.id);
      let allReviews: any[] = [];
      if (gigIds.length > 0) {
        const { data: reviewsData } = await (supabase as any)
          .from('public_gig_reviews')
          .select('rating, comment, created_at')
          .in('gig_id', gigIds);

        allReviews = (reviewsData || []).map((r) => ({ ...r, buyerName: 'Anonymous' }));
      }

      const avgRating = allReviews.length > 0
        ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
        : freelancer.rating || 0;

      // Fetch portfolio
      const { data: portfolioData } = await (supabase as any)
        .from('freelancer_portfolio')
        .select('media_url, media_type, position')
        .eq('freelancer_id', freelancerId)
        .order('position', { ascending: true });
      setPortfolio((portfolioData as any) || []);

      setProfileData({
        ...freelancer,
        name: profile?.full_name || 'Anonymous',
        imageUrl: profile?.profile_image_url,
        location: profile?.location || 'Not specified',
        professional_title: (freelancer as any).professional_title || (profile as any)?.professional_title || '',
        languages: (profile as any)?.languages || [],
        memberSince: new Date(profile?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        avgRating,
        totalReviews: allReviews.length,
        userId: freelancer.user_id,
      });
      setGigs(gigsData || []);
      setReviews(allReviews);
      setLoading(false);
    };

    fetchProfile();
  }, [freelancerId]);

  const getOrCreateConversation = async (partnerId: string): Promise<string | null> => {
    if (!user) return null;
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(buyer_id.eq.${user.id},freelancer_id.eq.${partnerId}),and(buyer_id.eq.${partnerId},freelancer_id.eq.${user.id})`)
      .maybeSingle();
    if (existing) return existing.id;

    const { data: buyerCheck } = await supabase.from('buyers').select('id').eq('user_id', user.id).maybeSingle();
    const buyerId = buyerCheck ? user.id : partnerId;
    const freelancerId = buyerCheck ? partnerId : user.id;

    const { data: newConvo, error } = await supabase
      .from('conversations')
      .insert({ buyer_id: buyerId, freelancer_id: freelancerId })
      .select('id')
      .single();
    if (error) return null;
    return newConvo.id;
  };

  const handleContact = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to contact.", variant: "destructive" });
      return;
    }
    if (!profileData?.userId) return;
    if (user.id === profileData.userId) {
      toast({ title: "That's you", description: "You can't message yourself.", variant: "destructive" });
      return;
    }
    setSendingMessage(true);
    try {
      const conversationId = await getOrCreateConversation(profileData.userId);
      if (!conversationId) throw new Error('Could not create conversation');
      if (contactMessage.trim()) {
        const { error } = await supabase.from('messages').insert({
          sender_id: user.id,
          receiver_id: profileData.userId,
          conversation_id: conversationId,
          message: contactMessage.trim(),
        });
        if (error) throw error;
      }
      const { data: buyerCheck } = await supabase.from('buyers').select('id').eq('user_id', user.id).maybeSingle();
      const route = buyerCheck ? '/buyer/messages' : '/freelancer/messages';
      setContactMessage('');
      toast({ title: "Opening chat…", description: `Continuing your conversation with ${profileData.name}.` });
      navigate(route, { state: { openConversationId: conversationId, partnerId: profileData.userId } });
    } catch (err: any) {
      console.error('handleContact error', err);
      toast({ title: "Error", description: err?.message || "Failed to open chat.", variant: "destructive" });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 pt-24 text-center text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 pt-24 text-center">
          <h2 className="text-2xl font-bold">Freelancer not found</h2>
        </div>
      </div>
    );
  }

  const initials = profileData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  const vipTier = resolveVipTier(profileData.vip_tier, profileData.vip_expires_at);
  const vipTheme = getVipTheme(vipTier, mode);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Profile Header */}
        <Card className="mb-8 relative overflow-hidden" style={vipTheme ? { background: vipTheme.cardBg, boxShadow: vipTheme.cardShadow } : undefined}>
          {vipTheme && (
            <div className="absolute top-3 right-3 z-10">
              <VipBadge tier={vipTier} size="md" />
            </div>
          )}
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24" style={vipTheme ? { boxShadow: vipTheme.ring } : undefined}>
                  <AvatarImage src={profileData.imageUrl || ''} alt={profileData.name} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-1 right-1">
                  <OnlineIndicator userId={profileData.userId} dotOnly />
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1 flex-wrap gap-y-2">
                  <h1 className={`text-3xl font-bold ${vipTheme ? 'bg-clip-text text-transparent' : 'text-foreground'}`}
                      style={vipTheme ? { backgroundImage: vipTheme.textGradient } : undefined}>{profileData.name}</h1>
                  {profileData.is_verified && <VerifiedBadge showLabel />}
                  {vipTheme && <VipBadge tier={vipTier} size="sm" />}
                  {profileData.is_featured && !vipTheme && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-600 border border-yellow-500/30">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Top Rated
                    </span>
                  )}
                  <OnlineIndicator userId={profileData.userId} />
                </div>
                {profileData.professional_title && (
                  <p className="text-base text-primary font-medium mb-2">{profileData.professional_title}</p>
                )}
                <p className="text-muted-foreground mb-4">{profileData.bio || 'No bio provided'}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{profileData.location}</div>
                  <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" />Member since {profileData.memberSince}</div>
                  {profileData.languages?.length > 0 && (
                    <div className="flex items-center"><Globe className="w-4 h-4 mr-1" />{profileData.languages.join(', ')}</div>
                  )}
                </div>
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-semibold">{profileData.avgRating > 0 ? profileData.avgRating.toFixed(1) : 'New'}</span>
                    <span className="text-muted-foreground ml-1">({profileData.totalReviews})</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {profileData.completed_orders || 0} orders
                  </div>
                </div>
                {profileData.skills && profileData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-6 border-t border-border pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Textarea
                  placeholder="Send a message to this freelancer..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={handleContact} disabled={sendingMessage} className="sm:self-end">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {sendingMessage ? 'Sending...' : 'Contact Me'}
                </Button>
                <div className="sm:self-end">
                  <ReportDialog reportedUserId={profileData.userId} buttonLabel="Report" />
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Services ({gigs.length})</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio ({portfolio.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            {gigs.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No services listed yet</CardContent></Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {gigs.map((gig) => (
                  <Card key={gig.id} className="hover:shadow-lg transition-shadow">
                    {gig.images?.[0] && (
                      <img src={gig.images[0]} alt={gig.title} className="w-full h-48 object-cover rounded-t-lg" />
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-2">{gig.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">${Number(gig.base_price).toFixed(0)}</span>
                        <span className="text-sm text-muted-foreground">{gig.delivery_time_days} days</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            {reviews.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No reviews yet</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{review.buyerName}</span>
                        <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                      {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio">
            {portfolio.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No portfolio uploaded yet</CardContent></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {portfolio.map((p, i) => (
                  <Card key={i} className="overflow-hidden">
                    {p.media_type === 'image' ? (
                      <img src={p.media_url} alt="Portfolio" className="w-full h-56 object-cover" />
                    ) : (
                      <video src={p.media_url} controls className="w-full h-56 object-cover bg-black" />
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <FreelancerProfileCard freelancerId={freelancerId} hidePortfolio />
              </CardContent>
            </Card>
            {freelancerId && <FreelancerFAQDisplay freelancerId={freelancerId} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FreelancerProfilePage;
