/* Modular OSM/Overpass discovery. Broad nearby venue coverage, merged with Kleenest/Supabase data. */
(function(){'use strict';
 const X=window.KleenestMapExternalDiscovery=window.KleenestMapExternalDiscovery||{};
 const hav=(a,b,c,d)=>{const R=3958.7613,r=Math.PI/180,dl=(c-a)*r,dp=(d-b)*r,x=Math.sin(dl/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(dp/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));};
 async function query(q){for(const host of ['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter']){try{const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),18000);const res=await fetch(host+'?data='+encodeURIComponent(q),{headers:{Accept:'application/json'},signal:ctl.signal});clearTimeout(timer);if(!res.ok)continue;return await res.json()}catch(e){}}return {elements:[]};}
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
 function mapEl(el,lat,lng){const t=el.tags||{},[segment,label]=classify(t),name=t.name||t.brand||t.operator||label;const addr=[t['addr:housenumber'],t['addr:street'],t['addr:city']].filter(Boolean).join(' ');return{id:'osm-'+el.type+'-'+el.id,name,address:addr||'Nearby',lat,lng,place_type:segment,segment,source:'osm',restroomConfidence:segment==='toilets'?'confirmed':'possible',accessible:t.wheelchair==='yes'||t['toilets:wheelchair']==='yes',changing:t.changing_table==='yes'||t.diaper==='yes',amenities:segment==='toilets'?['Mapped restroom']:[],hours:t.opening_hours||'See venue hours',osmTags:t};}
 const groups=[
  '["amenity"~"toilets|fuel|restaurant|fast_food|cafe|bar|pub"]',
  '["amenity"~"library|post_office|school|college|university|kindergarten|place_of_worship|townhall|courthouse|police|fire_station|hospital|clinic|doctors|dentist"]',
  '["shop"~"supermarket|convenience|mall|department_store|bakery|pharmacy|clothes|books"]',
  '["leisure"~"park|nature_reserve|playground|sports_centre"]',
  '["railway"="station"]',
  '["public_transport"]',
  '["aeroway"~"aerodrome|terminal|helipad"]',
  '["building"~"church|chapel"]',
  '["amenity"~"bank|atm|cinema|theatre|community_centre|social_centre"]',
  '["tourism"~"museum|gallery|hotel|motel|hostel"]'
 ];
 X.nearby=async(lat,lng,radiusMeters=25000)=>{
  const queries=groups.map(g=>`[out:json][timeout:16];nwr${g}(around:${radiusMeters},${lat},${lng});out center tags;`);
  const results=await Promise.all(queries.map(query));
  const seen=new Set(),out=[];
  results.flatMap(d=>d.elements||[]).forEach(e=>{const p=mapEl(e,Number(e.lat??e.center?.lat),Number(e.lon??e.center?.lon));if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng))return;const key=(p.name||'').toLowerCase()+'|'+p.lat.toFixed(4)+'|'+p.lng.toFixed(4)+'|'+p.segment;if(seen.has(key))return;seen.add(key);p.distance_miles=hav(lat,lng,p.lat,p.lng);out.push(p)});
  return out.sort((a,b)=>a.distance_miles-b.distance_miles).slice(0,5000);
 };
})();