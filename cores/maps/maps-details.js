/* Maps Details Core — canonical detail RPC with capability-safe actions. */
export function createMapsDetails({supabase,engagement=null,verification=null,routes=null,social=null}={}){
 async function open(locationId,context={}){
  if(!locationId)throw new Error('A location is required.');
  const rawId=String(locationId),external=rawId.startsWith('osm:'),dbId=!external&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawId);
  let location=null;
  if(dbId){const {data,error}=await supabase.rpc('get_location_details',{p_location_id:locationId});if(!error)location=Array.isArray(data)?(data[0]||{}):(data||{});}
  if(!location)location=(context.state?.locations||[]).find(x=>String(x.id)===rawId)||null;
  if(!location)throw new Error('Location details are unavailable.');
  const publicCapability=()=>({available:false,reason:'Public-data locations must be verified into Kleenest before this action is available.'});
  return {location,external,capabilities:{canCheckIn:dbId,canFavorite:dbId,canVerify:dbId,canRoute:dbId,canShare:true},actions:{
   checkIn:dbId?(payload={})=>engagement?.checkIn(locationId,payload):publicCapability,
   favorite:dbId?(active=true)=>engagement?.favorite(locationId,active):publicCapability,
   verify:dbId?(evidence={})=>verification?.verify({locationId,evidence}):publicCapability,
   addToRoute:dbId?()=>routes?.addLocation?.(locationId):publicCapability,
   share:()=>social?.shareLocation?.(location)
  }};
 }
 return Object.freeze({open});
}