/* Maps External Ingestion v1 — non-blocking OSM -> Kleenest persistence through the canonical server ingestion gateway. */
export function createMapsExternalIngestion({supabase=null}={}){
  const db=supabase||window.KleenestSupabaseClient;
  async function ingest(rows=[]){
    if(!db?.functions?.invoke||!Array.isArray(rows)||!rows.length)return null;
    const normalized=rows.slice(0,500).map(r=>({latitude:Number(r.latitude),longitude:Number(r.longitude),source_id:String(r.source_id||'')})).filter(r=>r.source_id&&Number.isFinite(r.latitude)&&Number.isFinite(r.longitude));
    if(!normalized.length)return null;
    const lats=normalized.map(r=>r.latitude),lngs=normalized.map(r=>r.longitude);
    const south=Math.max(-90,Math.min(...lats)),north=Math.min(90,Math.max(...lats)),west=Math.max(-180,Math.min(...lngs)),east=Math.min(180,Math.max(...lngs));
    if(south===north||west===east)return null;
    const padLat=Math.min(.02,(north-south)*.1||.02),padLng=Math.min(.02,(east-west)*.1||.02);
    const bbox=[Math.max(-90,south-padLat),Math.max(-180,west-padLng),Math.min(90,north+padLat),Math.min(180,east+padLng)];
    if((bbox[2]-bbox[0])*(bbox[3]-bbox[1])>4)return null;
    const {data,error}=await db.functions.invoke('maps-ingest',{body:{bbox}});
    if(error){console.warn('[Maps] OSM persistence unavailable',error);return null;}
    return data;
  }
  return Object.freeze({ingest});
}
