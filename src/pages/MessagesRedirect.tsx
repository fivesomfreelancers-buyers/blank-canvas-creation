import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Entry point used by email links (e.g. /messages?c=<conversationId>).
 * Sends the user into the right inbox for their role, or to login first.
 */
const MessagesRedirect: React.FC = () => {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    const params = new URLSearchParams(location.search);
    const conversationId = params.get('c') || params.get('conversation') || undefined;
    const state = conversationId ? { openConversationId: conversationId } : { openConversation: true };

    if (!user) {
      navigate('/login', { replace: true, state: { from: `/messages${location.search}` } });
      return;
    }

    const suffix = conversationId ? `?c=${encodeURIComponent(conversationId)}` : '';

    if (userRole === 'freelancer') {
      navigate(`/freelancer/messages${suffix}`, { replace: true, state });
    } else if (userRole === 'buyer') {
      navigate(`/buyer/messages${suffix}`, { replace: true, state });
    } else {
      // Neutral member: let them pick / upgrade a role first
      navigate('/select-role', { replace: true });
    }
  }, [user, userRole, isLoading, navigate, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Opening your messages...</span>
      </div>
    </div>
  );
};

export default MessagesRedirect;
