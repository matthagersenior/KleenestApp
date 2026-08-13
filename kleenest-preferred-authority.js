/* Preferred Location — server-authoritative eligibility and activation. */
(function(){
 'use strict';
 const tiers=['Premium','Fleet','Enterprise','premium','fleet','enterprise'];
 async function check(locationId){
  const c=window.kleenestSupabase;
  if(!c||!locationId) return {eligible:false,reason:'missing_client_or_location'};
  try{
   const r=await c.rpc('can_activate_preferred_location',{p_location_id:locationId});
   if(r.error) throw r.error;
   const row=Array.isArray(r.data)?r.data[0]:r.data;
   return row||{eligible:false,reason:'no_authorization_response'};
  }catch(e){
   console.warn('[Kleenest] Preferred authority check failed:',e?.message||e);
   return {eligible:false,reason:'authorization_unavailable'};
  }
 }
 async function activate(locationId,programId){
  const auth=await check(locationId);
  if(!auth.eligible) return auth;
  const c=window.kleenestSupabase;
  const r=await c.rpc('activate_preferred_location',{p_location_id:locationId,p_partner_program_id:programId||auth.partner_program_id||null});
  if(r.error) throw r.error;
  return r.data;
 }
 window.kleenestPreferredAuthority={check,activate,eligibleTiers:tiers};
})();
