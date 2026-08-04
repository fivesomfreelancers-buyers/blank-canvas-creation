import React, { useEffect, useMemo, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider';

interface Props {
  gigId: string;
  packageType: string;
  amount: number;
}

const cssVar = (name: string, fallback: string) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `hsl(${v})` : fallback;
};

const CardFields: React.FC<{ amount: number; onDone: (orderId: string) => void; intentId: string }> = ({
  amount,
  onDone,
  intentId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const pay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });
      if (error) throw new Error(error.message || 'Lacag bixinta way guuldareysatay');
      if (paymentIntent?.status !== 'succeeded') {
        throw new Error('Lacag bixinta lama xaqiijin. Fadlan isku day mar kale.');
      }
      const { data, error: verifyErr } = await supabase.functions.invoke('verify-order-payment', {
        body: { paymentIntentId: intentId },
      });
      if (verifyErr || !data?.paid) throw new Error('Lacagta lama xaqiijin karin. La xiriir Fivesom Support.');
      onDone(data.orderId);
    } catch (e) {
      toast({
        title: 'Payment Failed',
        description: (e as Error).message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <PaymentElement
        options={{
          layout: 'tabs',
          fields: { billingDetails: { address: { country: 'auto', postalCode: 'auto' } } },
          terms: { card: 'never' },
        }}
      />
      <Button onClick={pay} disabled={submitting || !stripe} className="w-full h-12 text-base font-semibold">
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" /> Pay ${amount} — Fivesom Secure
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" /> Xogta card-kaaga waxaa lagu sireeyaa 256-bit encryption. Fivesom weligeed ma kaydiso
        lambarka card-kaaga.
      </p>
    </div>
  );
};

const FivesomCardForm: React.FC<Props> = ({ gigId, packageType, amount }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const { data, error: err } = await supabase.functions.invoke('create-order-payment-intent', {
        body: { gigId, packageType },
      });
      if (cancelled) return;
      if (err || !data?.clientSecret || !data?.publishableKey) {
        setError('Lacag bixinta lama diyaarin karin. Fadlan isku day mar kale.');
        return;
      }
      setStripePromise(loadStripe(data.publishableKey));
      setClientSecret(data.clientSecret);
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [gigId, packageType]);

  const options = useMemo(() => {
    if (!clientSecret) return null;
    return {
      clientSecret,
      appearance: {
        theme: (theme === 'dark' ? 'night' : 'stripe') as 'night' | 'stripe',
        variables: {
          colorPrimary: cssVar('--primary', '#16a34a'),
          colorBackground: cssVar('--card', theme === 'dark' ? '#111827' : '#ffffff'),
          colorText: cssVar('--foreground', theme === 'dark' ? '#f9fafb' : '#0f172a'),
          colorDanger: cssVar('--destructive', '#ef4444'),
          borderRadius: '10px',
          fontFamily: 'inherit',
          spacingUnit: '4px',
        },
      },
      // Card only — Link and external wallets are intentionally not offered.
      wallets: { applePay: 'never' as const, googlePay: 'never' as const },
    };
  }, [clientSecret, theme]);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!clientSecret || !stripePromise || !options) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
        <Loader2 className="w-4 h-4 animate-spin" /> Diyaarinta foomka lacag bixinta…
      </div>
    );
  }

  const intentId = clientSecret.split('_secret_')[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <CreditCard className="w-4 h-4 text-primary" />
        Card Details
      </div>
      <Elements stripe={stripePromise} options={options}>
        <CardFields
          amount={amount}
          intentId={intentId}
          onDone={(orderId) => navigate(`/buyer/order/${orderId}/requirements`, { replace: true })}
        />
      </Elements>
    </div>
  );
};

export default FivesomCardForm;
