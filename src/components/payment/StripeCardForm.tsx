import React, { useEffect, useMemo, useState } from 'react';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe, type StripeElementStyle } from '@stripe/stripe-js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StripeCardFormProps {
  gigId: string;
  packageType: string;
  totalAmount: number;
  onSuccess: (orderId: string) => void;
}

const FieldBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-12 rounded-md border border-input bg-background px-3 flex items-center transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-ring">
    <div className="w-full">{children}</div>
  </div>
);

const CardFormInner: React.FC<StripeCardFormProps> = ({ gigId, packageType, totalAmount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { theme } = useTheme();
  const { toast } = useToast();

  const [cardholderName, setCardholderName] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const elementStyle: StripeElementStyle = useMemo(
    () => ({
      base: {
        fontSize: '15px',
        fontFamily: 'inherit',
        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
        '::placeholder': { color: theme === 'dark' ? '#94a3b8' : '#94a3b8' },
        iconColor: theme === 'dark' ? '#94a3b8' : '#64748b',
      },
      invalid: { color: '#ef4444', iconColor: '#ef4444' },
    }),
    [theme],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    if (!cardholderName.trim()) {
      setCardError('Please enter the name on the card.');
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) return;

    setIsProcessing(true);
    setCardError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-order-payment-intent', {
        body: { gigId, packageType, saveCard },
      });
      if (error) throw error;
      if (!data?.clientSecret) throw new Error(data?.error || 'Could not start the payment.');

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: { name: cardholderName.trim() },
        },
      });

      if (result.error) {
        setCardError(result.error.message ?? 'Your card could not be charged.');
        return;
      }

      if (result.paymentIntent?.status === 'succeeded' || result.paymentIntent?.status === 'processing') {
        // Server-side confirmation so the order is marked paid even if the webhook is delayed.
        await supabase.functions.invoke('verify-order-payment', {
          body: { paymentIntentId: result.paymentIntent.id },
        });
        toast({ title: 'Payment successful', description: 'Now submit your project requirements.' });
        onSuccess(data.orderId);
        return;
      }

      setCardError('Payment was not completed. Please try again.');
    } catch (err) {
      const message = (err as Error).message || 'Payment failed. Please try again.';
      setCardError(message);
      toast({ title: 'Payment failed', description: message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardholder-name" className="text-sm font-medium">Name on card</Label>
        <Input
          id="cardholder-name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Name on card"
          autoComplete="cc-name"
          className="h-12"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Card number</Label>
        <FieldBox>
          <CardNumberElement
            options={{ style: elementStyle, placeholder: '1111 1111 1111 1112', showIcon: true }}
            onChange={(e) => setCardError(e.error?.message ?? null)}
          />
        </FieldBox>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Expiry</Label>
          <FieldBox>
            <CardExpiryElement
              options={{ style: elementStyle, placeholder: 'MM/YY' }}
              onChange={(e) => setCardError(e.error?.message ?? null)}
            />
          </FieldBox>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">CVC</Label>
          <FieldBox>
            <CardCvcElement
              options={{ style: elementStyle, placeholder: 'CVC' }}
              onChange={(e) => setCardError(e.error?.message ?? null)}
            />
          </FieldBox>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="save-card" checked={saveCard} onCheckedChange={(v) => setSaveCard(v === true)} />
        <Label htmlFor="save-card" className="text-sm font-normal cursor-pointer">Add card to wallet</Label>
      </div>

      {cardError && <p className="text-sm text-destructive">{cardError}</p>}

      <Button
        type="submit"
        size="lg"
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        disabled={isProcessing || !stripe}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing…
          </>
        ) : (
          `Continue — Pay $${totalAmount}`
        )}
      </Button>

      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5" />
        Card details are handled directly by Stripe. Fivesom never stores them.
      </p>
    </form>
  );
};

const StripeCardForm: React.FC<StripeCardFormProps> = (props) => {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase.functions.invoke('stripe-public-config');
      if (cancelled) return;
      if (error || !data?.publishableKey) {
        setConfigError('Card payments are temporarily unavailable. Please try again later.');
        return;
      }
      setStripePromise(loadStripe(data.publishableKey));
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (configError) {
    return <p className="text-sm text-destructive">{configError}</p>;
  }

  if (!stripePromise) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading secure card form…
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CardFormInner {...props} />
    </Elements>
  );
};

export default StripeCardForm;
