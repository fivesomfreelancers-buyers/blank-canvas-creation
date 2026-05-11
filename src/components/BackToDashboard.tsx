import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface BackToDashboardProps {
  className?: string;
  to?: string;
}

const BackToDashboard: React.FC<BackToDashboardProps> = ({ className = '', to }) => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const target = to || (userRole === 'freelancer' ? '/freelancer/dashboard' : '/buyer/dashboard');

  return (
    <Button
      variant="ghost"
      onClick={() => navigate(target)}
      className={`mb-4 ${className}`}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Dashboard
    </Button>
  );
};

export default BackToDashboard;
