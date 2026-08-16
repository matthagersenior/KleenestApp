/* Kleenest Maps Discovery Core — canonical Supabase discovery path. */
export function createMapsDiscovery({supabase}={}){
 if(!supabase)throw new Error('Maps Discovery requires Supabase.');
 const applyFilters=(rows,filters={})=>rows.filter(row=>{if(filters.type&&String(row.type||row.location_type||'').toLowerCase()!==String(filters.type).toLowerCase())return false;if(filters.verifiedOnly&&row.verified!==true&&row.is_verified!==true)return false;return true});
 async function refresh({filters={},position=null,radiusMeters=15000,limit=100}={}){
  const lat=Number(position?.coords?.latitude),lng=Number(position?.coords?.longitude);
  if(Number.isFinite(lat)&&Number.isFinite(lng)){
   const {data,error}=await supabase.rpc('nearby_locations',{lat,lng,radius_meters:Math.min(Math.max(Number(radiusMeters),1),50000),limit_count:Math.min(Math.max(Number(limit),1),200)});
   if(error)throw error;
   return applyFilters(data||[],filters);
  }
  const {data,error}=await supabase.from('locations').select('*').limit(Math.min(Math.max(Number(limit),1),200));
  if(error)throw error;
  return applyFilters(data||[],filters);
 }
 async function search(searchText,limit=100){const {data,error}=await supabase.rpc('search_locations',{search_text:String(searchText||'').trim(),max_results:Math.min(Math.max(Number(limit),1),100)});if(error)throw error;return data||[]}
 async function nearby({lat,lng,radiusMeters=15000,filters={}}={}){return refresh({filters,position:{coords:{latitude:lat,longitude:lng}},radiusMeters})}
 return Object.freeze({refresh,nearby,search});
}
