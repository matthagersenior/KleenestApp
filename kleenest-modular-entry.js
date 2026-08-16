/* Modular bootstrap. Authentication dependencies must exist before the authoritative shell starts. */
(function(){'use strict';
 const load=(src)=>new Promise((resolve,reject)=>{if(document.querySelector('script[src="'+src+'"]'))return resolve();const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load '+src));document.head.appendChild(s);});
 (async function(){
  try{
   if(!window.KleenestSupabase)await load('kleenest-supabase.js');
   if(!window.KleenestAuthUI)await load('kleenest-auth-ui.js');
   if(!window.KleenestAuthBridge)await load('kleenest-auth-bridge.js');
   await load('kleenest-progression-challenges-bridge.js');
   if(window.KleenestAppShell?.render){window.KleenestAppShell.render();return;}
   await load('kleenest-app-shell.js');
  }catch(e){console.error('[Kleenest] modular bootstrap failed',e);const root=document.getElementById('modular-root');if(root)root.innerHTML='<div class="card"><h2>Unable to start Kleenest</h2><p>Please refresh and try again.</p></div>';}
 })();
})();
