import { supabase } from '@/integrations/supabase/client';
export async function classroomRequest(sessionId: string, action: string, extra: Record<string, unknown> = {}) {
 const {data,error}=await supabase.functions.invoke('academy-classroom',{body:{sessionId,action,...extra}});
 if(error){
  let message=error.message;
  if(error.context instanceof Response) { const payload=await error.context.json().catch(()=>null); message=payload?.error??message; }
  throw new Error(message);
 }
 if(data?.error) throw new Error(data.error);
 return data;
}
