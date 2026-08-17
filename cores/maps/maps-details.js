/* Maps Details Core — canonical detail RPC with public-data fallback. */
export function createMapsDetails({supabase,engagement=null,verification=null,routes=null,social=null}={}){
 async function open(locationId,context={}){
  if(!locationId)throw new Error('A location is required.');
  const external=String(locationId).startsWith('osm:');
  let location=null;
  if(!external){const {data,error}=await supabase.rpc('get_location_details',{p_location_id:locationId});if(!error){location=Array.isArray(data)?(data[0]||{}):(data||{});}}
  if(!location){location=(context.state?.locations||[]).find(x=>String(x.id)===String(locationId))||null;}
  if(!location)throw new Error('Location details are unavailable.');
  const dbId=!external&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(locationId));
  return {location,external,actions:{
   checkIn:dbId?(payload={})=>engagement?.checkIn(locationId,payload):()=>Promise.resolve({available:false,reason:'Public-data locations must be verified into Kleenest before check-in.'}),
   favorite:dbId?(active=true)=>engagement?.favorite(locationId,active):()=>Promise.resolve({available:false,reason:'Favorite becomes available after the location is added to Kleenest.'}),
   verify:dbId?(evidence={})=>verification?.verify({locationId,evidence}):()=>Promise.resolve({available:false,reason:'Public-data verification will add this location to Kleenest.'}),
   addToRoute:()=>routes?.addLocation?.(locationId),
   share:()=>social?.shareLocation?.(location)
  }};
 }
 return Object.freeze({open});
}