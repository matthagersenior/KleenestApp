/* Bridges the legacy monolith's data-claim-partner action to server-authoritative eligibility. */
(function(){'use strict';
 const getDb=()=>{try{return JSON.parse(localStorage.getItem('kleenest-db-v11')||'{}');}catch(_){return{};}};
 function current(){const db=getDb();return db.session?((db.users||[]).find(u=>u.id===db.session)||null):null;}
 async function authorize(locationId){
  const db=getDb(), r=(db.restrooms||[]).find(x=>x.id===locationId), c=window.kleenestSupabase;
  if(!r||!c?.rpc)return {eligible:false,reason:'server_authorization_unavailable'};
  const {data,error}=await c.rpc('can_activate_preferred_location_identity',{p_name:r.name,p_address:r.address||null,p_latitude:r.lat||null,p_longitude:r.lng||null});
  if(error)return {eligible:false,reason:'server_authorization_failed'};
  return data?.[0]||data||{eligible:false,reason:'not_eligible'};
 }
 async function claim(e){
  const button=e.target.closest('[data-claim-partner]');if(!button)return;
  e.preventDefault();e.stopImmediatePropagation();
  const user=current();if(!user){alert('Log in first.');return;}
  button.disabled=true;
  try{
   const result=await authorize(button.dataset.claimPartner);
   if(!result.eligible){alert('Preferred Location is only available through an active business partner benefit for this location.');return;}
   const visit=window.kleenestPreferredVisit;
   if(!visit?.activate){alert('Preferred Location service is unavailable.');return;}
   const db=getDb(), r=(db.restrooms||[]).find(x=>x.id===button.dataset.claimPartner);
   const out=await visit.activate(user,{...r,id:result.location_id,partnerProgramId:result.partner_program_id,partnerProgram:{name:result.program_name}});
   if(!out?.ok){alert(out?.reason||'Preferred Location could not be activated.');return;}
   alert('✓ Preferred Location activated.');
  }finally{button.disabled=false;}
 }
 document.addEventListener('click',claim,true);
})();
