
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchTotalEarnings } from '@/lib/freelancerEarnings';

const FreelancerWallet = () => {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState({ available: 0, pending: 0, total: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchWalletData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: freelancer } = await supabase
          .from('freelancers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        // Available balance is maintained by the backend (escrow release on order completion).
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();

        // Pending earnings = money still in escrow (order paid, not yet accepted).
        const { data: orders } = await supabase
          .from('orders')
          .select('amount, status')
          .eq('freelancer_id', freelancer?.id || '');

        const { data: withdrawals } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('freelancer_id', freelancer?.id || '')
          .order('requested_at', { ascending: false });

        const pendingEarnings = orders
          ?.filter(o => o.status === 'pending' || o.status === 'in_progress' || o.status === 'delivered')
          .reduce((sum, o) => sum + Number(o.amount), 0) || 0;

        setEarnings({
          available: Math.max(0, Number(wallet?.balance || 0)),
          pending: pendingEarnings,
          total: await fetchTotalEarnings(freelancer?.id),
        });

        setTransactions(withdrawals || []);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      channel = supabase
        .channel('wallet-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` }, fetchWalletData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchWalletData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, fetchWalletData)
        .subscribe();
    };
    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
          <p className="text-muted-foreground mt-2">Manage your earnings and withdrawals</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${earnings.available.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">${earnings.pending.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">In escrow until the buyer accepts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earnings.total.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Lifetime earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  Available balance:{' '}
                  <span className="font-bold text-green-600">${earnings.available.toFixed(2)}</span>
                </p>
                <p className="text-muted-foreground">
                  Fivesom fee (15%):{' '}
                  <span className="font-medium text-foreground">
                    -${(earnings.available * 0.15).toFixed(2)}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Final withdraw amount:{' '}
                  <span className="font-semibold text-foreground">
                    ${(earnings.available * 0.85).toFixed(2)}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground pt-1">Minimum withdrawal: $20.00</p>
              </div>
              <Button
                className="flex items-center space-x-2"
                onClick={() => navigate('/freelancer/wallet/withdraw')}
                disabled={earnings.available < 20}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw</span>
              </Button>
            </div>
            <div className="mt-4 pt-4 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Rabta lacagta si toos ah? Ku xir akoonkaaga Stripe oo hel payouts automatic ah.
              </p>
              <Button variant="outline" onClick={() => navigate('/freelancer/payouts')}>
                Stripe Payouts
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No transactions yet</div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                        <ArrowUpRight className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Withdrawal to {transaction.bank_name || transaction.mobile_provider || 'account'}</p>
                        <p className="text-sm text-muted-foreground">{new Date(transaction.requested_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">-${Number(transaction.amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        Fee (15%): -${Number(transaction.fee_amount ?? Number(transaction.amount) * 0.15).toFixed(2)} · Net: $
                        {Number(transaction.net_amount ?? Number(transaction.amount) * 0.85).toFixed(2)}
                      </p>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreelancerWallet;
