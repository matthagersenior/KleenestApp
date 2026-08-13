/* Lightweight production acceptance checks. Diagnostics only; authorization stays server-side. */
(function(){'use strict';
 window.kleenestAcceptance={
  dependencies(){return {supabase:!!window.KleenestSupabase,preferredAccess:!!window.KleenestSupabase?.preferredEligibility,preferredActivation:!!window.KleenestSupabase?.activatePreferred,preferredVisit:!!window.KleenestSupabase?.usePreferred,visitTracking:!!window.KleenestSupabase?.verifyCheckin,businessAnalytics:!!window.kleenestBusinessAnalytics,partnerPrograms:!!window.kleenestBusinessAnalytics?.programUsage,authTouchFix:!!window.kleenestAuthModalTouchFix};},
  async preferredEligibility(locationId){if(!window.KleenestSupabase?.preferredEligibility)return {ok:false,reason:'preferred_access_missing'};try{return await window.KleenestSupabase.preferredEligibility(locationId);}catch(error){return {ok:false,reason:error?.message||'eligibility_check_failed'};}},
  async preferredAnalytics(){if(!window.kleenestBusinessAnalytics?.current)return {ok:false,reason:'analytics_missing'};try{return {ok:true,data:await window.kleenestBusinessAnalytics.current()};}catch(error){return {ok:false,reason:error?.message||'analytics_check_failed'};}}
 };
})();
