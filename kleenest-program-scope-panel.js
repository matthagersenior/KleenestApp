/* Business UI for explicitly assigning locations to a benefit program. */
(function(){'use strict';
 async function add(programId,locationId){return window.kleenestProgramScope.addLocation(programId,locationId);}
 async function remove(programId,locationId){return window.kleenestProgramScope.removeLocation(programId,locationId);}
 function bind(container){
  if(!container)return;
  container.addEventListener('click',async e=>{
   const b=e.target.closest('[data-benefit-scope-action]');if(!b)return;
   b.disabled=true;
   try{
    const action=b.dataset.benefitScopeAction, program=b.dataset.programId, location=b.dataset.locationId;
    if(action==='add')await add(program,location);else if(action==='remove')await remove(program,location);
    b.dispatchEvent(new CustomEvent('kleenest:benefit-scope-changed',{bubbles:true}));
   }catch(err){console.warn('[Kleenest] benefit scope update failed',err);b.disabled=false;}
  });
 }
 window.kleenestProgramScopePanel={bind,add,remove};
})();
