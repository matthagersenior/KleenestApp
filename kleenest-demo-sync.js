/* Demo/local -> Supabase resolver. Legacy ids (r1/r2/...) are NOT UUIDs and are
   never written into production locations. Sync is deliberately non-destructive. */
(function(){'use strict';
 async function resolve(local){
  const c=window.kleenestSupabase;if(!c||!local)return null;
  const address=local.address||local.location||null;
  const name=local.name||local.title||null;
  let q=c.from('locations').select('id,name,address,latitude,longitude,business_id').limit(1);
  if(address) q=q.eq('address',address); else if(name) q=q.ilike('name',name); else return null;
  const r=await q.maybeSingle();if(r.error)throw r.error;return r.data||null;
 }
 async function syncLocations(locations){
  if(!Array.isArray(locations))return {ok:false,reason:'invalid_locations'};
  const resolved=[];for(const local of locations){const row=await resolve(local);if(row)resolved.push({localId:local.id||null,location:row});}
  return {ok:true,count:resolved.length,unresolved:locations.length-resolved.length,locations:resolved};
 }
 window.kleenestDemoSync={syncLocations,resolve};
})();
