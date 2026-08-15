/* Authoritative customer-facing Kleenest branding. */
(function(){'use strict';
 const TITLE='Kleenest — Find the Kleenest places nearby';
 function apply(){
  document.title=TITLE;
  const root=document.getElementById('modular-root'); if(!root)return;
  root.querySelectorAll('.brand').forEach(el=>{el.textContent='Kleenest';});
  root.querySelectorAll('h1,h2,h3,h4,h5,h6,p,button,a,span,div').forEach(el=>{
   if(el.childElementCount!==0)return;
   const t=el.textContent||'';
   if(/KKleenest/.test(t))el.textContent=t.replace(/KKleenest/g,'Kleenest');
   if(/cleanest places/i.test(t))el.textContent=t.replace(/cleanest places/gi,'Kleenest places');
  });
 }
 function boot(){apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true,characterData:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();