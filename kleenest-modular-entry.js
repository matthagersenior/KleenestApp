/* Authoritative modular bootstrap. Warm Maps before the shell so navigation never rebuilds discovery from scratch. */
(function(){'use strict';
 if(window.__KLEENEST_MODULAR_ENTRY_STARTED)return;
 window.__KLEENEST_MODULAR_ENTRY_STARTED=true;
 const load=(src)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.setAttribute('data-kleenest-bootstrap',src);s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});
 Promise.resolve().then(()=>load('kleenest-map-cache.js?maps-cache=2')).then(()=>load('kleenest-map-preloader.js?preload=2')).then(()=>window.KleenestMapPreloader?.load?.()).catch(e=>console.warn('[Kleenest] Maps warmup deferred',e)).finally(()=>load('kleenest-app-shell.js?modular=20260815-shell25').catch(e=>{console.error('[Kleenest] shell bootstrap failed',e);const root=document.getElementById('modular-root');if(root)root.innerHTML='<div class="card" style="border-color:#c1503f"><b>Kleenest could not initialize.</b><p>Please refresh and try again.</p></div>';}));
})();