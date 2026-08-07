import React, { useEffect } from 'react';

const VipCheckout: React.FC = () => {
  useEffect(() => {
    window.location.replace('/vip');
  }, []);

  return null;
};

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success('Copied');
  };

  const submit = async () => {
    if (!bankName.trim() || !reference.trim()) {
      toast.error('Please enter the bank you paid from and the transaction reference.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from('vip_memberships').insert({
        user_id: user.id,
        tier,
        payment_status: 'pending',
        notes: `BANK PAYMENT — ${bankName} | Ref: ${reference} | ${note || ''}`,
      });
      if (error) throw error;

      await supabase.from('support_tickets').insert({
        user_id: user.id,
        subject: `VIP Payment Submitted — ${tier.toUpperCase()}`,
        message: `User ${user.email} paid $${pricing.price} for ${tier.toUpperCase()} VIP via ${bankName}. Reference: ${reference}. Please verify and activate.`,
        category: 'vip_payment',
        status: 'open',
      } as any);

      toast.success('Payment submitted. Admin will verify and activate VIP shortly.');
      navigate('/freelancer/dashboard');
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative" style={{ backgroundImage: theme.pageGlow }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
        <Link to="/vip" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to VIP plans
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order summary */}
          <Card className="lg:col-span-1 border-0" style={{ background: theme.cardBg, boxShadow: theme.cardShadow }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: theme.bodyText }}>
                <theme.Icon className="w-5 h-5" style={{ color: theme.accent }} />
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: theme.textGradient }}>
                  {tier === 'platinum' ? 'Platinum VIP' : 'Golden VIP'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" style={{ color: theme.bodyText }}>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">${pricing.price}</span>
                <span className="text-sm" style={{ color: theme.mutedText }}>{pricing.period}</span>
              </div>
              <p className="text-xs" style={{ color: theme.mutedText }}>Auto-expires after {pricing.duration} unless renewed.</p>
              <div className="pt-3 space-y-2 text-sm" style={{ borderTop: `1px solid ${theme.accent}55` }}>
                <div className="flex justify-between"><span style={{ color: theme.mutedText }}>Plan</span><span>{tier.toUpperCase()}</span></div>
                <div className="flex justify-between"><span style={{ color: theme.mutedText }}>Duration</span><span>{pricing.duration}</span></div>
                <div className="flex justify-between text-base font-bold pt-1" style={{ borderTop: `1px solid ${theme.accent}55` }}><span>Total</span><span style={{ color: theme.accent }}>${pricing.price}.00</span></div>
              </div>
              <div className="flex items-start gap-2 text-xs pt-2" style={{ color: theme.mutedText }}>
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: theme.accent }} />
                <span>Activation is manual and verified by an admin once your bank transfer is received.</span>
              </div>
            </CardContent>
          </Card>

          {/* Bank instructions + form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" /> Bank Transfer (only accepted method)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Transfer <span className="font-semibold text-foreground">${pricing.price}.00</span> to one of the accounts below, then submit your reference number.
                </p>
                <div className="space-y-2">
                  {BANK_ACCOUNTS.map((b) => (
                    <div key={b.account_number} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40">
                      <div className="text-sm">
                        <div className="font-semibold">{b.bank}</div>
                        <div className="text-muted-foreground">{b.account_name}</div>
                        <div className="font-mono mt-0.5">{b.account_number}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copy(b.account_number)}>
                        <Copy className="w-4 h-4 mr-1" /> Copy
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> Submit your payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Bank you paid from</Label>
                  <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Premier Bank" />
                </div>
                <div>
                  <Label>Transaction reference / receipt #</Label>
                  <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. TX-887821" />
                </div>
                <div>
                  <Label>Note (optional)</Label>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Anything the admin should know" />
                </div>
                <Button
                  onClick={submit}
                  disabled={submitting}
                  className="w-full text-white border-0 h-12 text-base font-semibold"
                  style={{ background: theme.gradient, color: '#0B0E14', boxShadow: `0 0 24px ${theme.accent}88` }}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <theme.Icon className="w-4 h-4 mr-2" />}
                  {submitting ? 'Submitting…' : `Submit Payment for ${tier.toUpperCase()}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VipCheckout;
