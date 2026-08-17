/* Kleenest Maps Dashboard v3 — guarded adapter around the richer Maps dashboard.
 * The enhancer is deliberately isolated from Maps Core: a UI enhancement failure must
 * never be allowed to turn a working map into "Maps surface failed". */
(function(g){'use strict';
if(g.KleenestMapsDashboardRedesignV3)return;
function loadLegacy(){return new Promise(function(resolve){
  if(g.KleenestMapsDashboardRedesignV2?.enhance){resolve(g.KleenestMapsDashboardRedesignV2);return;}
  var s=document.createElement('script');
  s.src='kleenest-maps-dashboard-redesign-v2.js?maps=dashboard-v2-compat';
  s.async=false;
  s.onload=function(){resolve(g.KleenestMapsDashboardRedesignV2||null)};
  s.onerror=function(){resolve(null)};
  document.head.appendChild(s);
})}
function esc(v){return String(v??'').replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])})}
function fallback(root,ctx){
  var core=ctx?.core, modules=ctx?.modules||core?.modules||{};
  var wrap=document.createElement('section'); wrap.className='km3-fallback';
  wrap.innerHTML='<div class="km3-head"><div><strong>KLEENEST MAPS</strong><h1>Find a better place to stop</h1><p data-km3-status>Maps is ready.</p></div><div class="km3-actions"><button type="button" data-km3-locate>Center on me</button><button type="button" data-km3-refresh>Refresh</button><button type="button" data-km3-route>Route planner</button></div></div>';
  var style=document.createElement('style'); style.dataset.km3='1'; style.textContent='.km3-fallback{display:flex;flex-direction:column;gap:12px}.km3-head{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:18px;border:1px solid #d9e5e0;border-radius:20px;background:#fff;box-shadow:0 8px 24px rgba(19,55,45,.07)}.km3-head strong{font-size:.68rem;letter-spacing:.14em;color:#0e7c6b}.km3-head h1{margin:4px 0;font-size:1.55rem}.km3-head p{margin:0;color:#65766f}.km3-actions{display:flex;gap:7px;flex-wrap:wrap}.km3-actions button{min-height:42px;border:1px solid #d9e5e0;border-radius:11px;background:#fff;color:#075847;padding:8px 12px;font-weight:850;cursor:pointer}.km3-actions button:first-child{background:#0e7c6b;color:#fff;border-color:#0e7c6b}@media(max-width:650px){.km3-head{align-items:flex-start;flex-direction:column}}'; root.prepend(style,wrap);
  function on(sel,fn){var el=wrap.querySelector(sel);if(el)el.addEventListener('click',fn);}
  function status(t){var el=wrap.querySelector('[data-km3-status]');if(el)el.textContent=t}
  on('[data-km3-locate]',function(){core?.modules?.location?.request?.().then(function(){return core?.refreshDiscovery?.({position:core.state.position,recenter:true})}).then(function(){status('Centered on your location.')}).catch(function(){status('Location unavailable; showing database locations.')})});
  on('[data-km3-refresh]',function(){core?.refreshDiscovery?.({position:core.state.position}).then(function(){status('Locations refreshed.')}).catch(function(e){status(e?.message||'Refresh failed.')})});
  on('[data-km3-route]',function(){try{core?.openRoute?.();status('Route planner ready. Add a location from the result list.')}catch(e){status(e?.message||'Route planner unavailable.')}});
  return function(){wrap.remove();style.remove()};
}
async function enhance(root,ctx){
  if(!root)return function(){};
  var legacy=await loadLegacy();
  if(legacy?.enhance){try{return legacy.enhance(root,ctx)||function(){}}catch(error){console.error('[Maps] dashboard enhancement isolated',error)}}
  return fallback(root,ctx);
}
g.KleenestMapsDashboardRedesignV3=Object.freeze({enhance:enhance});
/* Keep the canonical renderer contract stable while moving the guarded loader forward. */
g.KleenestMapsDashboardRedesignV2=g.KleenestMapsDashboardRedesignV3;
})(window);
