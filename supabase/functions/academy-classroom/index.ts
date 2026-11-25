import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { AccessToken, RoomServiceClient, TrackSource } from 'npm:livekit-server-sdk@2';
import { z } from 'npm:zod@3';
import { mayEnterClassroom, joinError, RECORDING_ENABLED } from './rules.ts';
const bodySchema = z.object({ sessionId: z.string().uuid(), action: z.enum(['inspect','join','end','leave','remove','mute','permissions','attendance']), participantId: z.string().uuid().optional(), microphone: z.boolean().optional(), camera: z.boolean().optional(), chat: z.boolean().optional() });
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
Deno.serve(async req => {
 if (req.method === 'OPTIONS') return new Response('ok',{headers:corsHeaders});
 try {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return reply({error:'Please sign in to enter the classroom.'},401);
  const url=Deno.env.get('SUPABASE_URL'), anon=Deno.env.get('SUPABASE_ANON_KEY'), service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anon || !service) return reply({error:'Classroom configuration is unavailable.'},503);
  const client=createClient(url,anon,{global:{headers:{Authorization:auth}}});
  const {data:identity,error:authError}=await client.auth.getUser(auth.slice(7));
  if(authError || !identity.user) return reply({error:'Please sign in again.'},401);
  const parsed=bodySchema.safeParse(await req.json());
  if(!parsed.success) return reply({error:'Invalid classroom request.'},400);
  const b=parsed.data, uid=identity.user.id;
  const admin=createClient(url,service);
  const {data:s,error}=await admin.from('academy_live_sessions').select('*,academy_courses(title,status)').eq('id',b.sessionId).maybeSingle();
  if(error || !s) return reply({error:'Classroom not found.'},404);
  const host=s.instructor_id===uid;
  if(!host){
   const {data:en}=await admin.from('academy_enrollments').select('id').eq('course_id',s.course_id).eq('student_id',uid).maybeSingle();
   if(!mayEnterClassroom(host,Boolean(en),s.academy_courses?.status==='published',false)) return reply({error:'Only the course instructor and enrolled students can enter.'},403);
  }
  const {data:record}=await admin.from('academy_live_attendance').select('removed').eq('session_id',s.id).eq('user_id',uid).maybeSingle();
  if(record?.removed && !host) return reply({error:'You have been removed from this classroom.'},403);
  if(b.action==='inspect') return reply({session:s,isHost:host,recording:RECORDING_ENABLED});
  if(b.action==='attendance') {
   if(!host) return reply({error:'Instructor access required.'},403);
   const {data,error}=await admin.from('academy_live_attendance').select('*').eq('session_id',s.id);
   return error?reply({error:error.message},400):reply({attendance:data});
  }
  if(b.action==='leave') {
   await admin.from('academy_live_attendance').update({left_at:new Date().toISOString()}).eq('session_id',s.id).eq('user_id',uid);
   return reply({ok:true});
  }
  if(!host && b.action!=='join') return reply({error:'Only the instructor can manage this classroom.'},403);
  const lkUrl=Deno.env.get('LIVEKIT_URL'), key=Deno.env.get('LIVEKIT_API_KEY'), secret=Deno.env.get('LIVEKIT_API_SECRET');
  if(!lkUrl || !key || !secret) return reply({error:'Live video is not connected yet.'},503);
  const rooms=new RoomServiceClient(lkUrl.replace(/^wss:/,'https:').replace(/^ws:/,'http:'),key,secret);
  const room=`academy-${s.id}`;
  if(b.action==='end') {
   if(s.status!=='live') return reply({error:'This class is not live.'},409);
   await rooms.deleteRoom(room);
   const {error}=await admin.from('academy_live_sessions').update({status:'ended',ended_at:new Date().toISOString()}).eq('id',s.id).eq('status','live');
   if(error) return reply({error:error.message},400);
   await admin.from('academy_live_attendance').update({left_at:new Date().toISOString()}).eq('session_id',s.id).is('left_at',null);
   return reply({ok:true});
  }
  if(b.action==='remove' || b.action==='mute'){
   if(!b.participantId || b.participantId===uid) return reply({error:'Choose a student.'},400);
   if(b.action==='remove') {
    const {error}=await admin.from('academy_live_attendance').update({removed:true,left_at:new Date().toISOString()}).eq('session_id',s.id).eq('user_id',b.participantId);
    if(error) return reply({error:error.message},400);
    await rooms.removeParticipant(room,b.participantId);
   } else {
    const p=await rooms.getParticipant(room,b.participantId);
    for(const track of p.tracks) if(track.source===TrackSource.MICROPHONE) await rooms.mutePublishedTrack(room,b.participantId,track.sid,true);
   }
   return reply({ok:true});
  }
  if(b.action==='permissions'){
   const mic=b.microphone??s.allow_microphone, camera=b.camera??s.allow_camera, chat=b.chat??s.chat_enabled;
   const participants=await rooms.listParticipants(room);
   for(const p of participants) if(p.identity!==uid) await rooms.updateParticipant(room,p.identity,undefined,{canSubscribe:true,canPublish:mic||camera,canPublishData:chat,canPublishSources:[...(mic?[TrackSource.MICROPHONE]:[]),...(camera?[TrackSource.CAMERA]:[])]});
   const {error}=await admin.from('academy_live_sessions').update({allow_microphone:mic,allow_camera:camera,chat_enabled:chat}).eq('id',s.id);
   return error?reply({error:error.message},400):reply({ok:true});
  }
  const stateError=joinError(s.status,host);
  if(stateError) return reply({error:stateError},409);
  if(host && s.status==='scheduled') {
   await rooms.createRoom({name:room,emptyTimeout:300,departureTimeout:60,metadata:JSON.stringify({sessionId:s.id,recording:RECORDING_ENABLED})});
   const {data:started,error}=await admin.from('academy_live_sessions').update({status:'live',started_at:new Date().toISOString()}).eq('id',s.id).eq('status','scheduled').select('id');
   if(error || !started?.length) return reply({error:error?.message??'Class state changed. Refresh and retry.'},409);
  }
  const {data:profile}=await admin.from('profiles').select('full_name').eq('id',uid).maybeSingle();
  const token=new AccessToken(key,secret,{identity:uid,name:profile?.full_name??(host?'Instructor':'Student'),ttl:'5m',metadata:JSON.stringify({isHost:host})});
  token.addGrant({roomJoin:true,room,canSubscribe:true,canPublish:host||s.allow_microphone||s.allow_camera,canPublishData:host||s.chat_enabled,canUpdateOwnMetadata:true,canPublishSources:host?[TrackSource.CAMERA,TrackSource.MICROPHONE,TrackSource.SCREEN_SHARE,TrackSource.SCREEN_SHARE_AUDIO]:[...(s.allow_microphone?[TrackSource.MICROPHONE]:[]),...(s.allow_camera?[TrackSource.CAMERA]:[])]});
  const now=new Date().toISOString();
  const {error:attError}=await admin.from('academy_live_attendance').upsert({session_id:s.id,user_id:uid,last_joined_at:now,left_at:null},{onConflict:'session_id,user_id'});
  if(attError) return reply({error:attError.message},400);
  return reply({token:await token.toJwt(),serverUrl:lkUrl,isHost:host});
 } catch(e) { return reply({error:e instanceof Error?e.message:'Classroom request failed.'},502); }
});
