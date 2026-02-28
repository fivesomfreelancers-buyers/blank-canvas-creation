import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, DollarSign, AlertTriangle, CheckCircle, Building2, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

// Import mobile money logos
import zaadLogo from '@/assets/zaad-logo.png';
import evcLogo from '@/assets/evc-logo.png';
import edahabLogo from '@/assets/edahab-logo.png';
import ebirrLogo from '@/assets/ebirr-logo.png';

const mobileMoneyOptions = [
  { id: 'zaad', name: 'ZAAD', logo: zaadLogo },
  { id: 'evc', name: 'EVC', logo: evcLogo },
  { id: 'edahab', name: 'eDahab', logo: ebirrLogo },
  { id: 'ebiir', name: 'eBiir', logo: edahabLogo },
];

const FreelancerWithdraw = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock data - replace with actual data from backend
  const currentBalance = 1250.00;
  const availableBalance = 1250.00;
  const minimumWithdrawal = 10.00;
  const hasPendingWithdrawal = false;
  
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'mobile'>('bank');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Bank form data
  const [bankFormData, setBankFormData] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    cardType: '',
    saveDetails: false
  });
  
  // Mobile money form data
  const [mobileFormData, setMobileFormData] = useState({
    amount: '',
    fullName: '',
    mobileProvider: '',
    mobileNumber: '',
    saveDetails: false
  });
  
  // Fee calculation
  const withdrawFeeRate = 0.02; // 2%
  const withdrawAmount = parseFloat(withdrawMethod === 'bank' ? bankFormData.amount : mobileFormData.amount) || 0;
  const withdrawFee = withdrawAmount * withdrawFeeRate;
  const amountAfterFee = withdrawAmount - withdrawFee;
  
  const canWithdraw = availableBalance >= minimumWithdrawal && !hasPendingWithdrawal;
  const isAmountValid = withdrawAmount >= minimumWithdrawal && withdrawAmount <= availableBalance;
  
  const handleBankInputChange = (field: string, value: string | boolean) => {
    setBankFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleMobileInputChange = (field: string, value: string | boolean) => {
    setMobileFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const isBankFormValid = bankFormData.amount && bankFormData.bankName && bankFormData.accountNumber && bankFormData.cardType && isAmountValid;
  const isMobileFormValid = mobileFormData.amount && mobileFormData.fullName && mobileFormData.mobileProvider && mobileFormData.mobileNumber && isAmountValid;
  
  const isFormValid = withdrawMethod === 'bank' ? isBankFormValid : isMobileFormValid;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || !canWithdraw) return;
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const methodName = withdrawMethod === 'bank' 
        ? bankFormData.bankName 
        : mobileMoneyOptions.find(m => m.id === mobileFormData.mobileProvider)?.name || 'Mobile Money';
      
      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal request for $${withdrawAmount.toFixed(2)} via ${methodName} has been submitted. You will receive $${amountAfterFee.toFixed(2)} after the 2% fee.`,
      });
      
      navigate('/freelancer/wallet');
      
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error processing your withdrawal request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-4 sm:p-6 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/freelancer/wallet')}
              className="mb-4 p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wallet
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">Withdraw Earnings</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">Request a withdrawal of your available funds</p>
          </div>

          {/* Earnings Summary */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <DollarSign className="w-5 h-5" />
                <span>Earnings Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm sm:text-base">Current Balance:</span>
                <span className="font-semibold text-sm sm:text-base">${currentBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm sm:text-base">Available to Withdraw:</span>
                <span className="font-bold text-xl sm:text-2xl text-green-600">${availableBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-muted-foreground">Minimum withdrawal:</span>
                <span>${minimumWithdrawal.toFixed(2)}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm">
                <span className="text-muted-foreground">Withdraw Fee:</span>
                <span className="text-right sm:text-left">2% will be deducted from the amount you request</span>
              </div>
              
              {/* Validation Messages */}
              {availableBalance < minimumWithdrawal && (
                <div className="flex items-start space-x-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">
                    You must have at least ${minimumWithdrawal.toFixed(2)} to withdraw funds.
                  </span>
                </div>
              )}
              
              {hasPendingWithdrawal && (
                <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                    You have a pending withdrawal request. Please wait for it to be processed.
                  </span>
                </div>
              )}
              
              {canWithdraw && (
                <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                    You can withdraw ${availableBalance.toFixed(2)} right now.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Withdrawal Method Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant={withdrawMethod === 'bank' ? 'default' : 'outline'}
              onClick={() => setWithdrawMethod('bank')}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Building2 className="w-6 h-6" />
              <span>Bank Account</span>
              <span className="text-xs opacity-70">Visa / Mastercard</span>
            </Button>
            <Button
              variant={withdrawMethod === 'mobile' ? 'default' : 'outline'}
              onClick={() => setWithdrawMethod('mobile')}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Smartphone className="w-6 h-6" />
              <span>Mobile Money</span>
              <span className="text-xs opacity-70">ZAAD, EVC, eDahab, eBiir</span>
            </Button>
          </div>

          {/* Withdrawal Forms - Side by Side on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bank Account Form */}
            {withdrawMethod === 'bank' && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Bank Account Details
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Provide your bank account information for the withdrawal
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex gap-2 mb-4">
                      <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-8" />
                      <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-8" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bank-amount">Withdrawal Amount</Label>
                        <Input
                          id="bank-amount"
                          type="number"
                          placeholder="Enter amount (min $10)"
                          value={bankFormData.amount}
                          onChange={(e) => handleBankInputChange('amount', e.target.value)}
                          disabled={!canWithdraw}
                          min={minimumWithdrawal}
                          max={availableBalance}
                          step="0.01"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          placeholder="e.g. Bank of America"
                          value={bankFormData.bankName}
                          onChange={(e) => handleBankInputChange('bankName', e.target.value)}
                          disabled={!canWithdraw}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number / IBAN</Label>
                        <Input
                          id="accountNumber"
                          placeholder="Enter your account number or IBAN"
                          value={bankFormData.accountNumber}
                          onChange={(e) => handleBankInputChange('accountNumber', e.target.value)}
                          disabled={!canWithdraw}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cardType">Card Type</Label>
                        <Select 
                          value={bankFormData.cardType} 
                          onValueChange={(value) => handleBankInputChange('cardType', value)}
                          disabled={!canWithdraw}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select card type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Visa">Visa</SelectItem>
                            <SelectItem value="Mastercard">Mastercard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {withdrawAmount > 0 && (
                      <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Withdrawal fee (2%): <span className="font-medium">${withdrawFee.toFixed(2)}</span>
                        </p>
                        <p className="font-semibold text-green-600">
                          You will receive: ${amountAfterFee.toFixed(2)}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bank-saveDetails"
                        checked={bankFormData.saveDetails}
                        onCheckedChange={(checked) => handleBankInputChange('saveDetails', checked as boolean)}
                        disabled={!canWithdraw}
                      />
                      <Label htmlFor="bank-saveDetails" className="text-sm">
                        Save these details for future withdrawals
                      </Label>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!canWithdraw || !isBankFormValid || isSubmitting}
                      size="lg"
                    >
                      {isSubmitting ? (
                        "Processing..."
                      ) : withdrawAmount > 0 ? (
                        `Request Withdrawal - $${withdrawAmount.toFixed(2)}`
                      ) : (
                        "Request Withdrawal"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Mobile Money Form */}
            {withdrawMethod === 'mobile' && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Somali Mobile Money
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Withdraw to your mobile money account
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Mobile Money Provider Selection */}
                    <div>
                      <Label className="mb-3 block">Select Mobile Money Provider</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {mobileMoneyOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleMobileInputChange('mobileProvider', option.id)}
                            disabled={!canWithdraw}
                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                              mobileFormData.mobileProvider === option.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            } ${!canWithdraw ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <img src={option.logo} alt={option.name} className="w-12 h-12 object-contain" />
                            <span className="text-sm font-medium">{option.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="mobile-amount">Withdrawal Amount</Label>
                        <Input
                          id="mobile-amount"
                          type="number"
                          placeholder="Enter amount (min $10)"
                          value={mobileFormData.amount}
                          onChange={(e) => handleMobileInputChange('amount', e.target.value)}
                          disabled={!canWithdraw}
                          min={minimumWithdrawal}
                          max={availableBalance}
                          step="0.01"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name (3 names)</Label>
                        <Input
                          id="fullName"
                          placeholder="e.g. Mohamed Ali Hassan"
                          value={mobileFormData.fullName}
                          onChange={(e) => handleMobileInputChange('fullName', e.target.value)}
                          disabled={!canWithdraw}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="mobileNumber">Mobile Number</Label>
                        <Input
                          id="mobileNumber"
                          placeholder="e.g. 252 61 1234567"
                          value={mobileFormData.mobileNumber}
                          onChange={(e) => handleMobileInputChange('mobileNumber', e.target.value)}
                          disabled={!canWithdraw}
                          required
                        />
                      </div>
                    </div>

                    {withdrawAmount > 0 && (
                      <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Withdrawal fee (2%): <span className="font-medium">${withdrawFee.toFixed(2)}</span>
                        </p>
                        <p className="font-semibold text-green-600">
                          You will receive: ${amountAfterFee.toFixed(2)}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-saveDetails"
                        checked={mobileFormData.saveDetails}
                        onCheckedChange={(checked) => handleMobileInputChange('saveDetails', checked as boolean)}
                        disabled={!canWithdraw}
                      />
                      <Label htmlFor="mobile-saveDetails" className="text-sm">
                        Save these details for future withdrawals
                      </Label>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Admin will process your withdrawal manually. You'll receive funds within 24-48 hours.</span>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!canWithdraw || !isMobileFormValid || isSubmitting}
                      size="lg"
                    >
                      {isSubmitting ? (
                        "Processing..."
                      ) : withdrawAmount > 0 ? (
                        `Request Withdrawal - $${withdrawAmount.toFixed(2)}`
                      ) : (
                        "Request Withdrawal"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {!canWithdraw && (
            <p className="text-sm text-muted-foreground text-center mt-6">
              Withdrawal is currently not available
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default FreelancerWithdraw;
