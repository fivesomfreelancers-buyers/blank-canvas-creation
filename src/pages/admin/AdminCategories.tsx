import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderTree, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { MAIN_CATEGORIES } from '@/lib/categories';

const AdminCategories = () => {
  const [subs, setSubs] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [catId, setCatId] = useState('');
  const [cats, setCats] = useState<any[]>([]);

  const fetch = async () => {
    const [c, s] = await Promise.all([
      supabase.from('categories' as any).select('*'),
      supabase.from('subcategories').select('*').order('name'),
    ]);
    setCats((c as any).data || []);
    setSubs(s.data || []);
  };

  useEffect(() => { fetch(); }, []);

  const add = async () => {
    if (!name || !catId) return toast.error('Pick category and enter name');
    const { error } = await supabase.from('subcategories').insert({ name, category_id: catId } as any);
    if (error) return toast.error(error.message);
    toast.success('Subcategory added');
    setName('');
    fetch();
  };

  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) return toast.error('Failed');
    toast.success('Deleted');
    fetch();
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FolderTree className="h-4 w-4" /> Main Categories (Locked)</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {MAIN_CATEGORIES.map(c => <Badge key={c.slug} variant="secondary" className="text-sm py-1 px-3">{c.name}</Badge>)}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base">Add Subcategory</CardTitle></CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Select value={catId} onValueChange={setCatId}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Pick main category" /></SelectTrigger>
            <SelectContent>{cats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Subcategory name" className="flex-1 min-w-[200px]" />
          <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base">Subcategories ({subs.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {subs.map(s => {
            const cat = cats.find(c => c.id === s.category_id);
            return (
              <div key={s.id} className="flex items-center justify-between p-2 border border-border rounded">
                <div><span className="text-sm font-medium text-foreground">{s.name}</span> <span className="text-xs text-muted-foreground ml-2">in {cat?.name || '—'}</span></div>
                <Button size="sm" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            );
          })}
          {subs.length === 0 && <p className="text-center text-muted-foreground py-4">No subcategories</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategories;
