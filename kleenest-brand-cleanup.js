/* Authoritative customer-facing Kleenest branding. This runs after other modules and prevents legacy branding from returning. */
(function(){'use strict';
 const TITLE='Kleenest — Find the Kleenest places nearby';
 const HOME='Find the Kleenest places nearby.';
 function apply(){
  if(document.title!==TITLE)document.title=TITLE;
  const root=document.getElementById('modular-root');
  if(!root)return;
  root.querySelectorAll('h1,h2,h3,.brand span,.brand b').forEach(el=>{
   if(el.textContent.trim()==='KKleenest')el.textContent='Kleenest';
   if(el.textContent.includes('Find the cleanest places'))el.textContent=el.textContent.replace(/Find the cleanest places/g,HOME.replace(/\.$/,''));
  });
 }
 function boot(){apply();new MutationObserver(()=>apply()).observe(document.body,{childList:true,subtree:true,characterData:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();