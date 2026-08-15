/* Authoritative modular bootstrap: auth dependencies load before the shell so Sign In / Sign Up is functional. */
(function(){'use strict';
 const load=(src)=>new Promise((resolve,reject)=>{if(document.querySelector('script[src="'+src+'"]'))return resolve();const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});
 async function boot(){
  try{
   await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
   await load('kleenest-supabase.js');
   await load('kleenest-auth-ui.js');
   await load('kleenest-auth-bridge.js');
   await load('kleenest-app-shell.js');
  }catch(e){console.error('[Kleenest] modular bootstrap failed',e);const root=document.getElementById('modular-root');if(root)root.insertAdjacentHTML('afterbegin','<div class="card" style="border-color:#c1503f"><b>Authentication could not be initialized.</b><p>Please refresh and try again.</p></div>');}
 }
 boot();
})();