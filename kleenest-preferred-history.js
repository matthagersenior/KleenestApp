/* User Preferred Location history/benefit bridge. */
(function(){
 'use strict';
 async function load(){
  const c=window.kleenestSupabase;if(!c)return [];
  const {data,error}=await c.from('preferred_location_activations').select('id,location_id,partner_program_id,activated_at,deactivated_at,last_used_at,use_count').order('activated_at',{ascending:false});
  if(error){console.warn('[Kleenest] preferred history unavailable',error.message);return [];} return data||[];
 }
 window.kleenestPreferredHistory={load};
})();
