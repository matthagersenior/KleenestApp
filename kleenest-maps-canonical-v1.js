/* Kleenest canonical Maps runtime v3. Hardened selection/hydration for sparse public OSM records. */
(function(g){'use strict';if(g.__KLEENEST_CANONICAL_MAPS_V3__)return;g.__KLEENEST_CANONICAL_MAPS_V3__=true;
/* v3 deliberately preserves the v2 UI contract while making every public/OSM result safe to select. */
const previous=g.KleenestCanonicalMaps;
function safe(fn,fallback){try{const v=fn();return v??fallback}catch(e){console.warn('[Kleenest Maps] safe operation failed',e);return fallback}}
if(previous?.mount){g.KleenestCanonicalMaps={version:'canonical-v3',mount:async function(root){try{return await previous.mount(root)}catch(e){console.error('[Kleenest Maps] mount failed',e);root.innerHTML='<div style="padding:16px">Map could not be loaded. Please try again.</div>';}}};}
/* Normalize common OSM/search shapes before the v2 renderer sees them. */
const oldCache=g.KleenestMapCache;if(oldCache?.locations)oldCache.locations=oldCache.locations.map((x,i)=>{const t=x?.source_metadata?.tags||x?.source_metadata?.osm?.tags||{};return {...x,id:x.id||x.location_id||x.source_external_id||'location-'+i,name:x.name||t.name||t.brand||t.operator||'Public Location',lat:Number(x.lat??x.latitude??x.geometry?.lat),lng:Number(x.lng??x.longitude??x.lon??x.geometry?.lon),source_metadata:x.source_metadata||{tags:t}}});
})(window);