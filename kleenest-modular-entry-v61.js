/* Modular entry v61: render the app shell immediately; hydrate feature dependencies asynchronously. */
(function(g){'use strict';
if(g.__KLEENEST_MODULAR_ENTRY_V61__)return;
g.__KLEENEST_MODULAR_ENTRY_V61__=true;
g.__KLEENEST_MODULAR_ENTRYPOINT__={branch:'refactor/monolith-removal',runtime:'modular',version:'61'};
const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(Error('Unable to load '+src));document.head.appendChild(s)});
const businessModules=['kleenest-business.js?business=v6','kleenest-business-analytics.js?business-analytics=v6','kleenest-business-state.js?business-state=v6','kleenest-business-management.js?business-management=v6','kleenest-business-actions.js?business-actions=v6','kleenest-business-action-dispatcher.js?business-dispatcher=v6','kleenest-business-render.js?business-render=v6','kleenest-business-ui.js?business-ui=v6','kleenest-business-workspace.js?business-workspace=v5','kleenest-business-dashboard.js?business-dashboard=v6'];
let businessLoad=null;
g.KleenestFeatureLoaders={loadBusiness:()=>{if(businessLoad)return businessLoad;businessLoad=businessModules.reduce((p,src)=>p.then(()=>load(src)),Promise.resolve()).catch(e=>{businessLoad=null;throw e});return businessLoad}};
/* The shell is intentionally first. A failed optional dependency must never prevent the app chrome from rendering. */
load('kleenest-app-shell-v48.js?shell=v78-'+Date.now()).then(()=>{
  const optional=[
    'kleenest-map-preloader.js?preload=61',
    'kleenest-auth-ui.js?auth=v19-'+Date.now(),
    'kleenest-supabase-runtime.js?runtime=v7',
    'kleenest-premium-gate.js?premium=v16-'+Date.now(),
    'kleenest-maps-leaflet-bootstrap-v1.js?leaflet=v5',
    'kleenest-maps-canonical-v7.js?maps=canonical-v7-61',
    'kleenest-business-feature-loader.js?business-features=complete-v7'
  ];
  return optional.reduce((p,src)=>p.then(()=>load(src).catch(e=>{console.warn('[Kleenest] optional module failed:',src,e);return null})),Promise.resolve());
}).catch(e=>{
  console.error('[Kleenest] app shell failed',e);
  const r=document.getElementById('modular-root');
  if(r)r.innerHTML='<div class="card"><h1>Kleenest</h1><p class="muted">The application shell could not initialize.</p></div>';
});
})(window);