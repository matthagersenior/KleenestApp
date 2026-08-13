/* Partner membership bridge. Server-side functions remain authoritative. */
(function(){'use strict';
 async function join(programId){if(!window.KleenestSupabase?.client)throw new Error('Supabase is not ready.');const {data,error}=await window.KleenestSupabase.client().rpc('join_partner_program',{p_program_id:programId});if(error)throw error;return data;}
 async function accept(agreementId){if(!window.KleenestSupabase?.client)throw new Error('Supabase is not ready.');const {data,error}=await window.KleenestSupabase.client().rpc('accept_partner_agreement',{p_agreement_id:agreementId});if(error)throw error;return data;}
 async function list(){if(!window.KleenestSupabase?.client)throw new Error('Supabase is not ready.');const {data,error}=await window.KleenestSupabase.client().rpc('list_my_partner_memberships');if(error)throw error;return data||[];}
 window.kleenestPartnerMemberships={join,accept,list};
})();
