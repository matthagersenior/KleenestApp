/* Maps Details Core — canonical location detail RPC + cross-core actions. */
export function createMapsDetails({supabase,engagement=null,verification=null,routes=null,social=null}={}){
 async function open(locationId){
  if(!locationId)throw new Error('A location is required.');
  const {data,error}=await supabase.rpc('get_location_details',{p_location_id:locationId});
  if(error)throw error;
  const location=Array.isArray(data)?(data[0]||{}):(data||{});
  return {location,actions:{
   checkIn:(payload={})=>engagement?.checkIn(locationId,payload),
   favorite:(active=true)=>engagement?.favorite(locationId,active),
   verify:(evidence={})=>verification?.verify({locationId,evidence}),
   addToRoute:()=>routes?.addLocation?.(locationId),
   share:()=>social?.shareLocation?.(location)
  }};
 }
 return Object.freeze({open});
}