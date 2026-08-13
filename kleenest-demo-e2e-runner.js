/* Explicit end-to-end demo runner. Requires real authenticated demo identities and existing test records. */
(function(){'use strict';
 async function run(opts){
  const out={steps:[],ok:false};
  const fail=e=>{out.steps.push({step:'error',ok:false,error:e?.message||String(e)});return out;};
  try{
   if(!window.kleenestDemoOrchestrator)throw new Error('demo orchestrator unavailable');
   const u=await window.kleenestDemoOrchestrator.currentUser();out.steps.push({step:'authenticated',ok:true,userId:u.id});
   if(opts?.demoKey){await window.kleenestDemoOrchestrator.linkDemo(opts.demoKey);out.steps.push({step:'identity_linked',ok:true,key:opts.demoKey});}
   if(opts?.businessName){const id=await window.kleenestDemoOrchestrator.provisionBusiness(opts.businessName);out.steps.push({step:'business_provisioned',ok:true,businessId:id});}
   if(opts?.locationId&&window.kleenestDemoAcceptance){const r=await window.kleenestDemoAcceptance.check(opts.locationId);out.steps.push({step:'preferred_eligibility',ok:true,result:r});}
   out.ok=out.steps.every(s=>s.ok!==false);return out;
  }catch(e){return fail(e);}
 }
 window.kleenestDemoE2E={run};
})();
