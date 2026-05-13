import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Calendar, CheckCircle } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';

interface ProfilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  profile: any;
  freelancerData: any;
  feedback: any[];
}

const ProfilePreviewModal = ({ open, onClose, profile, freelancerData, feedback }: ProfilePreviewModalProps) => {
  const name = profile?.full_name || 'Freelancer';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  const skills = freelancerData?.skills || [];
  const avgRating = freelancerData?.rating || 0;
  const totalReviews = feedback.length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Public Profile Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-5">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile?.profile_image_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-foreground">{name}</h2>
                {freelancerData?.is_verified && <VerifiedBadge showLabel size="md" />}
              </div>
              <p className="text-muted-foreground mb-2">{profile?.professional_title || freelancerData?.bio || 'Freelancer'}</p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{profile?.location || 'Not specified'}</span>
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />Member since {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-4">
                {totalReviews > 0 ? (
                  <>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= avgRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                      ))}
                      <span className="ml-1 font-medium">{avgRating.toFixed(1)}</span>
                      <span className="text-muted-foreground ml-1">({totalReviews})</span>
                    </div>
                    <span className="text-muted-foreground">{freelancerData?.completed_orders || 0} orders</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">New freelancer</span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {(freelancerData?.bio || profile?.bio) && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">About</h3>
              <p className="text-muted-foreground leading-relaxed">{freelancerData?.bio || profile?.bio}</p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {feedback.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Reviews</h3>
              <div className="space-y-3">
                {feedback.slice(0, 3).map((r: any, i: number) => (
                  <div key={i} className="border rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePreviewModal;
