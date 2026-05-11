import { useAuth } from '@/hooks/useAuth';
import { usePresence } from '@/hooks/usePresence';

/** Mounts at the app root and keeps the signed-in user's last_seen fresh. */
const PresenceTracker = () => {
  const { user } = useAuth();
  usePresence(user?.id);
  return null;
};

export default PresenceTracker;
