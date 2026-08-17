/* Maps External Ingestion v1 — non-blocking OSM -> Kleenest persistence through the canonical server ingestion gateway. */
export function createMapsExternalIngestion({supabase=null}={}){
  const db=supabase||window.KleenestSupabaseClient;
  async function ingest(rows=[],options={}){
    if(!db?.functions?.invoke)return null;
    const normalized=Array.isArray(rows)?rows.slice(0,500).map(r=>({latitude:Number(r.latitude),longitude:Number(r.longitude),source_id:String(r.source_id||'')})).filter(r=>r.source_id&&Number.isFinite(r.latitude)&&Number.isFinite(r.longitude)):[];
    const bbox=normalizeBbox(options.bbox)||bboxFromRows(normalized);
    if(!bbox)return null;
    const {data,error}=await db.functions.invoke('maps-ingest',{body:{bbox}});
    if(error){console.warn('[Maps] OSM persistence unavailable',error);return null;}
    return data;
  }
  function bboxFromRows(rows){if(!rows.length)return null;const lats=rows.map(r=>r.latitude),lngs=rows.map(r=>r.longitude);return paddedBbox(Math.min(...lats),Math.max(...lats),Math.min(...lngs),Math.max(...lngs))}
  function bboxFromCenter(lat,lng,radiusMeters){const dLat=Math.max(.005,(Number(radiusMeters)||16093)/111320),dLng=dLat/Math.max(.2,Math.cos(Number(lat)*Math.PI/180));return paddedBbox(Number(lat)-dLat,Number(lat)+dLat,Number(lng)-dLng,Number(lng)+dLng)}
  function paddedBbox(south,north,west,east){if(![south,north,west,east].every(Number.isFinite))return null;const padLat=Math.min(.02,Math.max(.001,(north-south)*.1)),padLng=Math.min(.02,Math.max(.001,(east-west)*.1));const b=[Math.max(-90,south-padLat),Math.max(-180,west-padLng),Math.min(90,north+padLat),Math.min(180,east+padLng)];return b[0]<b[2]&&b[1]<b[3]&&(b[2]-b[0])*(b[3]-b[1])<=4?b:null}
  function normalizeBbox(value){if(!Array.isArray(value)||value.length!==4)return null;const b=value.map(Number);return b.every(Number.isFinite)&&b[0]>=-90&&b[2]<=90&&b[1]>=-180&&b[3]<=180&&b[0]<b[2]&&b[1]<b[3]&&(b[2]-b[0])*(b[3]-b[1])<=4?b:null}
  return Object.freeze({ingest,bboxFromCenter});
}
