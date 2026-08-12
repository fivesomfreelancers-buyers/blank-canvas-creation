import React from 'react';
import { Badge } from '@/components/ui/badge';

/**
 * Consistent role colouring across every admin/founder surface:
 * Freelancer → blue, Buyer → red, User → white/neutral,
 * admin roles keep a distinct amber/violet tone.
 */
const styles: Record<string, string> = {
  freelancer: 'text-blue-500 border-blue-500/40 bg-blue-500/10',
  buyer: 'text-red-500 border-red-500/40 bg-red-500/10',
  user: 'text-foreground border-border bg-foreground/5',
  admin: 'text-amber-500 border-amber-500/40 bg-amber-500/10',
  super_admin: 'text-amber-500 border-amber-500/40 bg-amber-500/10',
  founder: 'text-violet-500 border-violet-500/40 bg-violet-500/10',
};

const labels: Record<string, string> = {
  super_admin: 'Super Admin',
};

interface Props {
  role?: string | null;
  className?: string;
}

const RoleBadge: React.FC<Props> = ({ role, className = '' }) => {
  const key = (role || 'user').toLowerCase();
  return (
    <Badge
      variant="outline"
      className={`text-xs capitalize font-medium ${styles[key] || styles.user} ${className}`}
    >
      {labels[key] || key.replace(/_/g, ' ')}
    </Badge>
  );
};

export default RoleBadge;
