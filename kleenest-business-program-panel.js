/* Business Program Panel — minimal dependency-free UI bridge. */
(function(){
 'use strict';
 async function render(container){
  if(!container||!window.kleenestPartnerPrograms) return;
  container.textContent='Loading partner programs…';
  try{
   const programs=await window.kleenestPartnerPrograms.list();
   container.innerHTML='<div class="business-program-panel"><h3>Benefit Programs</h3><div data-program-list></div></div>';
   const list=container.querySelector('[data-program-list]');
   if(!programs||!programs.length){list.textContent='No benefit programs yet.';return;}
   programs.forEach(p=>{
    const row=document.createElement('div'); row.className='program-row';
    row.innerHTML='<strong></strong><span></span><button type="button">Toggle Preferred Access</button>';
    row.querySelector('strong').textContent=p.name||'Unnamed program';
    row.querySelector('span').textContent=p.preferred_access?' Preferred access enabled':' Preferred access disabled';
    row.querySelector('button').onclick=async()=>{row.querySelector('button').disabled=true;await window.kleenestPartnerPrograms.setAccess(p.id,!p.preferred_access);render(container);};
    list.appendChild(row);
   });
  }catch(e){container.textContent='Unable to load benefit programs.';console.warn(e);}
 }
 window.kleenestRenderBusinessProgramPanel=render;
})();
