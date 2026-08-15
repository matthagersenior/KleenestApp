/* Authoritative modular bootstrap. Maps warms immediately; shell remains independent. */
(function(){'use strict';
 if(window.__KLEENEST_MODULAR_ENTRY_STARTED)return;
 window.__KLEENEST_MODULAR_ENTRY_STARTED=true;
 const load=(src)=>new Promise((resolve,reject)=>{const existing=document.querySelector('script[data-kleenest-bootstrap="'+src+'"]');if(existing){if(existing.readyState==='complete')return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return;}const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute('data-kleenest-bootstrap',src);s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});
 load('kleenest-map-session.js?session=6').then(()=>load('kleenest-map-preloader.js?preload=16')).then(()=>window.KleenestMapPreloader?.load?.()).catch(e=>console.warn('[Kleenest] eager Maps preload deferred',e));
 load('kleenest-app-shell.js?modular=20260815-shell37').catch(e=>{console.error('[Kleenest] shell bootstrap failed',e);const root=document.getElementById('modular-root');if(root)root.innerHTML='<div class="card" style="border-color:#c1503f"><b>Kleenest could not initialize.</b><p>Please refresh and try again.</p></div>';});
})();