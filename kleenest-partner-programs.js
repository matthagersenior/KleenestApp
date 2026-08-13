/* Partner-program management bridge for business admins. */
(function(){'use strict';
 const client=()=>window.KleenestSupabase?.client?.();
 async function call(name,args){const c=client();if(!c)throw new Error('Supabase is not ready.');const {data,error}=await c.rpc(name,args||{});if(error)throw error;return data;}
 window.kleenestPartnerPrograms={
  create:(businessId,name,description='',preferredEnabled=true)=>call('create_demo_partner_program',{p_business_id:businessId,p_name:name,p_description:description,p_preferred_enabled:preferredEnabled}),
  createPartnership:(programId,partnerBusinessId,name)=>call('create_demo_partnership',{p_program_id:programId,p_partner_business_id:partnerBusinessId,p_name:name}),
  list:()=>call('list_my_demo_programs',{})
 };
})();
