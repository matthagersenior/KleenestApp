/* Modular entry v62: shell-first, canonical feature modules, resilient optional startup. */
(function(g){'use strict';
if(g.__KLEENEST_MODULAR_ENTRY_V62__)return;
g.__KLEENEST_MODULAR_ENTRY_V62__=true;
g.__KLEENEST_MODULAR_ENTRYPOINT__={branch:'refactor/monolith-removal',runtime:'modular',version:'62'};
const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(Error('Unable to load '+src));document.head.appendChild(s)});
const businessModules=['kleenest-business.js?business=v7','kleenest-business-analytics.js?business-analytics=v7','kleenest-business-state.js?business-state=v7','kleenest-business-management.js?business-management=v7','kleenest-business-actions.js?business-actions=v7','kleenest-business-action-dispatcher.js?business-dispatcher=v7','kleenest-business-render.js?business-render=v7','kleenest-business-ui.js?business-ui=v7','kleenest-business-workspace.js?business-workspace=legacy-v9','kleenest-business-workspace-v10.js?business-workspace=canonical-v10','kleenest-business-dashboard.js?business-dashboard=v7'];
let businessLoad=null;
g.KleenestFeatureLoaders={loadBusiness:()=>{if(businessLoad)return businessLoad;businessLoad=businessModules.reduce((p,src)=>p.then(()=>load(src)),Promise.resolve()).catch(e=>{businessLoad=null;throw e});return businessLoad}};
load('kleenest-app-shell-v48.js?shell=v79-'+Date.now()).then(()=>{
 const optional=['kleenest-map-preloader.js?preload=62','kleenest-auth-ui.js?auth=v20-'+Date.now(),'kleenest-supabase-runtime.js?runtime=v8','kleenest-premium-gate.js?premium=v17-'+Date.now(),'kleenest-maps-leaflet-bootstrap-v1.js?leaflet=v6','kleenest-maps-canonical-v7.js?maps=canonical-v7-62','kleenest-business-feature-loader.js?business-features=complete-v8'];
 return optional.reduce((p,src)=>p.then(()=>load(src).catch(e=>{console.warn('[Kleenest] optional module failed:',src,e);return null})),Promise.resolve());
}).catch(e=>{console.error('[Kleenest] app shell failed',e);const r=document.getElementById('modular-root');if(r)r.innerHTML='<div class="card"><h1>Kleenest</h1><p class="muted">The application shell could not initialize.</p></div>'});
})(window);