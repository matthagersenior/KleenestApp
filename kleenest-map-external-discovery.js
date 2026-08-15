/* Modular OSM/Overpass discovery. Broad nearby venue coverage, merged with Kleenest/Supabase data. */
(function(){'use strict';
 const X=window.KleenestMapExternalDiscovery=window.KleenestMapExternalDiscovery||{};
 const hav=(a,b,c,d)=>{const R=3958.7613,r=Math.PI/180,dl=(c-a)*r,dp=(d-b)*r,x=Math.sin(dl/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(dp/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));};
 async function query(q){for(const host of ['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter']){try{const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),30000);const res=await fetch(host+'?data='+encodeURIComponent(q),{headers:{Accept:'application/json'},signal:ctl.signal});clearTimeout(timer);if(!res.ok)continue;return await res.json()}catch(e){}}throw Error('Nearby map discovery is temporarily unavailable')}
 function classify(t){
  if(t.amenity==='toilets'||t.toilets==='yes'||t['toilets:access']==='public')return ['toilets','Bathrooms'];
  if(t.amenity==='fuel'||t.highway==='services'||t.highway==='rest_area')return ['gas_station','Gas / Travel'];
  if(t.amenity==='restaurant'||t.amenity==='fast_food')return ['restaurant','Restaurants'];
  if(t.amenity==='cafe'||t.amenity==='bar'||t.amenity==='pub')return ['cafe','Cafes / Food'];
  if(['supermarket','convenience','mall','department_store','bakery','pharmacy','clothes','books'].includes(t.shop))return ['retail','Retail'];
  if(['hospital','clinic','doctors','dentist','pharmacy'].includes(t.amenity))return ['health','Health'];
  if(t.amenity==='library')return ['library','Libraries'];
  if(t.amenity==='post_office')return ['post_office','Post Offices'];
  if(t.amenity==='school'||t.amenity==='college'||t.amenity==='university'||t.amenity==='kindergarten')return ['education','Schools'];
  if(t.amenity==='place_of_worship'||t.building==='church'||t.building==='chapel'||t.religion)return ['worship','Churches / Worship'];
  if(t.aeroway==='aerodrome'||t.aeroway==='terminal')return ['airport','Airports'];
  if(t.aeroway==='helipad')return ['airport','Airports'];
  if(t.amenity==='townhall'||t.amenity==='courthouse'||t.office==='government'||t.amenity==='police'||t.amenity==='fire_station')return ['public','Public / Government'];
  if(t.leisure==='park'||t.leisure==='nature_reserve'||t.leisure==='playground'||t.leisure==='sports_centre')return ['park','Parks / Recreation'];
  if(t.railway==='station'||t.amenity==='bus_station'||t.public_transport==='station'||t.public_transport==='stop_position')return ['transit','Transit'];
  if(t.amenity==='bank'||t.amenity==='atm')return ['financial','Banks / ATMs'];
  if(t.amenity==='cinema'||t.amenity==='theatre'||t.tourism==='museum'||t.tourism==='gallery')return ['culture','Arts / Culture'];
  if(t.tourism==='hotel'||t.tourism==='motel'||t.tourism==='hostel')return ['lodging','Hotels / Lodging'];
  if(t.amenity==='community_centre'||t.amenity==='social_centre')return ['community','Community'];
  return ['other','Nearby Places'];
 }
 function mapEl(el,lat,lng){const t=el.tags||{},[segment,label]=classify(t),name=t.name||t.brand||t.operator||label;const addr=[t['addr:housenumber'],t['addr:street'],t['addr:city']].filter(Boolean).join(' ');return{id:'osm-'+el.type+'-'+el.id,name,address:addr||'Nearby',lat,lng,place_type:segment,segment,source:'osm',restroomConfidence:segment==='toilets'?'confirmed':'possible',accessible:t.wheelchair==='yes'||t['toilets:wheelchair']==='yes',changing:t.changing_table==='yes'||t.diaper==='yes',amenities:segment==='toilets'?['Mapped restroom']:[],hours:t.opening_hours||'See venue hours',osmTags:t};}
 X.nearby=async(lat,lng,radiusMeters=25000)=>{
  const q=`[out:json][timeout:30];(
  nwr["amenity"~"toilets|fuel|restaurant|fast_food|cafe|bar|pub|hospital|clinic|doctors|dentist|library|post_office|school|college|university|kindergarten|place_of_worship|townhall|courthouse|police|fire_station|bus_station|bank|atm|cinema|theatre|community_centre|social_centre"](around:${radiusMeters},${lat},${lng});
  nwr["shop"~"supermarket|convenience|mall|department_store|bakery|pharmacy|clothes|books"](around:${radiusMeters},${lat},${lng});
  nwr["leisure"~"park|nature_reserve|playground|sports_centre"](around:${radiusMeters},${lat},${lng});
  nwr["railway"="station"](around:${radiusMeters},${lat},${lng});
  nwr["public_transport"](around:${radiusMeters},${lat},${lng});
  nwr["aeroway"~"aerodrome|terminal|helipad"](around:${radiusMeters},${lat},${lng});
  nwr["building"~"church|chapel"](around:${radiusMeters},${lat},${lng});
  nwr["tourism"~"museum|gallery|hotel|motel|hostel"](around:${radiusMeters},${lat},${lng});
  );out center tags;`;
  const data=await query(q),seen=new Set(),out=[];(data.elements||[]).forEach(e=>{const p=mapEl(e,Number(e.lat??e.center?.lat),Number(e.lon??e.center?.lon));if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng))return;const key=(p.name||'').toLowerCase()+'|'+p.lat.toFixed(4)+'|'+p.lng.toFixed(4)+'|'+p.segment;if(seen.has(key))return;seen.add(key);p.distance_miles=hav(lat,lng,p.lat,p.lng);out.push(p)});return out.sort((a,b)=>a.distance_miles-b.distance_miles).slice(0,1000);
 };
})();