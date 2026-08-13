/* Partnership bootstrap primitives. No synthetic partnerships are created automatically. */
(function(){'use strict';
 async function rpc(name,params){const c=window.kleenestSupabase;if(!c)throw new Error('Supabase client unavailable');const r=await c.rpc(name,params||{});if(r.error)throw r.error;return r.data;}
 window.kleenestPartnershipBootstrap={
  resolveLocation:(name,address,lat,lng)=>rpc('resolve_location_identity',{p_name:name,p_address:address,p_latitude:lat,p_longitude:lng}),
  listPrograms:()=>window.kleenestPartnerPrograms?.list?.()||[],
  addLocation:(programId,locationId)=>window.kleenestProgramScope?.addLocation(programId,locationId),
  enroll:(programId,userId)=>window.kleenestEnrollment?.enroll(programId,userId)
 };
})();
