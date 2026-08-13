/* Demo partnership testing panel. Uses server-authorized RPCs only. */
(function(){'use strict';
 async function rpc(name,params){const c=window.kleenestSupabase;if(!c)throw new Error('Supabase unavailable');const r=await c.rpc(name,params||{});if(r.error)throw r.error;return r.data;}
 async function createProgram(businessId,name,preferred){return rpc('demo_create_program',{p_business_id:businessId,p_name:name,p_preferred_access:preferred!==false});}
 async function createPartnership(programId,partnerBusinessId){return rpc('demo_create_partnership',{p_program_id:programId,p_partner_business_id:partnerBusinessId});}
 async function addMember(programId,userId){return rpc('demo_add_test_membership',{p_program_id:programId,p_user_id:userId});}
 window.kleenestDemoPartnerships={createProgram,createPartnership,addMember};
})();
