
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Calendar, Edit, Eye } from 'lucide-react';
import FeedbackDisplay from '@/components/feedback/FeedbackDisplay';
import { supabase } from '@/integrations/supabase/client';

const FreelancerProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [freelancerData, setFreelancerData] = useState<any>(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: freelancer } = await supabase
        .from('freelancers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: reviews } = await supabase
        .from('gig_reviews')
        .select(`
          *,
          buyers(
            user_id
          ),
          profiles!gig_reviews_buyer_id_fkey(
            full_name
          ),
          orders(
            gigs(
              title
            )
          )
        `)
        .eq('gig_id', freelancer?.id)
        .order('created_at', { ascending: false });

      setProfile(profileData);
      setFreelancerData(freelancer);
      setFeedback(reviews || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = freelancerData?.rating || 0;
  const totalReviews = feedback.length;
  const skills = freelancerData?.skills || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Preview how buyers see your profile</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
            <Button variant="outline" className="w-full sm:w-auto">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button className="w-full sm:w-auto">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:space-x-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto sm:mx-0 flex-shrink-0">
                  {profile?.full_name?.[0]?.toUpperCase() || 'F'}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{profile?.full_name || 'Your Name'}</h2>
                  <p className="text-gray-600 mb-3 sm:mb-2 text-sm sm:text-base">{freelancerData?.bio || 'Add your professional title'}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-4 text-xs sm:text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-center sm:justify-start">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{profile?.location || 'Add location'}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Member since {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-6">
                    {totalReviews > 0 ? (
                      <>
                        <div className="flex items-center justify-center sm:justify-start">
                          <div className="flex items-center mr-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-4 h-4 ${star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="font-medium">{averageRating.toFixed(1)}</span>
                          <span className="text-gray-600 ml-1">({totalReviews} reviews)</span>
                        </div>
                        <span className="text-gray-600 hidden sm:inline">•</span>
                        <span className="text-gray-600 text-center sm:text-left">{freelancerData?.completed_orders || 0} orders completed</span>
                      </>
                    ) : (
                      <span className="text-gray-600 text-center sm:text-left">No reviews yet - complete your first order to get started</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">About Me</CardTitle>
            </CardHeader>
            <CardContent>
              {freelancerData?.bio ? (
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {freelancerData.bio}
                </p>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Add your bio to tell buyers about your experience and expertise
                </p>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Add your skills to help buyers find you
                </p>
              )}
            </CardContent>
          </Card>

          {/* Feedback Display */}
          <FeedbackDisplay 
            feedback={feedback} 
            averageRating={averageRating}
            totalReviews={totalReviews}
          />
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;
