/* Kleenest Maps Discovery Core — canonical Supabase discovery path. */
export function createMapsDiscovery({supabase}={}){
 if(!supabase)throw new Error('Maps Discovery requires Supabase.');
 const applyFilters=(rows,filters={})=>rows.filter(row=>{if(filters.placeType&&String(row.place_type||'').toLowerCase()!==String(filters.placeType).toLowerCase())return false;if(filters.verifiedOnly&&row.bathroom_verification_status!=='has_bathroom')return false;if(filters.source&&row.source!==filters.source)return false;return true;});
 async function refresh({filters={},position=null,radiusMeters=15000,limit=100}={}){
  const lat=Number(position?.coords?.latitude),lng=Number(position?.coords?.longitude),safeLimit=Math.min(Math.max(Number(limit),1),200),safeRadius=Math.min(Math.max(Number(radiusMeters),1),50000);
  if(Number.isFinite(lat)&&Number.isFinite(lng)){
   const nearby=await supabase.rpc('nearby_locations',{lat,lng,radius_meters:safeRadius,limit_count:safeLimit});
   if(!nearby.error&&Array.isArray(nearby.data)&&nearby.data.length)return applyFilters(nearby.data,filters);
  }
  /* Deterministic fallback: the locations table is authoritative when the nearby
     RPC has no matches. Do not invoke an edge function that is not deployed. */
  let q=supabase.from('locations').select('*').eq('is_active',true).limit(safeLimit);
  if(filters.placeType)q=q.eq('place_type',filters.placeType);
  if(filters.verifiedOnly)q=q.eq('bathroom_verification_status','has_bathroom');
  if(filters.source)q=q.eq('source',filters.source);
  const {data,error}=await q;if(error)throw error;
  let rows=Array.isArray(data)?data:[];
  if(Number.isFinite(lat)&&Number.isFinite(lng)){
   rows=rows.map(row=>({...row,distance_meters:haversineMeters(lat,lng,Number(row.latitude),Number(row.longitude))}))
    .filter(row=>Number.isFinite(row.distance_meters)&&row.distance_meters<=safeRadius)
    .sort((a,b)=>a.distance_meters-b.distance_meters);
  }
  return applyFilters(rows,filters);
 }
 async function search(searchText,limit=100){const {data,error}=await supabase.rpc('search_locations',{search_text:String(searchText||'').trim(),max_results:Math.min(Math.max(Number(limit),1),100)});if(error)throw error;return data||[];}
 async function nearby({lat,lng,radiusMeters=15000,filters={}}={}){return refresh({filters,position:{coords:{latitude:lat,longitude:lng}},radiusMeters});}
 return Object.freeze({refresh,nearby,search});
}
function haversineMeters(lat1,lon1,lat2,lon2){if(![lat1,lon1,lat2,lon2].every(Number.isFinite))return NaN;const r=6371000,toRad=v=>v*Math.PI/180,dLat=toRad(lat2-lat1),dLon=toRad(lon2-lon1),a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;return 2*r*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}