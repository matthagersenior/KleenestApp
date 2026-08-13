/* Explicit demo-seed helper. Never runs automatically. */
(function(){'use strict';
 async function seed(opts){
  opts=opts||{};
  const api=window.kleenestDemoPartnerships;if(!api)return {ok:false,reason:'demo_api_missing'};
  const out={programs:[],partnerships:[],memberships:[]};
  for(const p of opts.programs||[]){const id=await api.createProgram(p.businessId,p.name,p.preferredAccess!==false);out.programs.push(id);for(const b of p.partnerBusinesses||[])out.partnerships.push(await api.createPartnership(id,b));for(const u of p.userIds||[])out.memberships.push(await api.addMember(id,u));}
  return {ok:true,...out};
 }
 window.kleenestDemoSeed={seed};
})();
