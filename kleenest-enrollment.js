/* Fleet / Enterprise enrollment bridge. */
(function(){'use strict';
 async function rpc(name,params){const c=window.kleenestSupabase;if(!c)throw new Error('Supabase client unavailable');const r=await c.rpc(name,params||{});if(r.error)throw r.error;return r.data;}
 window.kleenestEnrollment={
  enroll:(programId,userId)=>rpc('business_enroll_program_user',{p_partner_program_id:programId,p_user_id:userId}),
  revoke:(programId,userId)=>rpc('business_revoke_program_member',{p_partner_program_id:programId,p_user_id:userId}),
  eligible:locationId=>rpc('can_activate_preferred_location',{p_location_id:locationId})
 };
})();
