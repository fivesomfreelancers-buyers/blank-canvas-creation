import React, { useEffect } from 'react';

const VipCheckout: React.FC = () => {
  useEffect(() => {
    window.location.replace('/vip');
  }, []);

  return null;
};

export default VipCheckout;
