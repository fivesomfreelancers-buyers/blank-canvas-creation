import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Building2,
  Smartphone,
  User,
  MapPin,
  Phone,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Mobile money provider logos
import zaadLogo from '@/assets/zaad-logo.png';
import evcLogo from '@/assets/evc-logo.png';
import mpesaLogo from '@/assets/mpesa-logo.png';
import premierWalletLogo from '@/assets/premier-wallet-logo.png';

const mobileMoneyOptions = [
  { id: 'evc', name: 'EVC Plus', logo: evcLogo },
  { id: 'zaad', name: 'ZAAD', logo: zaadLogo },
  { id: 'mpesa', name: 'M-Pesa', logo: mpesaLogo },
  { id: 'premier_wallet', name: 'Premier Wallet', logo: premierWalletLogo },
];

const BANK_OPTIONS = [
  'Dahabshiil Bank',
  'Salaam Somali Bank',
  'Premier Bank',
  'IBS Bank',
  'Amal Bank',
  'Bank of Africa',
  'Equity Bank',
  'KCB Bank',
  'Standard Chartered',
  'Other',
];

const COUNTRY_OPTIONS = [
  'Somalia',
  'Kenya',
  'Ethiopia',
  'Djibouti',
  'Uganda',
  'Tanzania',
  'United Arab Emirates',
  'Saudi Arabia',
  'Turkey',
  'United Kingdom',
  'United States',
  'Canada',
  'Other',
];

const COUNTRY_CODES = [
  { code: '+252', label: '🇸🇴 +252' },
  { code: '+254', label: '🇰🇪 +254' },
  { code: '+251', label: '🇪🇹 +251' },
  { code: '+253', label: '🇩🇯 +253' },
  { code: '+256', label: '🇺🇬 +256' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+966', label: '🇸🇦 +966' },
  { code: '+90', label: '🇹🇷 +90' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+1', label: '🇺🇸 +1' },
];

const REASON_OPTIONS = [
  'Freelance Payment',
  'Salary',
  'Business Payment',
  'Family Support',
  'Other',
];

const minimumWithdrawal = 20;
const INSUFFICIENT_FUNDS_MSG =
  'Lacag ku filan uguma jirto wallet-kaaga. Waxaad la bixi kartaa oo keliya inta kuugu jirta Available Balance-ka.';

const FreelancerWithdraw = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [availableBalance, setAvailableBalance] = useState(0);
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState(false);
  const [freelancerId, setFreelancerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [method, setMethod] = useState<'bank' | 'mobile'>('bank');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bank form
  const [bank, setBank] = useState({
    amount: '',
    firstName: '',
    middleName: '',
    lastName: '',
    bankName: '',
    accountNumber: '',
    swiftCode: '',
    country: '',
    city: '',
    countryCode: '+252',
    mobileNumber: '',
    reason: '',
  });

  // Mobile form
  const [mobile, setMobile] = useState({
    amount: '',
    firstName: '',
    lastName: '',
    provider: '',
    countryCode: '+252',
    mobileNumber: '',
    country: '',
    city: '',
    reason: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data: f } = await supabase
        .from('freelancers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (f) {
        setFreelancerId(f.id);

        // Available balance is maintained by the backend on the wallet row.
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();
        setAvailableBalance(Math.max(0, Number(wallet?.balance || 0)));

        const { data: withdrawals } = await supabase
          .from('withdrawals')
          .select('amount, status')
          .eq('freelancer_id', f.id);

        const pending = withdrawals?.filter((w) => w.status === 'pending') ?? [];
        setHasPendingWithdrawal(pending.length > 0);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const form = method === 'bank' ? bank : mobile;
  const setField = (field: string, value: string) => {
    if (method === 'bank') setBank((p) => ({ ...p, [field]: value }));
    else setMobile((p) => ({ ...p, [field]: value }));
  };

  const withdrawAmount = parseFloat(form.amount) || 0;
  const FIVESOM_FEE_PERCENT = 15;
  const withdrawFee = withdrawAmount * (FIVESOM_FEE_PERCENT / 100);
  const amountAfterFee = withdrawAmount - withdrawFee;
  const isAmountValid =
    withdrawAmount >= minimumWithdrawal && withdrawAmount <= availableBalance;
  const canWithdraw =
    availableBalance >= minimumWithdrawal && !hasPendingWithdrawal && !loading;

  const isBankValid =
    isAmountValid &&
    bank.firstName.trim() &&
    bank.lastName.trim() &&
    bank.bankName &&
    bank.accountNumber.trim() &&
    bank.swiftCode.trim() &&
    bank.country &&
    bank.city.trim() &&
    bank.countryCode &&
    bank.mobileNumber.trim() &&
    bank.reason;

  const isMobileValid =
    isAmountValid &&
    mobile.firstName.trim() &&
    mobile.lastName.trim() &&
    mobile.provider &&
    mobile.countryCode &&
    mobile.mobileNumber.trim() &&
    mobile.country &&
    mobile.city.trim() &&
    mobile.reason;

  const isFormValid = method === 'bank' ? isBankValid : isMobileValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount > availableBalance) {
      toast({
        title: 'Insufficient Funds',
        description: INSUFFICIENT_FUNDS_MSG,
        variant: 'destructive',
      });
      return;
    }
    if (!isFormValid || !canWithdraw || !freelancerId) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        freelancer_id: freelancerId,
        amount: withdrawAmount,
        status: 'pending',
        method,
        reason: form.reason,
        country: form.country,
        city: form.city,
        country_code: form.countryCode,
        mobile_number: form.mobileNumber,
      };

      if (method === 'bank') {
        payload.receiver_first_name = bank.firstName;
        payload.receiver_middle_name = bank.middleName || null;
        payload.receiver_last_name = bank.lastName;
        payload.bank_name = bank.bankName;
        payload.account_number = bank.accountNumber;
        payload.swift_code = bank.swiftCode;
      } else {
        payload.receiver_first_name = mobile.firstName;
        payload.receiver_last_name = mobile.lastName;
        payload.mobile_provider = mobile.provider;
      }

      const { error } = await supabase.from('withdrawals').insert(payload);
      if (error) throw error;

      toast({
        title: 'Withdrawal Request Submitted',
        description: `Your request for $${withdrawAmount.toFixed(2)} has been sent to the admin for processing. You will receive $${amountAfterFee.toFixed(2)} after the 15% Fivesom fee.`,
      });
      navigate('/freelancer/wallet');
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Submission Failed',
        description: err?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/freelancer/dashboard')}
            className="mb-4 p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Withdraw Earnings</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Request a withdrawal of your available funds
          </p>
        </div>

        {/* Earnings Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5" />
              Earnings Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">
                Available to Withdraw
              </span>
              <span className="font-bold text-2xl text-green-600">
                ${availableBalance.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Minimum withdrawal</span>
              <span>${minimumWithdrawal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Fivesom fee</span>
              <span>15% deducted from amount</span>
            </div>

            {!loading && availableBalance < minimumWithdrawal && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">
                  You must have at least ${minimumWithdrawal.toFixed(2)} to withdraw funds.
                </span>
              </div>
            )}

            {hasPendingWithdrawal && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                  You have a pending withdrawal. Please wait for admin to process it.
                </span>
              </div>
            )}

            {canWithdraw && (
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                  You can withdraw up to ${availableBalance.toFixed(2)}.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Method tabs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            type="button"
            variant={method === 'bank' ? 'default' : 'outline'}
            onClick={() => setMethod('bank')}
            className="h-auto py-4 flex flex-col items-center gap-1.5"
          >
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Bank Account</span>
            <span className="text-[11px] opacity-70">SWIFT / IBAN</span>
          </Button>
          <Button
            type="button"
            variant={method === 'mobile' ? 'default' : 'outline'}
            onClick={() => setMethod('mobile')}
            className="h-auto py-4 flex flex-col items-center gap-1.5"
          >
            <Smartphone className="w-5 h-5" />
            <span className="font-medium">Mobile Wallet</span>
            <span className="text-[11px] opacity-70">EVC, ZAAD, M-Pesa, Premier</span>
          </Button>
        </div>

        {/* Forms */}
        {method === 'bank' ? (
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Add Bank Receiver</CardTitle>
              <p className="text-sm text-muted-foreground">
                Provide the receiver's complete bank details
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="bank-amount">Withdrawal Amount (USD)</Label>
                  <Input
                    id="bank-amount"
                    type="number"
                    placeholder={`Min $${minimumWithdrawal}`}
                    value={bank.amount}
                    onChange={(e) => setField('amount', e.target.value)}
                    disabled={!canWithdraw}
                    min={minimumWithdrawal}
                    max={availableBalance}
                    step="0.01"
                    className="rounded-lg h-11"
                    required
                  />
                  {withdrawAmount > 0 && withdrawAmount > availableBalance && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                        {INSUFFICIENT_FUNDS_MSG}
                      </span>
                    </div>
                  )}
                </div>

                {/* Receiver name */}
                <section className="space-y-4">
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Receiver's Name
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        placeholder="First name"
                        value={bank.firstName}
                        onChange={(e) => setField('firstName', e.target.value)}
                        className="rounded-lg h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Middle Name (optional)</Label>
                      <Input
                        placeholder="Middle name"
                        value={bank.middleName}
                        onChange={(e) => setField('middleName', e.target.value)}
                        className="rounded-lg h-11"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Last Name</Label>
                      <Input
                        placeholder="Last name"
                        value={bank.lastName}
                        onChange={(e) => setField('lastName', e.target.value)}
                        className="rounded-lg h-11"
                        required
                      />
                    </div>
                  </div>
                </section>

                {/* Bank details */}
                <section className="space-y-4">
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    Bank Account Details
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input
                        placeholder="Enter your bank name (e.g. Premier Bank, Dahabshiil)"
                        value={bank.bankName}
                        onChange={(e) => setField('bankName', e.target.value)}
                        className="rounded-lg h-11"
                        maxLength={60}
                        required
                      />
                      <p className="text-[11px] text-muted-foreground">Type the full official name of your bank.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Account Number / IBAN</Label>
                        <Input
                          placeholder="Account number"
                          value={bank.accountNumber}
                          onChange={(e) =>
                            setField('accountNumber', e.target.value)
                          }
                          className="rounded-lg h-11"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SWIFT / BIC Code</Label>
                        <Input
                          placeholder="e.g. DAHBSOSO"
                          value={bank.swiftCode}
                          onChange={(e) =>
                            setField('swiftCode', e.target.value.toUpperCase())
                          }
                          className="rounded-lg h-11"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Address */}
                <section className="space-y-4">
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    Receiver's Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Select
                        value={bank.country}
                        onValueChange={(v) => setField('country', v)}
                      >
                        <SelectTrigger className="rounded-lg h-11">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_OPTIONS.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>City / Town</Label>
                      <Input
                        placeholder="City"
                        value={bank.city}
                        onChange={(e) => setField('city', e.target.value)}
                        className="rounded-lg h-11"
                        required
                      />
                    </div>
                  </div>
                </section>

                {/* Contact */}
                <section className="space-y-4">
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    Receiver's Contact Details
                  </h3>
                  <div className="grid grid-cols-[120px_1fr] gap-3">
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Select
                        value={bank.countryCode}
                        onValueChange={(v) => setField('countryCode', v)}
                      >
                        <SelectTrigger className="rounded-lg h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_CODES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile Number</Label>
                      <Input
                        placeholder="Mobile number"
                        value={bank.mobileNumber}
                        onChange={(e) =>
                          setField('mobileNumber', e.target.value)
                        }
                        className="rounded-lg h-11"
                        required
                      />
                    </div>
                  </div>
                </section>

                {/* Reason */}
                <section className="space-y-4">
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Reason for Sending
                  </h3>
                  <Select
                    value={bank.reason}
                    onValueChange={(v) => setField('reason', v)}
                  >
                    <SelectTrigger className="rounded-lg h-11">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {REASON_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </section>

                {withdrawAmount > 0 && (
                  <div className="p-4 bg-muted/40 rounded-xl space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Withdrawal amount:{' '}
                      <span className="font-medium text-foreground">
                        ${withdrawAmount.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fivesom fee (15%):{' '}
                      <span className="font-medium text-foreground">
                        -${withdrawFee.toFixed(2)}
                      </span>
                    </p>
                    <p className="font-semibold text-green-600">
                      Final amount you receive: ${amountAfterFee.toFixed(2)}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-md"
                  disabled={!canWithdraw || !isBankValid || isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? 'Submitting...' : 'Save and Continue'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Add Mobile Wallet Receiver</CardTitle>
              <p className="text-sm text-muted-foreground">
                Withdraw to a mobile money wallet
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="mobile-amount">Withdrawal Amount (USD)</Label>
                  <Input
                    id="mobile-amount"
                    type="number"
                    placeholder={`Min $${minimumWithdrawal}`}
                    value={mobile.amount}
                    onChange={(e) => setField('amount', e.target.value)}
                    disabled={!canWithdraw}
                    min={minimumWithdrawal}
                    max={availableBalance}
                    step="0.01"
                    className="rounded-lg h-11"
                    required
                  />
                  {withdrawAmount > 0 && withdrawAmount > availableBalance && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                        {INSUFFICIENT_FUNDS_MSG}
                      </span>
                    </div>
                  )}
                </div>

                {/* Receiver name */}
                <section className="space-y-4">
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Receiver's Name
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        placeholder="First name"
                        value={mobile.firstName}
                        onChange={(e) => setField('firstName', e.target.value)}
                        className="rounded-lg h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        placeholder="Last name"
                        value={mobile.lastName}
                        onChange={(e) => setField('lastName', e.target.value)}
                        className="rounded-lg h-11"
                        required
                      />
                    </div>
                  </div>
                </section>

                {/* Mobile account */}
                <section className="space-y-4">
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5" />
                    Mobile Account Details
                  </h3>

                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {mobileMoneyOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setField('provider', opt.id)}
                          className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            mobile.provider === opt.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <img
                            src={opt.logo}
                            alt={opt.name}
                            className="w-10 h-10 object-contain"
                          />
                          <span className="text-xs font-medium">{opt.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-3">
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Select
                        value={mobile.countryCode}
                        onValueChange={(v) => setField('countryCode', v)}
                      >
                        <SelectTrigger className="rounded-lg h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_CODES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile Wallet Number</Label>
                      <Input
                        placeholder="Wallet number"
                        value={mobile.mobileNumber}
                        onChange={(e) =>
                          setField('mobileNumber', e.target.value)
                        }
                        className="rounded-lg h-11"
                        required
                      />
                    </div>
                  </div>
                </section>

                {/* Address */}
                <section className="space-y-4">
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    Receiver's Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Select
                        value={mobile.country}
                        onValueChange={(v) => setField('country', v)}
                      >
                        <SelectTrigger className="rounded-lg h-11">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_OPTIONS.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>City / Town</Label>
                      <Input
                        placeholder="City"
                        value={mobile.city}
                        onChange={(e) => setField('city', e.target.value)}
                        className="rounded-lg h-11"
                        required
                      />
                    </div>
                  </div>
                </section>

                {/* Reason */}
                <section className="space-y-4">
                  <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Reason for Sending
                  </h3>
                  <Select
                    value={mobile.reason}
                    onValueChange={(v) => setField('reason', v)}
                  >
                    <SelectTrigger className="rounded-lg h-11">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {REASON_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </section>

                {withdrawAmount > 0 && (
                  <div className="p-4 bg-muted/40 rounded-xl space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Withdrawal amount:{' '}
                      <span className="font-medium text-foreground">
                        ${withdrawAmount.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fivesom fee (15%):{' '}
                      <span className="font-medium text-foreground">
                        -${withdrawFee.toFixed(2)}
                      </span>
                    </p>
                    <p className="font-semibold text-green-600">
                      Final amount you receive: ${amountAfterFee.toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Admin will process your withdrawal manually. Funds usually arrive within 24–48 hours.
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-md"
                  disabled={!canWithdraw || !isMobileValid || isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? 'Submitting...' : 'Save and Continue'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FreelancerWithdraw;
