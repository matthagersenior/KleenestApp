/* Authoritative modular bootstrap. Warm persistent Maps data before the shell. */
(function(){'use strict';
 if(window.__KLEENEST_MODULAR_ENTRY_STARTED)return;
 window.__KLEENEST_MODULAR_ENTRY_STARTED=true;
 const load=(src)=>new Promise((resolve,reject)=>{const existing=document.querySelector('script[data-kleenest-bootstrap="'+src+'"]');if(existing){if(existing.readyState==='complete')return resolve();return existing.addEventListener('load',resolve,{once:true});}const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute('data-kleenest-bootstrap',src);s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});
 Promise.resolve().then(()=>load('kleenest-map-preloader.js?preload=10')).then(()=>window.KleenestMapPreloader?.load?.()).catch(e=>console.warn('[Kleenest] Maps warmup deferred',e)).finally(()=>load('kleenest-app-shell.js?modular=20260815-shell30').catch(e=>{console.error('[Kleenest] shell bootstrap failed',e);const root=document.getElementById('modular-root');if(root)root.innerHTML='<div class="card" style="border-color:#c1503f"><b>Kleenest could not initialize.</b><p>Please refresh and try again.</p></div>';}));
})();