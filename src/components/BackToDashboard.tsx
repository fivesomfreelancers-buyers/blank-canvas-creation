import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackToDashboardProps {
  className?: string;
  to?: string;
  label?: string;
}

const BackToDashboard: React.FC<BackToDashboardProps> = ({ className, to, label }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Infer default destination based on current path
  const inferredTo = (() => {
    if (to) return to;
    const p = location.pathname;
    if (p.startsWith('/freelancer')) return '/freelancer/dashboard';
    if (p.startsWith('/buyer')) return '/buyer/dashboard';
    if (p.startsWith('/admin')) return '/admin';
    return '/';
  })();

  const inferredLabel = label ?? 'Back to Dashboard';

  const handleClick = () => {
    // Use history if possible, otherwise fall back to inferred dashboard
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(inferredTo);
    }
  };

  return (
    <div
      className={cn(
        'sticky top-0 z-30 -mx-4 sm:mx-0 mb-4 sm:mb-6 px-4 sm:px-0 py-2 sm:py-0',
        'bg-background/80 sm:bg-transparent backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:backdrop-blur-0',
        className
      )}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label={inferredLabel}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-3 py-2 sm:px-4 sm:py-2',
          'text-sm font-medium text-foreground',
          'border border-border bg-card/60 hover:bg-accent hover:text-accent-foreground',
          'shadow-sm transition-all duration-200 hover:-translate-x-0.5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{inferredLabel}</span>
      </button>
    </div>
  );
};

export default BackToDashboard;
