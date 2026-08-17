/* Maps External Ingestion v1 — non-blocking OSM -> Kleenest persistence. */
export function createMapsExternalIngestion({supabase=null}={}){
  const db=supabase||window.KleenestSupabaseClient;
  async function ingest(rows=[]){
    if(!db?.rpc||!Array.isArray(rows)||!rows.length)return null;
    const normalized=rows.slice(0,500).map(r=>({
      source_id:String(r.source_id||''),latitude:Number(r.latitude),longitude:Number(r.longitude),name:r.name||'',place_type:r.place_type||'place',address:r.address||'',city:r.city||'',state:r.state||'',postal_code:r.postal_code||'',phone:r.phone||'',website:r.website||'',osm_amenity:r.amenity||r.osm_amenity||'',observations:mapObservations(r),source_metadata:r.source_metadata||r.tags||{}
    })).filter(r=>r.source_id&&Number.isFinite(r.latitude)&&Number.isFinite(r.longitude));
    if(!normalized.length)return null;
    const {data,error}=await db.rpc('ingest_osm_locations',{p_rows:normalized});
    if(error){console.warn('[Maps] OSM persistence unavailable',error);return null;}
    return data;
  }
  return Object.freeze({ingest});
}
function mapObservations(row){
  const t=row.tags||{};const out={};
  const map={'toilets:access':'toilet_access','toilets:fee':'toilet_fee','opening_hours':'opening_hours','toilets:opening_hours':'toilet_opening_hours','toilets:wheelchair':'wheelchair_accessible','wheelchair':'wheelchair_accessible','toilets:handwashing':'handwashing','toilets:soap':'soap','toilets:paper_supplied':'paper_supplied','toilets:hand-drying':'hand_drying','toilets:changing_table':'changing_table','changing_table':'changing_table','toilets:unisex':'unisex','toilets:gender_neutral':'gender_neutral','toilets:menstrual_products':'menstrual_products','toilets:disposal':'sanitary_disposal','toilets:shower':'shower','toilets:bidet':'bidet','toilets:position':'toilet_position','toilets:type':'toilet_type','toilets:number':'toilet_count','toilets:supervised':'supervised','toilets:drinking_water':'drinking_water','access':'access','fee':'fee','operator':'operator','brand':'brand'};
  for(const [k,v] of Object.entries(map))if(t[k]!=null&&String(t[k]).trim()!=='')out[v]=String(t[k]);
  return out;
}
