/* Single client entry point for Preferred eligibility, activation, and usage. */
(function(){'use strict';
 function client(){if(!window.KleenestSupabase?.client)throw new Error('Supabase is not ready.');return window.KleenestSupabase.client();}
 async function eligibility(locationId){const {data,error}=await client().rpc('check_preferred_eligibility',{p_location_id:locationId});if(error)throw error;return data;}
 async function activate(locationId,programId){const {data,error}=await client().rpc('activate_preferred_location',{p_location_id:locationId,p_partner_program_id:programId||null});if(error)throw error;return data;}
 async function use(locationId){const {data,error}=await client().rpc('record_preferred_location_use',{p_location_id:locationId});if(error)throw error;return data;}
 async function deactivate(locationId){const {data,error}=await client().rpc('deactivate_preferred_location',{p_location_id:locationId});if(error)throw error;return data;}
 window.kleenestPreferredAuthorization={eligibility,activate,use,deactivate};
})();
