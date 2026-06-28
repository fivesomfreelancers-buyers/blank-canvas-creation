
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CreditCard, Clock, CheckCircle, Download } from 'lucide-react';

const BuyerPayments = () => {
  const escrowPayments = [
    {
      id: 1,
      project: "Logo Design Project",
      freelancer: "Alex Designer",
      amount: "$150",
      status: "In Escrow",
      releaseDate: "Auto-release in 3 days",
      orderDate: "2024-01-15"
    },
    {
      id: 2,
      project: "Website Development",
      freelancer: "Sarah Dev",
      amount: "$800",
      status: "Released",
      releaseDate: "Released on 2024-01-12",
      orderDate: "2024-01-05"
    }
  ];

  const paymentHistory = [
    {
      id: 1,
      description: "Logo Design Project",
      amount: "$150",
      status: "Pending",
      date: "2024-01-15",
      method: "Credit Card"
    },
    {
      id: 2,
      description: "Website Development",
      amount: "$800",
      status: "Completed",
      date: "2024-01-12",
      method: "PayPal"
    },
    {
      id: 3,
      description: "Content Writing Package",
      amount: "$75",
      status: "Completed",
      date: "2024-01-08",
      method: "Credit Card"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Escrow': return 'bg-yellow-100 text-yellow-800';
      case 'Released': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Payments & Escrow</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Secure payment management with escrow protection</p>
        </div>

        {/* Escrow Info */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
              Escrow Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <p className="text-green-800 mb-2 text-sm sm:text-base">
                <strong>Your payments are protected!</strong>
              </p>
              <p className="text-green-700 text-xs sm:text-sm">
                All payments are held in escrow until you approve the work. This ensures you only pay for satisfactory results.
                Funds are automatically released 7 days after delivery unless you request revisions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Escrow Payments */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Active Escrow Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {escrowPayments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base">{payment.project}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Freelancer: {payment.freelancer}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Order Date: {payment.orderDate}</p>
                    </div>
                    <div className="text-left sm:text-right flex sm:flex-col items-start sm:items-end gap-2">
                      <div className="text-lg sm:text-xl font-bold text-green-600">{payment.amount}</div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{payment.releaseDate}</span>
                    </div>
                    {payment.status === 'In Escrow' && (
                      <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">Request Revision</Button>
                        <Button size="sm" className="w-full sm:w-auto">Release Payment</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-5 sm:w-10 sm:h-6 bg-blue-600 rounded mr-3"></div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">•••• •••• •••• 1234</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit">Primary</Badge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-5 sm:w-10 sm:h-6 bg-yellow-500 rounded mr-3"></div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">PayPal Account</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">user@example.com</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">Remove</Button>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full sm:w-auto">Add Payment Method</Button>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                      payment.status === 'Completed' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {payment.status === 'Completed' ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base">{payment.description}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{payment.method} • {payment.date}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-foreground text-sm sm:text-base">{payment.amount}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                      {payment.status === 'Completed' && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuyerPayments;
