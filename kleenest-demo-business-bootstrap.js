/* Explicit authenticated demo-business bootstrap. */
(function(){'use strict';
 async function rpc(name,params){const c=window.kleenestSupabase;if(!c)throw new Error('Supabase unavailable');const r=await c.rpc(name,params||{});if(r.error)throw r.error;return r.data;}
 window.kleenestDemoBusiness={
  create:(demoKey,name)=>rpc('demo_create_business',{p_demo_key:demoKey,p_name:name}),
  assignLocation:(programId,locationId)=>rpc('demo_assign_program_location',{p_program_id:programId,p_location_id:locationId})
 };
})();
