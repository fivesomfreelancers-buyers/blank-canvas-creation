import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CreditCard, Check, Shield, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import logo from '@/assets/logo.png';

const SellerPayment = () => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment Successful!",
        description: "Your account has been verified. Welcome to FIVESOM!",
      });
      setIsLoading(false);
      // Redirect to freelancer dashboard after successful payment
      navigate('/freelancer/dashboard');
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-6 sm:py-8 px-4 pt-20">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <img 
                src={logo} 
                alt="FIVESOM Logo" 
                width="40"
                height="40"
                className="w-[40px] h-[40px] object-contain cursor-pointer"
              />
              <span className="text-xl sm:text-2xl font-bold text-foreground">FIVESOM</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Account Verification</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Complete your $1 verification payment to start selling</p>
          </div>

          {/* Payment Form */}
          <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-xl border border-border">
            {/* Verification Info */}
            <div className="bg-muted rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                <h3 className="text-base sm:text-lg font-semibold text-card-foreground">Why $1 Verification?</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Prevents spam accounts
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Verifies payment method
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Protects buyer trust
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                One-time fee only
              </li>
            </ul>
          </div>

            {/* Payment Amount */}
            <div className="bg-gradient-to-r from-primary via-primary to-accent rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-primary-foreground text-center">
              <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-80" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">$1.00</h2>
              <p className="opacity-80 text-sm sm:text-base">One-time verification fee</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Card Number */}
              <div>
                <Label htmlFor="cardNumber" className="text-card-foreground font-medium text-sm sm:text-base">Card Number *</Label>
                <div className="relative mt-1">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    required
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className="pl-10 sm:pl-12 h-10 sm:h-12"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="expiryDate" className="text-card-foreground font-medium text-sm sm:text-base">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    required
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="mt-1 h-10 sm:h-12"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>

                <div>
                  <Label htmlFor="cvv" className="text-card-foreground font-medium text-sm sm:text-base">CVV *</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    required
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className="mt-1 h-10 sm:h-12"
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <Label htmlFor="cardholderName" className="text-card-foreground font-medium text-sm sm:text-base">Cardholder Name *</Label>
                <Input
                  id="cardholderName"
                  name="cardholderName"
                  required
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                  className="mt-1 h-10 sm:h-12"
                  placeholder="John Doe"
                />
              </div>

              {/* Security Note */}
              <div className="bg-muted rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-12 font-semibold transition-all flex items-center justify-center space-x-2"
              >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete Verification</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Back Link */}
          <div className="mt-6 sm:mt-8 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground text-sm sm:text-base">
              Need help?{' '}
              <Link to="/support" className="text-primary hover:text-primary/80 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SellerPayment;