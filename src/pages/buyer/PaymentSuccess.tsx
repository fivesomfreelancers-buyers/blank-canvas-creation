import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get('session_id');
  const [status, setStatus] = useState<'checking' | 'paid' | 'failed'>('checking');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      if (!sessionId) {
        setStatus('failed');
        return;
      }
      const { data, error } = await supabase.functions.invoke('verify-order-payment', {
        body: { sessionId },
      });
      if (cancelled) return;
      if (error || !data?.paid) {
        setStatus('failed');
        return;
      }
      setOrderId(data.orderId);
      setStatus('paid');
    };
    verify();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 pt-28 pb-12">
        <Card>
          <CardContent className="py-10 text-center space-y-4">
            {status === 'checking' && (
              <>
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
                <h1 className="text-xl font-semibold">Verifying your payment…</h1>
                <p className="text-sm text-muted-foreground">Fadlan sug, lacag bixinta waa la xaqiijinayaa.</p>
              </>
            )}
            {status === 'paid' && (
              <>
                <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                <h1 className="text-2xl font-bold">Payment Successful</h1>
                <p className="text-sm text-muted-foreground">
                  Lacagtaadu waa la helay. Hadda gudbi requirements-ka si freelancer-ku u bilaabo shaqada.
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate(`/buyer/order/${orderId}/requirements`, { replace: true })}
                  disabled={!orderId}
                >
                  Submit Requirements
                </Button>
              </>
            )}
            {status === 'failed' && (
              <>
                <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
                <h1 className="text-2xl font-bold">Payment Not Confirmed</h1>
                <p className="text-sm text-muted-foreground">
                  Ma xaqiijin karin lacag bixintaada. Haddii lacagta laga jaray, la xiriir support.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => navigate('/buyer/orders', { replace: true })}>
                    My Orders
                  </Button>
                  <Button className="flex-1" onClick={() => navigate('/support/contact')}>
                    Contact Support
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
