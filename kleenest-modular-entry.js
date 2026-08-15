/* Minimal authoritative modular bootstrap. Heavy feature modules are lazy-loaded by the shell. */
(function(){'use strict';
 if(window.__KLEENEST_MODULAR_ENTRY_STARTED)return;
 window.__KLEENEST_MODULAR_ENTRY_STARTED=true;
 const load=(src)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.dataset.kleenestBootstrap=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});
 load('kleenest-app-shell.js?modular=20260815-shell22').catch(e=>{console.error('[Kleenest] shell bootstrap failed',e);const root=document.getElementById('modular-root');if(root)root.innerHTML='<div class="card" style="border-color:#c1503f"><b>Kleenest could not initialize.</b><p>Please refresh and try again.</p></div>';});
})();