/* Deterministic acceptance helpers for the demo -> production bridge. */
(function(){'use strict';
 async function check(locationId){
  if(!window.kleenestProgramScope?.eligible)return {ok:false,reason:'eligibility_dependency_missing'};
  const result=await window.kleenestProgramScope.eligible(locationId);
  const row=Array.isArray(result)?result[0]:result;
  return {ok:true,eligible:!!row?.eligible,reason:row?.reason||'unknown',programId:row?.partner_program_id||null,locationId};
 }
 window.kleenestDemoAcceptance={check};
})();
