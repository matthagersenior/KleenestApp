/* Lightweight production acceptance checks. Safe to load; exposes diagnostics only. */
(function(){'use strict';
 window.kleenestAcceptance={
  dependencies(){return {
   supabase:!!window.kleenestSupabase,
   preferredAccess:!!window.kleenestPreferredAccess,
   preferredVisit:!!window.kleenestPreferredVisit,
   visitTracking:!!window.kleenestVisitTracking,
   businessAnalytics:!!window.kleenestBusinessAnalytics,
   partnerPrograms:!!window.kleenestPartnerPrograms
  };},
  async preferredEligibility(user,location){
   if(!window.kleenestPreferredAccess?.eligible) return {ok:false,reason:'preferred_access_missing'};
   return {ok:!!window.kleenestPreferredAccess.eligible(user,location)};
  }
 };
})();
