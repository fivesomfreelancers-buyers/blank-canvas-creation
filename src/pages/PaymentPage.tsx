import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Clock, CheckCircle, Shield, CreditCard, Wallet, Upload, Smartphone, AlertCircle, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { NEED_BUYER_MESSAGE } from '@/lib/roleUpgrade';
import { supabase } from '@/integrations/supabase/client';

import zaadLogo from '@/assets/zaad-logo.png';
import evcLogo from '@/assets/evc-logo.png';
import edahabLogo from '@/assets/edahab-logo.png';
import ebirrLogo from '@/assets/ebirr-logo.png';

interface PaymentPageState {
  gig: {
    id: string;
    title: string;
    freelancer: {
      name: string;
      avatar: string;
      profileImage?: string;
    };
  };
  selectedPackage: {
    name: string;
    packageType?: string;
    price: number;
    delivery: string;
    revisions: string;
    features: string[];
  };
}

interface CurrencyOption {
  label: string;
  ussdPrefix: string;
}

interface MobileMoneyOption {
  id: string;
  name: string;
  logo: string;
  receiverNumber: string;
  currencies: CurrencyOption[];
}

const mobileMoneyOptions: MobileMoneyOption[] = [
  {
    id: 'zaad',
    name: 'ZAAD',
    logo: zaadLogo,
    receiverNumber: '0631234567',
    currencies: [
      { label: 'USD ($)', ussdPrefix: '*880' },
      { label: 'SL Shillings', ussdPrefix: '*220' },
    ],
  },
  {
    id: 'evc',
    name: 'EVC',
    logo: evcLogo,
    receiverNumber: '912345678',
    currencies: [
      { label: 'USD ($)', ussdPrefix: '*711' },
      { label: 'SO Shillings', ussdPrefix: '*770' },
    ],
  },
  {
    id: 'edahab',
    name: 'eDahab',
    logo: edahabLogo,
    receiverNumber: '0651234567',
    currencies: [
      { label: 'SL Shillings', ussdPrefix: '*110' },
    ],
  },
  {
    id: 'ebiir',
    name: 'eBiir',
    logo: ebirrLogo,
    receiverNumber: '091234567',
    currencies: [
      { label: 'ETB', ussdPrefix: '*681' },
    ],
  },
];

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const isDarkMode = theme === 'dark';

  const [paymentType, setPaymentType] = useState<'card' | 'mobile'>('card');
  const [selectedMobileMethod, setSelectedMobileMethod] = useState<string>('');
  const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);


  useEffect(() => {
    if (userRole === 'user') {
      toast({ title: 'Buyer Dashboard', description: NEED_BUYER_MESSAGE });
      navigate('/become-buyer', { replace: true });
    }
  }, [userRole, navigate, toast]);

  const state = location.state as PaymentPageState;

  if (!state) {
    navigate('/');
    return null;
  }

  const { gig, selectedPackage } = state;
  const serviceFee = 1;
  const totalAmount = selectedPackage.price + serviceFee;

  const selectedMobileOption = mobileMoneyOptions.find(m => m.id === selectedMobileMethod);
  const selectedCurrency = selectedMobileOption?.currencies[selectedCurrencyIndex];

  const getUssdCode = () => {
    if (!selectedMobileOption || !selectedCurrency) return '';
    return `${selectedCurrency.ussdPrefix}*${selectedMobileOption.receiverNumber}*${totalAmount}#`;
  };

  const handleSendMoney = () => {
    const ussd = getUssdCode();
    if (!ussd) return;
    // Encode the USSD for tel: URI — # becomes %23
    const encoded = `tel:${ussd.replace(/#/g, '%23')}`;
    window.location.href = encoded;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 5MB", variant: "destructive" });
        return;
      }
      setPaymentProof(file);
    }
  };

  const isMobileFormValid = selectedMobileMethod && paymentProof;

  const handlePayment = async () => {
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to place an order.", variant: "destructive" });
      navigate('/login');
      return;
    }

    if (paymentType === 'mobile' && !isMobileFormValid) {
      toast({ title: "Missing Payment Proof", description: "Please select a payment method and upload your payment screenshot.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      if (paymentType === 'card') {
        // Live Stripe Checkout — order + price are created server-side
        const { data, error } = await supabase.functions.invoke('create-order-checkout', {
          body: { gigId: gig.id, packageType: selectedPackage.packageType || 'basic' },
        });
        if (error) throw error;
        if (!data?.url) throw new Error('Checkout session could not be created');
        window.location.href = data.url;
        return;
      }

      // Mobile money — manual proof upload flow
      let paymentProofUrl: string | null = null;
      if (paymentProof) {
        const proofPath = `payment-proofs/${user.id}/${Date.now()}-${paymentProof.name}`;
        const { error: uploadErr } = await supabase.storage
          .from('order-requirements')
          .upload(proofPath, paymentProof);
        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage
            .from('order-requirements')
            .getPublicUrl(proofPath);
          paymentProofUrl = publicUrl;
        }
      }

      const { data: gigData } = await supabase
        .from('gigs')
        .select('freelancer_id')
        .eq('id', gig.id)
        .single();

      if (!gigData) throw new Error('Gig not found');

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          freelancer_id: gigData.freelancer_id,
          gig_id: gig.id,
          amount: totalAmount,
          status: 'pending' as const,
          payment_method: selectedMobileMethod,
          payment_status: 'pending_verification',
          package_name: selectedPackage.name,
          payment_proof_url: paymentProofUrl,
        } as any)
        .select()
        .single();

      if (orderError) throw orderError;

      toast({
        title: "Payment Submitted for Verification",
        description: "Now submit your project requirements so the freelancer can start working.",
      });

      navigate(`/buyer/order/${orderData.id}/requirements`, { replace: true });
    } catch (error) {
      console.error('Payment error:', error);
      toast({ title: "Payment Failed", description: (error as Error).message || "There was an error processing your payment. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };


  const freelancerInitials = gig.freelancer.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className={`${isDarkMode ? "bg-gray-900" : "bg-muted/30"} min-h-screen`}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-6 sm:pb-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Complete Your Order</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Choose your payment method and proceed</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">{gig.title}</h3>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    {gig.freelancer.profileImage ? (
                      <AvatarImage src={gig.freelancer.profileImage} alt={gig.freelancer.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {freelancerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">by <span className="font-medium text-foreground">{gig.freelancer.name}</span></span>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">{selectedPackage.name} Package</h4>
                  <Badge variant="outline">${selectedPackage.price}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <span>{selectedPackage.delivery} delivery</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <span>{selectedPackage.revisions} revisions</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium">What's included:</p>
                  <ul className="space-y-1">
                    {selectedPackage.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-xs sm:text-sm">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between"><span>Gig Price</span><span>${selectedPackage.price}</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>Buyer Service Fee</span><span>${serviceFee}</span></div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>${totalAmount}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection — Card / Bank only for buyers */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <Button variant="default" onClick={() => setPaymentType('card')} className="h-auto py-4 flex flex-col items-center gap-2">
                <CreditCard className="w-6 h-6" />
                <span>Card Payment</span>
                <span className="text-xs opacity-70">Visa / Mastercard</span>
              </Button>
            </div>

            {/* Card Payment — inline Stripe Elements form */}
            {paymentType === 'card' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />Card Payment</CardTitle>
                  <p className="text-sm text-muted-foreground">Secure card payment powered by Stripe (Live)</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-8" />
                    <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-8" />
                  </div>
                  <StripeCardForm
                    gigId={gig.id}
                    packageType={selectedPackage.packageType || 'basic'}
                    totalAmount={totalAmount}
                    onSuccess={(orderId) => navigate(`/buyer/order/${orderId}/requirements`, { replace: true })}
                  />
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-300">
                    <Shield className="w-4 h-4" />
                    <span>PCI-compliant live payments handled by Stripe</span>
                  </div>
                </CardContent>
              </Card>
            )}



            {/* Mobile Money Payment Form */}
            {paymentType === 'mobile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Smartphone className="w-5 h-5" />Somali Mobile Money</CardTitle>
                  <p className="text-sm text-muted-foreground">Select your provider and upload payment proof</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Provider Selection */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {mobileMoneyOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => { setSelectedMobileMethod(option.id); setSelectedCurrencyIndex(0); }}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                          selectedMobileMethod === option.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <img src={option.logo} alt={option.name} className="w-12 h-12 object-contain" />
                        <span className="text-sm font-medium">{option.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Payment Details & USSD */}
                  {selectedMobileOption && (
                    <div className="space-y-4">
                      {/* Currency selector (if multiple) */}
                      {selectedMobileOption.currencies.length > 1 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Select Currency</Label>
                          <div className="flex gap-2">
                            {selectedMobileOption.currencies.map((cur, idx) => (
                              <Button
                                key={idx}
                                size="sm"
                                variant={selectedCurrencyIndex === idx ? 'default' : 'outline'}
                                onClick={() => setSelectedCurrencyIndex(idx)}
                              >
                                {cur.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payment info box */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                          Send Payment via {selectedMobileOption.name}
                        </h4>
                        <div className="space-y-1.5 text-sm text-blue-700 dark:text-blue-300">
                          <p><strong>Receiver Number:</strong> {selectedMobileOption.receiverNumber}</p>
                          <p><strong>Amount:</strong> ${totalAmount}</p>
                          {selectedCurrency && (
                            <p><strong>Dial:</strong> <code className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded font-mono text-xs">{getUssdCode()}</code></p>
                          )}
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          After sending the payment, take a screenshot of the confirmation and upload it below.
                        </p>
                      </div>

                      {/* Send Money Button */}
                      <Button
                        onClick={handleSendMoney}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="lg"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Send Money via {selectedMobileOption.name}
                      </Button>
                    </div>
                  )}

                  {/* Screenshot Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Payment Proof (Required)
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="payment-proof" />
                      <label htmlFor="payment-proof" className="cursor-pointer">
                        {paymentProof ? (
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span>{paymentProof.name}</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Click to upload your payment screenshot</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-sm text-orange-700 dark:text-orange-300">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Your order will be activated after admin verifies your payment (within 24 hours)</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button onClick={handlePayment} className="w-full" size="lg" disabled={isProcessing || (paymentType === 'mobile' && !isMobileFormValid)}>
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  {paymentType === 'card' ? `Pay $${totalAmount} with Stripe` : `Submit Payment Proof ($${totalAmount})`}
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By proceeding, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
