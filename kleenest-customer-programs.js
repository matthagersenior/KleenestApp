/* Customer program eligibility — Premium/Fleet/Enterprise share one benefit model. */
(function(){
 'use strict';
 const ELIGIBLE=new Set(['premium','fleet','enterprise']);
 function tier(user){return String(user?.subscription_tier||user?.subscriptionTier||'').toLowerCase();}
 function canParticipate(user){return ELIGIBLE.has(tier(user));}
 function describe(user){
  const t=tier(user);
  return {eligible:ELIGIBLE.has(t),tier:t||null,label:t==='fleet'?'Fleet':t==='enterprise'?'Enterprise':t==='premium'?'Premium':'Standard'};
 }
 window.kleenestCustomerPrograms={canParticipate,describe,eligibleTiers:Array.from(ELIGIBLE)};
})();
