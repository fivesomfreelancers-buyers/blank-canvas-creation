import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FreelancerProfileCard from '@/components/profile/FreelancerProfileCard';

interface ProfilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  profile: any;
  freelancerData: any;
  feedback: any[];
}

const ProfilePreviewModal = ({ open, onClose, freelancerData }: ProfilePreviewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Public Profile Preview</DialogTitle></DialogHeader>
        {freelancerData?.id
          ? <FreelancerProfileCard freelancerId={freelancerData.id} />
          : <p className="text-sm text-muted-foreground">Profile not yet created.</p>}
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePreviewModal;
