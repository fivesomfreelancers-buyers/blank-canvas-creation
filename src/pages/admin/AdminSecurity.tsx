import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAdminProfile, fetchAdminProfiles, fetchAllAdminProfiles, findAdminProfileByEmail, displayName } from '@/lib/adminUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, UserX, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const AdminSecurity = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const [r, p] = await Promise.all([
      supabase.from('user_roles').select('*'),
      fetchAllAdminProfiles(),
    ]);
    const allProfiles = (p || []) as any[];
    const enriched = (r.data || []).map((x: any) => {
      const prof = allProfiles.find((q: any) => q.id === x.user_id);
      return { ...x, name: displayName(prof, x.user_id.slice(0, 8)) };
    });
    setRoles(enriched);
    setRecent(
      [...allProfiles]
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 20)
    );
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const removeRole = async (id: string) => {
    if (!confirm('Remove this role?')) return;
    const { error } = await supabase.from('user_roles').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Role removed');
    fetch();
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;

  // Suspicious: profiles created in last 24h with no last_seen activity
  const suspicious = recent.filter(p => {
    const created = new Date(p.created_at).getTime();
    return Date.now() - created < 86400000 && (!p.last_seen || new Date(p.last_seen).getTime() === created);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold">{roles.filter(r => r.role === 'admin' || r.role === 'super_admin').length}</p><p className="text-xs text-muted-foreground">Admins</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold">{recent.length}</p><p className="text-xs text-muted-foreground">Recent Signups</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold text-yellow-500">{suspicious.length}</p><p className="text-xs text-muted-foreground">Suspicious</p></CardContent></Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Role Assignments</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {roles.map(r => (
            <div key={r.id} className="flex items-center justify-between p-2 border border-border rounded">
              <div className="flex items-center gap-2"><Badge variant={r.role === 'admin' || r.role === 'super_admin' ? 'default' : 'secondary'}>{r.role}</Badge><span className="text-sm text-foreground">{r.name}</span></div>
              <Button size="sm" variant="ghost" onClick={() => removeRole(r.id)}><UserX className="h-3.5 w-3.5 text-destructive" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {suspicious.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardHeader><CardTitle className="text-base flex items-center gap-2 text-yellow-500"><AlertTriangle className="h-4 w-4" /> Suspicious Accounts (no activity)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {suspicious.map(p => (
              <div key={p.id} className="text-sm text-foreground p-2 border border-border rounded">
                <span className="font-medium">{p.full_name || 'Unknown'}</span> <span className="text-muted-foreground">({p.email})</span> <span className="text-xs text-muted-foreground">— {new Date(p.created_at).toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSecurity;
