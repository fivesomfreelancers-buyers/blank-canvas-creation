ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'user';

CREATE OR REPLACE FUNCTION public.wallet_credit_on_order_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _uid uuid;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
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
$$;

DROP TRIGGER IF EXISTS trg_wallet_credit_on_order_complete ON public.orders;
CREATE TRIGGER trg_wallet_credit_on_order_complete
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.wallet_credit_on_order_complete();

CREATE OR REPLACE FUNCTION public.wallet_hold_on_withdrawal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _uid uuid; _bal numeric;
BEGIN
  SELECT user_id INTO _uid FROM public.freelancers WHERE id = NEW.freelancer_id;
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Freelancer account not found';
  END IF;

  SELECT COALESCE(balance, 0) INTO _bal FROM public.wallets WHERE user_id = _uid FOR UPDATE;
  IF _bal IS NULL THEN
    INSERT INTO public.wallets (user_id, balance) VALUES (_uid, 0)
    ON CONFLICT (user_id) DO NOTHING;
    _bal := 0;
  END IF;

  IF COALESCE(NEW.amount, 0) < 20 THEN
    RAISE EXCEPTION 'Ugu yaraan $20.00 ayaad la bixi kartaa.';
  END IF;

  IF COALESCE(NEW.amount, 0) > _bal THEN
    RAISE EXCEPTION 'Lacag ku filan uguma jirto wallet-kaaga. Waxaad la bixi kartaa oo keliya inta kuugu jirta Available Balance-ka.';
  END IF;

  UPDATE public.wallets
    SET balance = COALESCE(balance, 0) - COALESCE(NEW.amount, 0),
        updated_at = now()
    WHERE user_id = _uid;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wallet_hold_on_withdrawal ON public.withdrawals;
CREATE TRIGGER trg_wallet_hold_on_withdrawal
BEFORE INSERT ON public.withdrawals
FOR EACH ROW EXECUTE FUNCTION public.wallet_hold_on_withdrawal();

CREATE OR REPLACE FUNCTION public.wallet_refund_on_withdrawal_reject()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _uid uuid;
BEGIN
  IF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    SELECT user_id INTO _uid FROM public.freelancers WHERE id = NEW.freelancer_id;
    IF _uid IS NOT NULL THEN
      UPDATE public.wallets
        SET balance = COALESCE(balance, 0) + COALESCE(NEW.amount, 0),
            updated_at = now()
        WHERE user_id = _uid;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wallet_refund_on_withdrawal_reject ON public.withdrawals;
CREATE TRIGGER trg_wallet_refund_on_withdrawal_reject
AFTER UPDATE ON public.withdrawals
FOR EACH ROW EXECUTE FUNCTION public.wallet_refund_on_withdrawal_reject();