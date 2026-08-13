/* Program/location benefit-scope administration and user lookup. */
(function(){'use strict';
 async function rpc(name,params){const c=window.kleenestSupabase;if(!c)throw new Error('Supabase client unavailable');const r=await c.rpc(name,params||{});if(r.error)throw r.error;return r.data;}
 window.kleenestProgramScope={
  addLocation:(programId,locationId)=>rpc('business_add_program_location',{p_partner_program_id:programId,p_location_id:locationId}),
  removeLocation:(programId,locationId)=>rpc('business_remove_program_location',{p_partner_program_id:programId,p_location_id:locationId}),
  eligible:locationId=>rpc('can_activate_preferred_location',{p_location_id:locationId})
 };
})();
