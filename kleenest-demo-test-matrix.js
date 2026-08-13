/* Deterministic demo authorization test matrix. Executes only when explicitly called. */
(function(){'use strict';
 async function eligibility(locationId){
  const r=await window.kleenestProgramScope.eligible(locationId);const x=Array.isArray(r)?r[0]:r;return {eligible:!!x?.eligible,reason:x?.reason||null,programId:x?.partner_program_id||null};
 }
 async function run(cases){
  const results=[];
  for(const c of cases||[]){try{const actual=await eligibility(c.locationId);results.push({...c,actual,pass:actual.eligible===!!c.expectedEligible});}catch(e){results.push({...c,actual:{error:e?.message||String(e)},pass:false});}}
  return {ok:results.every(x=>x.pass),results};
 }
 window.kleenestDemoTestMatrix={run};
})();
