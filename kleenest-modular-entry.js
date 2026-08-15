/* Authoritative modular bootstrap. The modular shell must always start; Maps warmup is non-blocking. */
(function(){'use strict';
 if(window.__KLEENEST_MODULAR_ENTRY_STARTED)return;
 window.__KLEENEST_MODULAR_ENTRY_STARTED=true;
 const load=(src)=>new Promise((resolve,reject)=>{const existing=document.querySelector('script[data-kleenest-bootstrap="'+src+'"]');if(existing){if(existing.readyState==='complete')return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return;}const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute('data-kleenest-bootstrap',src);s.onload=resolve;s.onerror=()=>reject(Error('Unable to load '+src));document.head.appendChild(s);});
 // Shell first. Nothing related to GPS, OSM, Overpass, Supabase or Maps is allowed to block navigation/auth.
 load('kleenest-app-shell.js?modular=20260815-shell33').catch(e=>{console.error('[Kleenest] shell bootstrap failed',e);const root=document.getElementById('modular-root');if(root)root.innerHTML='<div class="card" style="border-color:#c1503f"><b>Kleenest could not initialize.</b><p>Please refresh and try again.</p></div>';});
 // Maps session/cache warmup is deliberately detached from shell startup.
 Promise.resolve().then(()=>load('kleenest-map-session.js?session=2')).then(()=>load('kleenest-map-preloader.js?preload=12')).then(()=>window.KleenestMapPreloader?.load?.()).catch(e=>console.warn('[Kleenest] Maps warmup deferred',e));
})();