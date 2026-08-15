/* Modular OSM/Overpass discovery. Public nearby venues are discovery candidates; bathroom verification is separate. */
(function(){'use strict';
 const X=window.KleenestMapExternalDiscovery=window.KleenestMapExternalDiscovery||{};
 const hav=(a,b,c,d)=>{const R=3958.7613,r=Math.PI/180,dl=(c-a)*r,dp=(d-b)*r,x=Math.sin(dl/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(dp/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));};
 async function query(q){for(const host of ['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter']){try{const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),9000);const res=await fetch(host+'?data='+encodeURIComponent(q),{headers:{Accept:'application/json'},signal:ctl.signal,cache:'no-store'});clearTimeout(timer);if(!res.ok)continue;const data=await res.json();if(Array.isArray(data.elements))return data}catch(e){console.warn('[Kleenest] Overpass host failed',host,e)}}return {elements:[]};}
 function classify(t){
  if(t.amenity==='toilets'||t.toilets==='yes'||t['toilets:access']==='public')return ['toilets','Bathrooms'];
  if(t.amenity==='fuel'||t.highway==='services'||t.highway==='rest_area')return ['gas_station','Gas / Travel'];
  if(t.amenity==='restaurant'||t.amenity==='fast_food')return ['restaurant','Restaurants'];
  if(t.amenity==='cafe'||t.amenity==='bar'||t.amenity==='pub')return ['cafe','Cafes / Food'];
  if(['supermarket','convenience','mall','department_store','bakery','pharmacy','clothes','books'].includes(t.shop))return ['retail','Retail'];
  if(['hospital','clinic','doctors','dentist','pharmacy'].includes(t.amenity))return ['health','Health'];
  if(t.amenity==='library')return ['library','Libraries'];
  if(t.amenity==='post_office')return ['post_office','Post Offices'];
  if(['school','college','university','kindergarten'].includes(t.amenity))return ['education','Schools'];
  if(t.amenity==='place_of_worship'||t.building==='church'||t.building==='chapel'||t.religion)return ['worship','Churches / Worship'];
  if(t.aeroway==='aerodrome'||t.aeroway==='terminal'||t.aeroway==='helipad')return ['airport','Airports'];
  if(['townhall','courthouse','police','fire_station'].includes(t.amenity)||t.office==='government')return ['public','Public / Government'];
  if(['park','nature_reserve','playground','sports_centre'].includes(t.leisure))return ['park','Parks / Recreation'];
  if(t.railway==='station'||t.amenity==='bus_station'||t.public_transport)return ['transit','Transit'];
  if(t.amenity==='bank'||t.amenity==='atm')return ['financial','Banks / ATMs'];
  if(['cinema','theatre'].includes(t.amenity)||['museum','gallery'].includes(t.tourism))return ['culture','Arts / Culture'];
  if(['hotel','motel','hostel'].includes(t.tourism))return ['lodging','Hotels / Lodging'];
  if(['community_centre','social_centre'].includes(t.amenity))return ['community','Community'];
  return ['other','Nearby Places'];
 }
 function mapEl(el,lat,lng){const t=el.tags||{},[segment,label]=classify(t),name=t.name||t.brand||t.operator||label;const addr=[t['addr:housenumber'],t['addr:street'],t['addr:city']].filter(Boolean).join(' ');const hasBathroom=segment==='toilets';return{id:'osm-'+el.type+'-'+el.id,name,address:addr||'Nearby',lat,lng,place_type:segment,segment,source:'osm',source_dataset:'overpass',source_external_id:`${el.type}/${el.id}`,source_metadata:{osm_type:el.type,osm_id:el.id,tags:t},bathroom_verification_status:hasBathroom?'has_bathroom':'unverified',bathroom_verified:hasBathroom,restroomConfidence:hasBathroom?'confirmed':'possible',accessible:t.wheelchair==='yes'||t['toilets:wheelchair']==='yes',changing:t.changing_table==='yes'||t.diaper==='yes',amenities:hasBathroom?['Mapped restroom']:[],hours:t.opening_hours||'See venue hours',osmTags:t};}
 const groups=[
  '["amenity"~"toilets|fuel|restaurant|fast_food|cafe|bar|pub|hospital|clinic|doctors|dentist"]',
  '["amenity"~"library|post_office|school|college|university|kindergarten|place_of_worship|townhall|courthouse|police|fire_station|bank|atm|cinema|theatre|community_centre|social_centre"]',
  '["shop"~"supermarket|convenience|mall|department_store|bakery|pharmacy|clothes|books"]',
  '["leisure"~"park|nature_reserve|playground|sports_centre"]',
  '["railway"="station"]',
  '["public_transport"]',
  '["aeroway"~"aerodrome|terminal|helipad"]',
  '["tourism"~"museum|gallery|hotel|motel|hostel"]'
 ];
 async function groupNearby(filter,r,lat,lng){const q=`[out:json][timeout:8];nwr${filter}(around:${r},${lat},${lng});out center tags;`;const data=await query(q);return data.elements||[];}
 X.nearby=async(lat,lng,radiusMeters=10000)=>{
  const r=Math.min(Math.max(Number(radiusMeters)||10000,1500),10000),latN=Number(lat),lngN=Number(lng);
  const batches=groups.map(g=>groupNearby(g,r,latN,lngN));
  const settled=await Promise.allSettled(batches);
  const seen=new Set(),out=[];
  settled.forEach(result=>{if(result.status!=='fulfilled')return;(result.value||[]).forEach(e=>{const p=mapEl(e,Number(e.lat??e.center?.lat),Number(e.lon??e.center?.lon));if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng))return;const key=(p.name||'').toLowerCase()+'|'+p.lat.toFixed(4)+'|'+p.lng.toFixed(4)+'|'+p.segment;if(seen.has(key))return;seen.add(key);p.distance_miles=hav(latN,lngN,p.lat,p.lng);out.push(p)})});
  return out.sort((a,b)=>a.distance_miles-b.distance_miles).slice(0,5000);
 };
})();