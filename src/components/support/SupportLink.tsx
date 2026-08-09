import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface SupportLinkProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Sends the user straight into their Fivesom Support conversation.
 * Signed-out visitors are told to create an account first and sent to sign up.
 */
const SupportLink: React.FC<SupportLinkProps> = ({ children = 'Fivesom Support', className }) => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  const go = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info('Create a free account to chat with Fivesom Support', {
        description: 'Sign up or log in, then Support will be waiting in your Messages inbox.',
        duration: 6000,
      });
      navigate('/register', { state: { from: '/support/messages' } });
      return;
    }
    navigate(userRole === 'freelancer' ? '/freelancer/messages' : '/buyer/messages');
  };

  return (
    <a href="#support" onClick={go} className={className ?? 'text-primary underline'}>
      {children}
    </a>
  );
};

export default SupportLink;
