import React from 'react';

interface BackToDashboardProps {
  className?: string;
  to?: string;
}

// Intentionally render nothing — global "Back to Dashboard" buttons removed per request.
const BackToDashboard: React.FC<BackToDashboardProps> = () => null;

export default BackToDashboard;
