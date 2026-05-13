import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const AdminSettings = () => {
  const { user } = useAuth();
  const [s, setS] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('platform_settings' as any).select('*').maybeSingle().then(({ data }: any) => {
      setS(data || { platform_fee_percent: 10, withdrawal_min: 10, escrow_hold_days: 3, maintenance_mode: false, homepage_announcement: '' });
      setLoading(false);
    });
  }, []);

  const save = async () => {
    if (!user) return;
    const payload = { ...s, id: true, updated_by: user.id, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('platform_settings' as any).upsert(payload);
    if (error) return toast.error(error.message);
    toast.success('Settings saved');
  };

  if (loading || !s) return <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;

  return (
    <Card className="border-border bg-card max-w-2xl">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><SettingsIcon className="h-4 w-4" /> Platform Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Platform Fee (%)</label>
          <Input type="number" value={s.platform_fee_percent} onChange={e => setS({ ...s, platform_fee_percent: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Minimum Withdrawal ($)</label>
          <Input type="number" value={s.withdrawal_min} onChange={e => setS({ ...s, withdrawal_min: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Escrow Hold Days</label>
          <Input type="number" value={s.escrow_hold_days} onChange={e => setS({ ...s, escrow_hold_days: Number(e.target.value) })} />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={s.maintenance_mode} onCheckedChange={v => setS({ ...s, maintenance_mode: v })} />
          <label className="text-sm font-medium text-foreground">Maintenance Mode</label>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Homepage Announcement</label>
          <Textarea value={s.homepage_announcement || ''} onChange={e => setS({ ...s, homepage_announcement: e.target.value })} rows={3} />
        </div>
        <Button onClick={save}>Save Settings</Button>
      </CardContent>
    </Card>
  );
};

export default AdminSettings;
