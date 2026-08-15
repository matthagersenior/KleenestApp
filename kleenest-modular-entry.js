/* Authoritative modular bootstrap. Maps preloads immediately; shell remains independent. */
(function(){'use strict';
 if(window.__KLEENEST_MODULAR_ENTRY_STARTED)return;
 window.__KLEENEST_MODULAR_ENTRY_STARTED=true;
 const load=(src)=>new Promise((resolve,reject)=>{const existing=document.querySelector('script[data-kleenest-bootstrap="'+src+'"]');if(existing){if(existing.readyState==='complete')return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return;}const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute('data-kleenest-bootstrap',src);s.onload=resolve;s.onerror=()=>reject(Error('Unable to load '+src));document.head.appendChild(s);});
 // Maps starts immediately. Cache/GPS hydrate first, then full discovery runs in the background.
 Promise.resolve().then(()=>load('kleenest-map-session.js?session=4')).then(()=>load('kleenest-map-preloader.js?preload=14')).then(()=>window.KleenestMapPreloader?.load?.()).catch(e=>console.warn('[Kleenest] eager Maps preload deferred',e));
 // The shell must never wait for Maps/GPS/network work.
 load('kleenest-app-shell.js?modular=20260815-shell35').catch(e=>{console.error('[Kleenest] shell bootstrap failed',e);const root=document.getElementById('modular-root');if(root)root.innerHTML='<div class="card" style="border-color:#c1503f"><b>Kleenest could not initialize.</b><p>Please refresh and try again.</p></div>';});
})();