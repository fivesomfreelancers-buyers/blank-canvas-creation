import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { RoomServiceClient } from 'npm:livekit-server-sdk@2';
import { mayEnterClassroom, joinError, RECORDING_ENABLED } from './rules.ts';
Deno.test('enrollment and role security',()=>{assertEquals(mayEnterClassroom(false,false,true,false),false);assertEquals(mayEnterClassroom(false,true,true,true),false);assertEquals(mayEnterClassroom(true,false,false,false),true);});
Deno.test('live classes have no recording and wait for host',()=>{assertEquals(RECORDING_ENABLED,false);assertEquals(joinError('scheduled',false),'Your instructor has not started this class yet.');});
Deno.test('LiveKit credentials can reach room service without creating rooms or recordings',async()=>{
 const url=Deno.env.get('LIVEKIT_URL'),key=Deno.env.get('LIVEKIT_API_KEY'),secret=Deno.env.get('LIVEKIT_API_SECRET');
 if(!url||!key||!secret)throw new Error('LiveKit credentials missing');
 const service=new RoomServiceClient(url.replace(/^wss:/,'https:').replace(/^ws:/,'http:'),key,secret);
 const rooms=await service.listRooms();assertEquals(Array.isArray(rooms),true);
});
Deno.test('classroom endpoint rejects unsigned visitors',async()=>{
 const base=Deno.env.get('SUPABASE_URL');if(!base)throw new Error('Supabase URL missing');
 const result=await fetch(`${base}/functions/v1/academy-classroom`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'11111111-1111-1111-1111-111111111111',action:'join'})});
 await result.text();assertEquals(result.status,401);
});
