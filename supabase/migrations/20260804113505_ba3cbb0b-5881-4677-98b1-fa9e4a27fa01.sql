ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payout_mode text NOT NULL DEFAULT 'wallet';

CREATE OR REPLACE FUNCTION public.wallet_credit_on_order_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE _uid uuid;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    -- Orders paid out directly via Stripe Connect must not credit the internal wallet.
    IF COALESCE(NEW.payout_mode, 'wallet') = 'stripe_connect' THEN
      RETURN NEW;
    END IF;

    SELECT user_id INTO _uid FROM public.freelancers WHERE id = NEW.freelancer_id;
    IF _uid IS NOT NULL THEN
      INSERT INTO public.wallets (user_id, balance)
      VALUES (_uid, COALESCE(NEW.amount, 0))
      ON CONFLICT (user_id) DO UPDATE
        SET balance = COALESCE(public.wallets.balance, 0) + COALESCE(NEW.amount, 0),
            updated_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE UPDATE (payout_mode) ON public.orders FROM authenticated;
GRANT ALL ON public.orders TO service_role;