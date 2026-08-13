/* Preferred benefit UI: visible benefit for eligible users, hidden otherwise. */
(function(){
 'use strict';
 function render(container,user,location){
   if(!container) return;
   const access=window.kleenestPreferredAccess;
   const ok=!!(access&&access.eligible&&access.eligible(user,location));
   if(!ok){ container.hidden=true; container.innerHTML=''; return; }
   const program=location&&location.partnerProgram||{};
   container.hidden=false;
   container.innerHTML='<div class="preferred-benefit-card"><strong>Preferred Location</strong><div>'+
     (program.name?('Available through '+program.name+'.'):'Available through your business benefit program.')+
     '</div><button type="button" data-preferred-activate>Activate Preferred Location</button></div>';
   const button=container.querySelector('[data-preferred-activate]');
   button.addEventListener('click',async()=>{
     button.disabled=true;
     const result=await window.kleenestPreferredVisit.activate(user,location);
     button.disabled=false;
     if(!result.ok){ alert('This Preferred Location is not available through your active business benefit.'); return; }
     button.textContent='Preferred Location Active';
   });
 }
 window.kleenestRenderPreferredBenefit=render;
})();
