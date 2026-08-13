/* Business-to-business partner agreement workflow. */
(function(){'use strict';
 async function rpc(name,params){const c=window.kleenestSupabase;if(!c)throw new Error('Supabase client unavailable');const r=await c.rpc(name,params||{});if(r.error)throw r.error;return r.data;}
 window.kleenestPartnerAgreements={
  request:(programId,partnerBusinessId)=>rpc('business_request_partner_agreement',{p_partner_program_id:programId,p_partner_business_id:partnerBusinessId}),
  accept:agreementId=>rpc('business_accept_partner_agreement',{p_agreement_id:agreementId})
 };
})();
