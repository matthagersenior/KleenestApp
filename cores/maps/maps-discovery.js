/* Maps Discovery: Supabase-first, normalized, proximity-aware discovery. */
export function createMapsDiscovery({supabase}={}){
 const latOf=x=>Number(x.lat??x.latitude??x.location_lat??x.y),lngOf=x=>Number(x.lng??x.lon??x.longitude??x.location_lng??x.x);
 function distanceM(a,b){const R=6371000,rad=Math.PI/180,dLat=(b.lat-a.lat)*rad,dLng=(b.lng-a.lng)*rad,s=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2;return 2*R*Math.asin(Math.sqrt(s))}
 async function refresh({filters={},position=null,radiusMeters=10000}={}){
  if(!supabase)throw new Error('Maps Discovery requires Supabase.');
  let query=supabase.from('locations').select('*').limit(500);
  if(filters.type)query=query.eq('type',filters.type);
  if(filters.verifiedOnly)query=query.eq('verified',true);
  const {data,error}=await query;if(error)throw error;
  let rows=(data||[]).map(x=>({...x,lat:latOf(x),lng:lngOf(x)})).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lng));
  if(position?.coords){const origin={lat:position.coords.latitude,lng:position.coords.longitude};rows=rows.map(x=>({...x,distance_m:distanceM(origin,{lat:x.lat,lng:x.lng})})).filter(x=>x.distance_m<=radiusMeters).sort((a,b)=>a.distance_m-b.distance_m)}
  return rows;
 }
 async function nearby({lat,lng,radiusMeters=10000,filters={}}={}){return refresh({filters,position:{coords:{latitude:lat,longitude:lng}},radiusMeters})}
 return Object.freeze({refresh,nearby});
}