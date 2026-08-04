import React, { useEffect, useMemo, useRef, useState } from 'react';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  gigId: string;
  packageType: string;
  amount: number;
}

const cssVar = (name: string, fallback: string) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `hsl(${v})` : fallback;
};

const CardFields: React.FC<{
  amount: number;
  clientSecret: string;
  onDone: (orderId: string) => void;
  intentId: string;
}> = ({
  amount,
  clientSecret,
  onDone,
  intentId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [cardElementReady, setCardElementReady] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const submitLock = useRef(false);
  const cardElementRef = useRef<StripeCardElement | null>(null);

  const friendlyPaymentError = (error: unknown) => {
    const stripeError = error as { code?: string; decline_code?: string; message?: string };
    if (stripeError.decline_code === 'insufficient_funds') return 'Insufficient funds. Please use another card.';
    if (stripeError.code === 'card_declined' || stripeError.decline_code) return 'Card declined. Please use another card.';
    if (stripeError.code === 'invalid_number' || stripeError.code === 'incorrect_number') return 'Invalid card number.';
    if (stripeError.code === 'invalid_expiry_month' || stripeError.code === 'invalid_expiry_year') return 'Invalid card expiry date.';
    if (stripeError.code === 'invalid_cvc' || stripeError.code === 'incorrect_cvc') return 'Invalid security code (CVC).';
    if (stripeError.code === 'api_connection_error') return 'Network error. Check your connection and try again.';
    return stripeError.message?.includes('network')
      ? 'Network error. Check your connection and try again.'
      : 'Payment could not be completed. Please check your card details and try again.';
  };

  const pay = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !cardElementReady || !cardComplete || submitLock.current) return;
    if (!cardholderName.trim()) {
      toast({ title: 'Cardholder name required', description: 'Enter the name shown on the card.', variant: 'destructive' });
      return;
    }
    submitLock.current = true;
    setSubmitting(true);
    try {
      // Use the mounted CardElement directly. This avoids confirmPayment being
      // called against an Elements collection whose PaymentElement was remounted.
      const mountedCard = cardElementRef.current ?? elements.getElement(CardElement);
      if (!mountedCard) {
        throw new Error('Card form is still loading. Please wait a moment and try again.');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: mountedCard,
          billing_details: {
            name: cardholderName.trim(),
          },
        },
      });
      if (error) throw error;
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
        description: friendlyPaymentError(e),
        variant: 'destructive',
      });
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={pay}>
      <div className="space-y-2">
        <Label htmlFor="cardholder-name">Cardholder Name</Label>
        <Input
          id="cardholder-name"
          autoComplete="cc-name"
          value={cardholderName}
          onChange={(event) => setCardholderName(event.target.value)}
          placeholder="Name shown on card"
          disabled={submitting}
        />
      </div>
      <div className="space-y-2">
        <Label>Card Number, Expiry Date &amp; CVC</Label>
        <div className="rounded-md border border-input bg-background px-3 py-3">
          <CardElement
            onReady={(element) => {
              cardElementRef.current = element;
              setCardElementReady(true);
            }}
            onChange={(event) => {
              setCardComplete(event.complete);
              setCardError(event.error?.message ?? null);
            }}
            options={{
              hidePostalCode: true,

              style: {
                base: {
                  color: cssVar('--foreground', '#0f172a'),
                  iconColor: cssVar('--muted-foreground', '#64748b'),
                  fontFamily: 'inherit',
                  fontSize: '16px',
                  '::placeholder': { color: cssVar('--muted-foreground', '#64748b') },
                },
                invalid: { color: cssVar('--destructive', '#ef4444') },
              },
            }}
          />
        </div>
        {cardError && <p className="text-sm text-destructive" role="alert">{cardError}</p>}
      </div>
      <Button
        type="submit"
        disabled={submitting || !stripe || !elements || !cardElementReady || !cardComplete}
        className="w-full h-12 text-base font-semibold"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" /> Pay ${amount.toFixed(2)} — Fivesom Secure
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" /> Xogta card-kaaga waxaa lagu sireeyaa 256-bit encryption. Fivesom weligeed ma kaydiso
        lambarka card-kaaga.
      </p>
    </form>
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
      if (err || !data?.clientSecret || !data?.publishableKey || !data?.orderId) {
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
      loader: 'always' as const,
      appearance: {
        theme: (theme === 'dark' ? 'night' : 'stripe') as 'night' | 'stripe',
        variables: {
          colorPrimary: cssVar('--primary', '#16a34a'),
          colorBackground: cssVar('--card', theme === 'dark' ? '#111827' : '#ffffff'),
          colorText: cssVar('--foreground', theme === 'dark' ? '#f9fafb' : '#0f172a'),
          colorDanger: cssVar('--destructive', '#ef4444'),
          borderRadius: '8px',
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
          clientSecret={clientSecret}
          intentId={intentId}
          onDone={(orderId) => navigate(`/buyer/payment-success?order_id=${encodeURIComponent(orderId)}`, { replace: true })}
        />
      </Elements>
    </div>
  );
};

export default FivesomCardForm;
