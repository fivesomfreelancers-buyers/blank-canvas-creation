import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Shield, Clock, CheckCircle, ChevronLeft, ChevronRight, Tag, Play } from 'lucide-react';
import UnifiedGallery from '@/components/gig/UnifiedGallery';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Navbar from '@/components/Navbar';
import OnlineIndicator from '@/components/presence/OnlineIndicator';
import VerifiedBadge from '@/components/VerifiedBadge';
import BlueTickBadge from '@/components/BlueTickBadge';
import FreelancerProfileCard from '@/components/profile/FreelancerProfileCard';
import ReportDialog from '@/components/ReportDialog';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { getVipTheme, resolveVipTier } from '@/lib/vipTheme';
import { useTheme } from '@/components/ThemeProvider';

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme: mode } = useTheme();
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('basic');
  const [faqs, setFaqs] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [docs, setDocs] = useState<{ url: string; name: string }[]>([]);
  

  useEffect(() => {
    const fetchGig = async () => {
      if (!id) return;

      const { data: gigData, error } = await supabase
        .from('gigs')
        .select(`*, freelancers ( id, user_id, rating, completed_orders, is_verified, has_blue_tick, bio, vip_tier, vip_expires_at )`)
        .eq('id', id)
        .single();

      if (error || !gigData) { setLoading(false); return; }

      const { data: profile } = await (supabase as any).from('public_profiles').select('full_name, profile_image_url, languages').eq('id', gigData.freelancers?.user_id).single();

      

      const { data: reviews } = await (supabase as any).from('public_gig_reviews').select('rating, comment, created_at').eq('gig_id', id);

      const reviewsWithNames = (reviews || []).map((review) => ({ ...review, buyerName: 'Anonymous Buyer' }));

      const avgRating = reviews && reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

      const { data: pkgData } = await supabase.from('gig_packages').select('*').eq('gig_id', id).eq('is_active', true).order('price', { ascending: true });
      setPackages(pkgData || []);
      if (pkgData && pkgData.length > 0) setSelectedPackage(pkgData[0].package_type);

      if (gigData.freelancers?.id) {
        const { data: faqData } = await supabase.from('freelancer_faqs').select('*').eq('freelancer_id', gigData.freelancers.id);
        setFaqs(faqData || []);
      }

      // Load gig media (videos + documents)
      const { data: mediaData } = await supabase.from('gig_media').select('*').eq('gig_id', id).order('created_at', { ascending: true });
      const vid = (mediaData || []).find((m: any) => m.file_type === 'video');
      setVideoUrl(vid ? vid.file_url : null);
      setDocs((mediaData || [])
        .filter((m: any) => m.file_type === 'document')
        .map((m: any) => ({ url: m.file_url, name: decodeURIComponent(m.file_url.split('/').pop()?.split('?')[0] || 'Document') })));

      setGig({
        ...gigData,
        freelancerName: profile?.full_name || 'Anonymous',
        freelancerImageUrl: profile?.profile_image_url,
        freelancerUserId: gigData.freelancers?.user_id,
        freelancerId: gigData.freelancers?.id,
        freelancerLanguages: profile?.languages || [],
        rating: avgRating,
        totalReviews: reviews?.length || 0,
        reviews: reviewsWithNames,
        isVerified: gigData.freelancers?.is_verified || false,
        hasBlueTick: !!(gigData.freelancers as any)?.has_blue_tick,
        completedOrders: gigData.freelancers?.completed_orders || 0,
        freelancerBio: gigData.freelancers?.bio || '',
        vipTier: resolveVipTier(gigData.freelancers?.vip_tier, gigData.freelancers?.vip_expires_at),
      });
      setLoading(false);
    };

    fetchGig();

    // Realtime: refresh when a new review is added for this gig
    const channel = supabase
      .channel(`gig-${id}-reviews`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gig_reviews', filter: `gig_id=eq.${id}` }, () => fetchGig())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

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
    if (!user) { toast({ title: "Please log in", description: "You need to be logged in to contact a freelancer.", variant: "destructive" }); return; }
    if (!gig?.freelancerUserId) { toast({ title: "Error", description: "Seller information unavailable.", variant: "destructive" }); return; }
    if (user.id === gig.freelancerUserId) { toast({ title: "That's your gig", description: "You can't message yourself.", variant: "destructive" }); return; }
    setSendingMessage(true);
    try {
      const conversationId = await getOrCreateConversation(gig.freelancerUserId);
      if (!conversationId) throw new Error('Could not create conversation');
      if (contactMessage.trim()) {
        const { error } = await supabase.from('messages').insert({ sender_id: user.id, receiver_id: gig.freelancerUserId, conversation_id: conversationId, message: contactMessage.trim() });
        if (error) throw error;
      }
      // Decide route by role
      const { data: buyerCheck } = await supabase.from('buyers').select('id').eq('user_id', user.id).maybeSingle();
      const route = buyerCheck ? '/buyer/messages' : '/freelancer/messages';
      setContactMessage('');
      toast({ title: "Opening chat…", description: `Continuing your conversation with ${gig.freelancerName}.` });
      navigate(route, { state: { openConversationId: conversationId, partnerId: gig.freelancerUserId } });
    } catch (err: any) {
      console.error('handleContact error', err);
      toast({ title: "Error", description: err?.message || "Failed to open chat.", variant: "destructive" });
    } finally { setSendingMessage(false); }
  };

  const handleOrder = (pkg?: any) => {
    const orderPkg = pkg || packages.find(p => p.package_type === selectedPackage) || { name: 'Standard', price: gig.base_price, delivery_time: `${gig.delivery_time_days} days`, revisions: '2', features: [] };
    navigate('/payment', {
      state: {
        gig: { id: gig.id, title: gig.title, freelancer: { name: gig.freelancerName, avatar: gig.freelancerName?.[0] || 'F', profileImage: gig.freelancerImageUrl || '' } },
        selectedPackage: { name: orderPkg.name, price: orderPkg.price, delivery: orderPkg.delivery_time || `${gig.delivery_time_days} days`, revisions: orderPkg.revisions || '2', features: orderPkg.features || [] }
      }
    });
  };

  const initials = gig?.freelancerName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'F';

  if (loading) {
    return (<div className="min-h-screen bg-background"><Navbar /><div className="max-w-7xl mx-auto px-4 py-8 pt-24 text-center text-muted-foreground">Loading gig details...</div></div>);
  }
  if (!gig) {
    return (<div className="min-h-screen bg-background"><Navbar /><div className="max-w-7xl mx-auto px-4 py-8 pt-24 text-center"><h2 className="text-2xl font-bold text-foreground">Gig not found</h2><Button onClick={() => navigate('/explore')} className="mt-4">Browse Services</Button></div></div>);
  }

  const images = gig.images && gig.images.length > 0 ? gig.images : [];
  const currentPkg = packages.find(p => p.package_type === selectedPackage);
  const vipTheme = getVipTheme(gig.vipTier, mode);
  const vipCardStyle = vipTheme ? { background: vipTheme.cardBg, boxShadow: vipTheme.cardShadow, borderColor: 'transparent' } : undefined;
  const vipCardClass = vipTheme ? 'border-0 backdrop-blur-xl' : '';

  return (
    <div className="min-h-screen bg-background relative" style={vipTheme ? { backgroundImage: vipTheme.pageGlow } : undefined}>
      <SEO
        title={`${gig.title} | FIVESOM`}
        description={(gig.description || gig.title || '').toString().slice(0, 160)}
        canonical={`/gig/${gig.id}`}
        type="product"
        image={images[0]}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: gig.title,
            description: (gig.description || '').toString().slice(0, 500),
            image: images,
            offers: {
              '@type': 'Offer',
              price: Number(gig.base_price || 0),
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            },
            ...(gig.rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: gig.rating, reviewCount: gig.reviewCount || 1 } } : {}),
          },
          ...(faqs && faqs.length > 0 ? [{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f: any) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }] : []),
        ]}
      />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Unified Media Gallery (video + images) */}
            <UnifiedGallery videoUrl={videoUrl} images={images} title={gig.title} />

            {/* Title & Info */}
            <Card className={vipCardClass} style={vipCardStyle}>
              <CardHeader>
                {vipTheme && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full w-fit text-[10px] font-bold tracking-widest uppercase"
                       style={{ background: vipTheme.gradient, color: '#0B0E14', boxShadow: `0 0 16px ${vipTheme.accent}aa` }}>
                    <vipTheme.Icon className="w-3.5 h-3.5" /> {vipTheme.label}
                  </div>
                )}
                <h1 className={`text-2xl font-bold mb-2 ${vipTheme ? 'bg-clip-text text-transparent' : ''}`}
                    style={vipTheme ? { backgroundImage: vipTheme.textGradient } : undefined}>{gig.title}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Avatar className="w-8 h-8" style={vipTheme ? { boxShadow: vipTheme.ring } : undefined}>
                        <AvatarImage src={gig.freelancerImageUrl || ''} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-0.5 -right-0.5"><OnlineIndicator userId={gig.freelancerUserId} dotOnly /></span>
                    </div>
                    <span className="font-medium inline-flex items-center gap-1.5">
                      {gig.freelancerName}
                      {gig.isVerified && <VerifiedBadge size="sm" />}
                      {vipTheme && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background: vipTheme.gradient, color: '#0B0E14' }}>
                          <vipTheme.Icon className="w-2.5 h-2.5" /> {vipTheme.shortLabel}
                        </span>
                      )}
                    </span>
                    <OnlineIndicator userId={gig.freelancerUserId} />
                  </div>
                  {gig.totalReviews > 0 && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{gig.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground ml-1">({gig.totalReviews})</span>
                    </div>
                  )}
                </div>
                {/* Tags */}
                {gig.tags && gig.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {gig.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="description">
                  <TabsList>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews ({gig.totalReviews})</TabsTrigger>
                    <TabsTrigger value="about">About Seller</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="mt-4">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{gig.description}</p>
                  </TabsContent>
                  <TabsContent value="requirements" className="mt-4">
                    {gig.buyer_requirements ? (
                      <div>
                        <h3 className="font-semibold mb-2">What the seller needs from you</h3>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{gig.buyer_requirements}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No specific requirements listed</p>
                    )}
                  </TabsContent>
                  <TabsContent value="reviews" className="mt-4">
                    {gig.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {gig.reviews.map((review: any, idx: number) => (
                          <div key={idx} className="border-b border-border pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{review.buyerName}</span>
                              <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
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
                    {gig.freelancerId ? (
                      <FreelancerProfileCard freelancerId={gig.freelancerId} />
                    ) : (
                      <p className="text-muted-foreground text-sm">Profile unavailable</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Attached Documents */}
            {docs.length > 0 && (
              <Card className={vipCardClass} style={vipCardStyle}>
                <CardHeader>
                  <CardTitle>Attached Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {docs.map((d, idx) => (
                    <a
                      key={idx}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-md border border-border hover:bg-muted/50 transition-colors text-sm"
                    >
                      <span className="truncate flex-1">{d.name}</span>
                      <span className="text-primary text-xs">Open</span>
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* FAQ Section */}
            {faqs.length > 0 && (
              <Card className={vipCardClass} style={vipCardStyle}>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, idx) => (
                      <AccordionItem key={faq.id || idx} value={`faq-${idx}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Package Selection */}
            {packages.length > 0 ? (
              <Card className={vipCardClass} style={vipCardStyle}>
                <CardHeader className="pb-3">
                  <div className="flex border-b border-border">
                    {packages.map((pkg) => (
                      <button
                        key={pkg.package_type}
                        onClick={() => setSelectedPackage(pkg.package_type)}
                        className={`flex-1 py-3 text-sm font-medium text-center capitalize transition-colors border-b-2 ${
                          selectedPackage === pkg.package_type
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {pkg.package_type}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentPkg && (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{currentPkg.name}</h3>
                        <span className="text-2xl font-bold text-green-600">${Number(currentPkg.price).toFixed(2)}</span>
                      </div>
                      {currentPkg.delivery_time && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{currentPkg.delivery_time} delivery</span>
                        </div>
                      )}
                      {currentPkg.revisions && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>🔄 {currentPkg.revisions} revision{currentPkg.revisions !== '1' ? 's' : ''}</span>
                        </div>
                      )}
                      {currentPkg.features && currentPkg.features.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-border">
                          {currentPkg.features.map((feat: string, idx: number) => (
                            <div key={idx} className="flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button onClick={() => handleOrder(currentPkg)} className="w-full text-white border-0"
                              style={vipTheme ? { background: vipTheme.gradient, color: '#0B0E14', boxShadow: `0 0 16px ${vipTheme.accent}80` } : undefined}>
                        Continue (${Number(currentPkg.price).toFixed(2)})
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className={vipCardClass} style={vipCardStyle}>
                <CardHeader><CardTitle>Order This Gig</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <span className="text-2xl font-bold text-green-600">${Number(gig.base_price).toFixed(2)}</span>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{gig.delivery_time_days} days delivery</span>
                  </div>
                  <Button onClick={() => handleOrder()} className="w-full">Continue (${Number(gig.base_price).toFixed(2)})</Button>
                </CardContent>
              </Card>
            )}

            {/* About Seller */}
            <Card className={vipCardClass} style={vipCardStyle}>
              <CardHeader><CardTitle>About the Seller</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12" style={vipTheme ? { boxShadow: vipTheme.ring } : undefined}>
                      <AvatarImage src={gig.freelancerImageUrl || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5"><OnlineIndicator userId={gig.freelancerUserId} dotOnly /></span>
                  </div>
                  <div>
                    <h4 className="font-medium inline-flex items-center gap-1.5">{gig.freelancerName}{gig.hasBlueTick && <BlueTickBadge size="sm" />}</h4>
                    <p className="text-sm text-muted-foreground">{gig.completedOrders} orders completed</p>
                    <OnlineIndicator userId={gig.freelancerUserId} />
                  </div>
                </div>
                {vipTheme && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold"
                       style={{ background: vipTheme.accentSoft, color: vipTheme.accent, boxShadow: `inset 0 0 0 1px ${vipTheme.accent}55` }}>
                    <vipTheme.Icon className="w-4 h-4" /> {vipTheme.label}
                  </div>
                )}
                {gig.isVerified && (
                  <div className="flex items-center text-sm">
                    <Shield className="w-4 h-4 mr-2 text-green-500" />
                    <span>Verified seller</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Seller */}
            <Card className={vipCardClass} style={vipCardStyle}>
              <CardHeader><CardTitle>Contact Seller</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea placeholder="Hi, I'm interested in your service..." value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} rows={3} />
                <Button onClick={handleContact} disabled={sendingMessage} className="w-full" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </Button>
              </CardContent>
            </Card>

            {/* Report */}
            <div className="flex justify-center">
              <ReportDialog
                reportedUserId={gig.freelancerUserId}
                relatedGigId={gig.id}
                buttonLabel="Report this gig"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetails;
