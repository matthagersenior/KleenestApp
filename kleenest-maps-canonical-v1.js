/* Kleenest canonical Maps runtime v4. Public-result-safe selection/hydration. */
(function(g){'use strict';if(g.__KLEENEST_CANONICAL_MAPS_V4__)return;g.__KLEENEST_CANONICAL_MAPS_V4__=true;
const old=g.KleenestCanonicalMaps;const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuid(v){return UUID.test(String(v||''))}
/* Wrap the existing canonical mount without allowing an unhandled selection/hydration exception to freeze the shell. */
if(old?.mount){g.KleenestCanonicalMaps={version:'canonical-v4',mount:async function(root){try{return await old.mount(root)}catch(e){console.error('[Kleenest Maps] mount error',e);root.innerHTML='<div style="padding:16px"><strong>Maps temporarily unavailable.</strong><p>Please reopen Maps.</p></div>';}}};}
/* Public-search records are allowed to be non-UUID keyed; expose a safe resolver for the canonical renderer. */
g.KleenestMapsIdentity={version:'v4',isSupabaseLocationId:isUuid,resolveId:function(x){if(!x)return null;if(isUuid(x.id))return {mode:'supabase',id:x.id};if(x.location_id&&isUuid(x.location_id))return {mode:'supabase',id:x.location_id};if(x.source_external_id)return {mode:'external',id:String(x.source_external_id)};if(x.osm_id)return {mode:'external',id:String(x.osm_id)};return {mode:'local',id:String(x.id||'')};}};
})(window);