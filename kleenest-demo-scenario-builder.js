/* Demo scenario builder. Server authorization remains authoritative. */
(function(){'use strict';
 async function rpc(name,params){const c=window.kleenestSupabase;if(!c)throw new Error('Supabase unavailable');const r=await c.rpc(name,params||{});if(r.error)throw r.error;return r.data;}
 async function create(opts){
  const p=await rpc('demo_create_program',{p_business_id:opts.businessId,p_name:opts.programName||'Demo Preferred Program',p_preferred_access:opts.preferredAccess!==false});
  const agreement=await rpc('demo_create_partnership',{p_program_id:p,p_partner_business_id:opts.partnerBusinessId});
  const membership=opts.userId?await rpc('demo_add_test_membership',{p_program_id:p,p_user_id:opts.userId}):null;
  return {programId:p,agreementId:agreement,membershipId:membership};
 }
 window.kleenestDemoScenarioBuilder={create};
})();
