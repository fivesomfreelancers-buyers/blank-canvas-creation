import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, Banknote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Status = {
  connected: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  requirements?: string[];
  loginUrl?: string | null;
};

const FreelancerPayouts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const loadStatus = useCallback(async (withLoginLink = false) => {
    const { data, error } = await supabase.functions.invoke('stripe-connect-status', {
      body: { loginLink: withLoginLink },
    });
    if (error) {
      toast.error('Xogta Stripe lama soo helin. Isku day mar kale.');
      setStatus(null);
    } else {
      setStatus(data as Status);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    loadStatus(true);
  }, [user, navigate, loadStatus]);

  useEffect(() => {
    if (params.get('done') === '1') {
      toast.success('Onboarding-ka waa la dhammeeyay. Waxaan hubinaynaa xaaladda akoonkaaga.');
    }
  }, [params]);

  const startOnboarding = async () => {
    setWorking(true);
    const { data, error } = await supabase.functions.invoke('stripe-connect-onboard', {});
    setWorking(false);
    if (error || !data?.url) {
      toast.error('Lama furin Stripe onboarding. Isku day mar kale.');
      return;
    }
    window.location.href = data.url as string;
  };

  const ready = status?.connected && status.payoutsEnabled && status.chargesEnabled;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Stripe Payouts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ku xir akoonkaaga Stripe si lacagta orders-kaaga si toos ah kuugu soo gasho — Fivesom waxay qaadataa 15%
            commission iyo $1 service fee ee iibsadaha.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-primary" />
              Payout account
            </CardTitle>
            {!loading && (
              <Badge variant={ready ? 'default' : 'secondary'}>
                {ready ? 'Active' : status?.connected ? 'Pending' : 'Not connected'}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </div>
            ) : ready ? (
              <>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <p>
                    Akoonkaagu waa firfircoon. Lacagaha orders-ka cusub waxay si toos ah u gelayaan akoonkaaga Stripe,
                    ka dibna payout-ka bangigaaga.
                  </p>
                </div>
                {status?.loginUrl && (
                  <Button variant="outline" onClick={() => window.open(status.loginUrl!, '_blank')}>
                    Fur Stripe Dashboard <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                  <p>
                    {status?.connected
                      ? 'Onboarding-kaagu wuu dhammaystiran yahay. Fadlan dhammaystir xogta Stripe uu weydiisanayo.'
                      : 'Weli ma xirin akoon Stripe. Riix badhanka hoose si aad u bilowdo.'}
                  </p>
                </div>
                {!!status?.requirements?.length && (
                  <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                    {status.requirements.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                )}
                <Button onClick={startOnboarding} disabled={working}>
                  {working && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {status?.connected ? 'Sii wad onboarding-ka' : 'Ku xir Stripe'}
                </Button>
              </>
            )}
            <p className="text-xs text-muted-foreground">
              Haddii aadan Stripe isticmaalin, lacagtaada waxay ku gelaysaa Fivesom Wallet-kaaga oo waad la bixi kartaa
              ZAAD / EVC / eDahab ama bangi.
            </p>
          </CardContent>
        </Card>

        <Button variant="outline" onClick={() => navigate('/freelancer/wallet')}>
          My Wallet
        </Button>
      </div>
    </div>
  );
};

export default FreelancerPayouts;
