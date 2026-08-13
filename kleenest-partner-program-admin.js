/* Business partner-program administration bridge. */
(function(){
 'use strict';
 async function rpc(name,params){
  const c=window.kleenestSupabase;if(!c) throw new Error('Supabase client unavailable');
  const r=await c.rpc(name,params||{});if(r.error) throw r.error;return r.data;
 }
 window.kleenestPartnerPrograms={
  list:()=>rpc('business_list_partner_programs'),
  create:(name,partnerBusinessId)=>rpc('business_create_partner_program',{p_name:name,p_partner_business_id:partnerBusinessId}),
  setAccess:(programId,enabled)=>rpc('business_set_partner_program_access',{p_partner_program_id:programId,p_preferred_access:enabled}),
  addMember:(programId,userId)=>rpc('business_add_program_member',{p_partner_program_id:programId,p_user_id:userId}),
  revokeMember:(programId,userId)=>rpc('business_revoke_program_member',{p_partner_program_id:programId,p_user_id:userId})
 };
})();
