/* Demo/local -> Supabase synchronization bridge.
   Intentionally additive: it never deletes local demo data and only upserts records
   that have stable identifiers or can be resolved by exact location identity.
*/
(function(){'use strict';
 async function syncLocations(locations){
  const c=window.kleenestSupabase;
  if(!c||!Array.isArray(locations)) return {ok:false,reason:'unavailable'};
  const rows=locations.map(x=>({
   id:x.id,
   name:x.name||x.title||'Unnamed location',
   address:x.address||null,
   latitude:Number.isFinite(+x.lat)?+x.lat:null,
   longitude:Number.isFinite(+x.lng)?+x.lng:null
  })).filter(x=>x.id);
  if(!rows.length)return {ok:true,count:0};
  const r=await c.from('locations').upsert(rows,{onConflict:'id'});
  if(r.error)throw r.error;
  return {ok:true,count:rows.length};
 }
 async function resolve(local){
  const c=window.kleenestSupabase;if(!c||!local)return null;
  let q=c.from('locations').select('id,name,address,latitude,longitude,business_id').limit(1);
  if(local.id) q=q.eq('id',local.id); else if(local.address) q=q.eq('address',local.address); else return null;
  const r=await q.maybeSingle();if(r.error)throw r.error;return r.data||null;
 }
 window.kleenestDemoSync={syncLocations,resolve};
})();
