/* Authoritative local-location -> Supabase identity resolver. */
(function(){'use strict';
 async function resolve(local){
  const c=window.kleenestSupabase;
  if(!c||!local)return {ok:false,reason:'unavailable'};
  const r=await c.rpc('resolve_location_identity',{p_name:local.name||local.title||null,p_address:local.address||null,p_latitude:Number.isFinite(+local.lat)?+local.lat:null,p_longitude:Number.isFinite(+local.lng)?+local.lng:null});
  if(r.error)throw r.error;
  const row=Array.isArray(r.data)?r.data[0]:r.data;
  return row?{ok:true,...row}:{ok:false,reason:'not_found'};
 }
 window.kleenestLocationIdentity={resolve};
})();
