/* Authoritative modular bootstrap. Never loads the legacy monolith. */
(function(){'use strict';
if(window.__KLEENEST_MODULAR_ENTRY_STARTED)return;
window.__KLEENEST_MODULAR_ENTRY_STARTED=true;
window.__KLEENEST_RUNTIME_INFO__={branch:'refactor/monolith-removal',runtime:'modular',startedAt:Date.now()};
const load=(src)=>new Promise((resolve,reject)=>{const existing=document.querySelector('script[data-kleenest-bootstrap="'+src+'"]');if(existing){if(existing.readyState==='complete')return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return;}const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute('data-kleenest-bootstrap',src);s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});
load('kleenest-map-session.js?session=8').then(()=>load('kleenest-map-preloader.js?preload=25')).then(()=>load('kleenest-map-controls.js?controls=3')).then(()=>window.KleenestMapPreloader?.load?.()).catch(e=>console.warn('[Kleenest] eager Maps preload deferred',e));
load('kleenest-app-shell.js?modular=20260815-shell39').then(()=>load('kleenest-map-navigation-guard.js?guard=2')).catch(e=>{console.error('[Kleenest] modular shell bootstrap failed',e);const root=document.getElementById('modular-root');if(root)root.innerHTML='<div class="card" style="border-color:#c1503f"><b>Kleenest modular runtime could not initialize.</b><p>Runtime: refactor/monolith-removal</p><p>Please refresh and try again.</p></div>';});
})();