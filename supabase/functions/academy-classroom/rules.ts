export function mayEnterClassroom(host:boolean,enrolled:boolean,published:boolean,removed:boolean){
 return host || (enrolled && published && !removed);
}
export function joinError(status:string,host:boolean){
 if(status==='ended'||status==='cancelled')return 'This live class has ended or was cancelled.';
 if(!host&&status!=='live')return 'Your instructor has not started this class yet.';
 return null;
}
export const RECORDING_ENABLED=false;
