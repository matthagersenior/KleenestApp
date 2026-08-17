/* Kleenest Maps Discovery Core — authoritative Supabase + authenticated public-data ingestion + live fallback. */
export function createMapsDiscovery({supabase}={}){
 if(!supabase)throw new Error('Maps Discovery requires Supabase.');
 const applyFilters=(rows,filters={})=>rows.filter(row=>{if(filters.placeType&&String(row.place_type||'').toLowerCase()!==String(filters.placeType).toLowerCase())return false;if(filters.verifiedOnly&&row.bathroom_verification_status!=='has_bathroom')return false;if(filters.source&&row.source!==filters.source)return false;return true;});
 async function refresh({filters={},position=null,radiusMeters=15000,limit=100}={}){
  const lat=Number(position?.coords?.latitude),lng=Number(position?.coords?.longitude),safeLimit=Math.min(Math.max(Number(limit),1),200),safeRadius=Math.min(Math.max(Number(radiusMeters),1),50000);
  let authoritative=[];
  if(Number.isFinite(lat)&&Number.isFinite(lng)){
   const nearby=await supabase.rpc('nearby_locations',{lat,lng,radius_meters:safeRadius,limit_count:safeLimit});
   if(!nearby.error&&Array.isArray(nearby.data))authoritative=nearby.data;
   if(authoritative.length<Math.min(50,safeLimit)&&supabase.functions?.invoke){
    try{
     const ingested=await supabase.functions.invoke('ingest-map-candidates',{body:{lat,lng,radius_m:safeRadius}});
     if(ingested.error)console.warn('[Maps] public ingestion unavailable',ingested.error);
     const after=await supabase.rpc('nearby_locations',{lat,lng,radius_meters:safeRadius,limit_count:safeLimit});
     if(!after.error&&Array.isArray(after.data))authoritative=after.data;
    }catch(e){console.warn('[Maps] public ingestion request failed',e)}
   }
  }
  if(authoritative.length>=Math.min(25,safeLimit))return applyFilters(authoritative,filters);
  let dbRows=authoritative;
  try{
   let q=supabase.from('locations').select('*').eq('is_active',true).limit(safeLimit);
   if(filters.placeType)q=q.eq('place_type',filters.placeType);
   if(filters.verifiedOnly)q=q.eq('bathroom_verification_status','has_bathroom');
   if(filters.source)q=q.eq('source',filters.source);
   const {data}=await q;dbRows=Array.isArray(data)?data:authoritative;
   if(Number.isFinite(lat)&&Number.isFinite(lng))dbRows=dbRows.map(row=>({...row,distance_meters:haversineMeters(lat,lng,Number(row.latitude),Number(row.longitude))})).filter(row=>Number.isFinite(row.distance_meters)&&row.distance_meters<=safeRadius).sort((a,b)=>a.distance_meters-b.distance_meters);
  }catch(e){console.warn('[Maps] locations fallback failed',e)}
  const publicRows=Number.isFinite(lat)&&Number.isFinite(lng)?await fetchOsm({lat,lng,radiusMeters:safeRadius,limit:safeLimit}).catch(e=>{console.warn('[Maps] live public discovery failed',e);return []}):[];
  return applyFilters(mergeUnique(dbRows,publicRows,safeLimit),filters);
 }
 async function search(searchText,limit=100){const {data,error}=await supabase.rpc('search_locations',{search_text:String(searchText||'').trim(),max_results:Math.min(Math.max(Number(limit),1),100)});if(error)throw error;return data||[]}
 async function nearby({lat,lng,radiusMeters=15000,filters={}}={}){return refresh({filters,position:{coords:{latitude:lat,longitude:lng}},radiusMeters});}
 return Object.freeze({refresh,nearby,search});
}
async function fetchOsm({lat,lng,radiusMeters,limit}){const query=`[out:json][timeout:20];(nwr["amenity"~"^(toilets|restaurant|fast_food|cafe|fuel|hospital|clinic)$"](around:${Math.round(radiusMeters)},${lat},${lng});nwr["leisure"="park"](around:${Math.round(radiusMeters)},${lat},${lng}););out center tags;`;const url='https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query);const response=await fetch(url,{headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Public map discovery returned HTTP '+response.status);const json=await response.json();return(Array.isArray(json.elements)?json.elements:[]).map(el=>{const tags=el.tags||{},latitude=Number(el.lat??el.center?.lat),longitude=Number(el.lon??el.center?.lon),placeType=normalizePlaceType(tags),address=[tags['addr:housenumber'],tags['addr:street']].filter(Boolean).join(' ')||tags['addr:full']||'';return{id:'osm:'+String(el.type)+':'+String(el.id),source:'osm',source_id:String(el.type)+':'+String(el.id),name:tags.name||tags.operator||titleFor(placeType),place_type:placeType,latitude,longitude,address,city:tags['addr:city']||'',state:tags['addr:state']||'',postal_code:tags['addr:postcode']||'',phone:tags.phone||tags['contact:phone']||'',website:tags.website||tags['contact:website']||'',opening_hours:tags.opening_hours||null,bathroom_verification_status:tags.amenity==='toilets'?'has_bathroom':'unknown',access:tags.access||tags['toilets:access']||null,accessibility:tags.wheelchair||tags['toilets:wheelchair']||null,amenities:tags,external:true,distance_meters:haversineMeters(lat,lng,latitude,longitude)};}).filter(x=>Number.isFinite(x.latitude)&&Number.isFinite(x.longitude)).sort((a,b)=>a.distance_meters-b.distance_meters).slice(0,limit)}
function normalizePlaceType(tags){if(tags.amenity==='fuel')return'gas_station';if(tags.amenity==='fast_food')return'fast_food';if(tags.amenity==='toilets')return'restroom';if(tags.amenity==='cafe')return'cafe';if(tags.amenity==='hospital'||tags.amenity==='clinic')return'hospital';if(tags.leisure==='park')return'park';return tags.amenity||'place'}
function titleFor(type){return({restroom:'Public Restroom',gas_station:'Gas Station',fast_food:'Fast Food',cafe:'Cafe',hospital:'Hospital',park:'Park'})[type]||'Nearby Place'}
function mergeUnique(primary,external,limit){const out=[],seen=new Set();for(const row of [...primary,...external]){const key=row.id||`${row.name}|${Number(row.latitude).toFixed(5)}|${Number(row.longitude).toFixed(5)}`;if(seen.has(key))continue;seen.add(key);out.push(row);if(out.length>=limit)break}return out}
function haversineMeters(lat1,lon1,lat2,lon2){if(![lat1,lon1,lat2,lon2].every(Number.isFinite))return NaN;const r=6371000,toRad=v=>v*Math.PI/180,dLat=toRad(lat2-lat1),dLon=toRad(lon2-lon1),a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;return 2*r*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}