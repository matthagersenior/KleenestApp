/* Kleenest Maps Discovery Core — canonical Supabase discovery path with live candidate ingestion fallback. */
export function createMapsDiscovery({supabase}={}){
 if(!supabase)throw new Error('Maps Discovery requires Supabase.');
 const applyFilters=(rows,filters={})=>rows.filter(row=>{if(filters.placeType&&String(row.place_type||'').toLowerCase()!==String(filters.placeType).toLowerCase())return false;if(filters.verifiedOnly&&row.bathroom_verification_status!=='has_bathroom')return false;if(filters.source&&row.source!==filters.source)return false;return true});
 async function ingestCandidates({lat,lng,radiusMeters=25000}={}){
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||!supabase.functions?.invoke)return [];
  try{const {data,error}=await supabase.functions.invoke('ingest-map-candidates',{body:{lat,lng,radius_m:Math.min(Math.max(Number(radiusMeters),1000),50000)}});if(error)throw error;return data||{}}catch(_){return null}
 }
 async function refresh({filters={},position=null,radiusMeters=15000,limit=100}={}){
  const lat=Number(position?.coords?.latitude),lng=Number(position?.coords?.longitude),safeLimit=Math.min(Math.max(Number(limit),1),200),safeRadius=Math.min(Math.max(Number(radiusMeters),1),50000);
  if(Number.isFinite(lat)&&Number.isFinite(lng)){
   const {data,error}=await supabase.rpc('nearby_locations',{lat,lng,radius_meters:safeRadius,limit_count:safeLimit});
   if(!error&&data?.length)return applyFilters(data,filters);
   /* Seed the authoritative locations table from the deployed, JWT-protected OSM ingestion function when the nearby dataset is empty. */
   await ingestCandidates({lat,lng,radiusMeters:safeRadius});
   const retry=await supabase.rpc('nearby_locations',{lat,lng,radius_meters:safeRadius,limit_count:safeLimit});
   if(!retry.error&&retry.data?.length)return applyFilters(retry.data,filters);
  }
  let q=supabase.from('locations').select('*').eq('is_active',true).limit(safeLimit);
  if(filters.placeType)q=q.eq('place_type',filters.placeType);
  if(filters.verifiedOnly)q=q.eq('bathroom_verification_status','has_bathroom');
  if(filters.source)q=q.eq('source',filters.source);
  const {data,error}=await q;if(error)throw error;return applyFilters(data||[],filters);
 }
 async function search(searchText,limit=100){const {data,error}=await supabase.rpc('search_locations',{search_text:String(searchText||'').trim(),max_results:Math.min(Math.max(Number(limit),1),100)});if(error)throw error;return data||[]}
 async function nearby({lat,lng,radiusMeters=15000,filters={}}={}){return refresh({filters,position:{coords:{latitude:lat,longitude:lng}},radiusMeters})}
 return Object.freeze({refresh,nearby,search,ingestCandidates});
}
