/* Kleenest Maps Discovery Core — canonical Supabase discovery path. */
export function createMapsDiscovery({supabase}={}){
 if(!supabase)throw new Error('Maps Discovery requires Supabase.');
 const applyFilters=(rows,filters={})=>rows.filter(row=>{if(filters.placeType&&String(row.place_type||'').toLowerCase()!==String(filters.placeType).toLowerCase())return false;if(filters.verifiedOnly&&row.bathroom_verification_status!=='has_bathroom')return false;if(filters.source&&row.source!==filters.source)return false;return true});
 async function refresh({filters={},position=null,radiusMeters=15000,limit=100}={}){
  const lat=Number(position?.coords?.latitude),lng=Number(position?.coords?.longitude);
  if(Number.isFinite(lat)&&Number.isFinite(lng)){
   const {data,error}=await supabase.rpc('nearby_locations',{lat,lng,radius_meters:Math.min(Math.max(Number(radiusMeters),1),50000),limit_count:Math.min(Math.max(Number(limit),1),200)});
   if(!error&&data)return applyFilters(data,filters);
  }
  let q=supabase.from('locations').select('*').eq('is_active',true).limit(Math.min(Math.max(Number(limit),1),200));
  if(filters.placeType)q=q.eq('place_type',filters.placeType);
  if(filters.verifiedOnly)q=q.eq('bathroom_verification_status','has_bathroom');
  if(filters.source)q=q.eq('source',filters.source);
  const {data,error}=await q;if(error)throw error;return applyFilters(data||[],filters);
 }
 async function search(searchText,limit=100){const {data,error}=await supabase.rpc('search_locations',{search_text:String(searchText||'').trim(),max_results:Math.min(Math.max(Number(limit),1),100)});if(error)throw error;return data||[]}
 async function nearby({lat,lng,radiusMeters=15000,filters={}}={}){return refresh({filters,position:{coords:{latitude:lat,longitude:lng}},radiusMeters})}
 return Object.freeze({refresh,nearby,search});
}