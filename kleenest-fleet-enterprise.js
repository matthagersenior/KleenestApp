/* Fleet / Enterprise program policy bridge. Keeps tier policy centralized. */
(function(){'use strict';
 const TIERS=new Set(['premium','fleet','enterprise']);
 function eligibleTier(user){const tier=String(user?.subscription_tier||user?.subscriptionLevel||'').toLowerCase();return TIERS.has(tier);}
 async function eligible(locationId){
  const scope=window.kleenestProgramScope;if(!scope?.eligible)return {eligible:false,reason:'scope_unavailable'};
  return scope.eligible(locationId);
 }
 window.kleenestFleetEnterprise={eligibleTier,eligibleLocation:eligible,tiers:Array.from(TIERS)};
})();
