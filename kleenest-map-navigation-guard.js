/* Maps navigation fast path. Maps must never wait on identity/business hydration. */
(function(global){'use strict';
if(global.__KLEENEST_MAP_NAV_GUARD__)return;global.__KLEENEST_MAP_NAV_GUARD__=true;
const load=(src)=>new Promise((ok,bad)=>{const old=document.querySelector('script[data-kleenest-map-guard="'+src+'"]');if(old){if(global.KleenestMapsSurface?.mount)return ok();old.addEventListener('load',ok,{once:true});old.addEventListener('error',bad,{once:true});return}const s=document.createElement('script');s.src=src;s.async=true;s.setAttribute('data-kleenest-map-guard',src);s.onload=ok;s.onerror=()=>bad(Error('Maps renderer failed to load'));document.head.appendChild(s)});
async function openMaps(){
  const workspace=document.getElementById('modular-workspace');
  if(!workspace)return;
  workspace.innerHTML='<section class="stack"><div id="maps-surface-root"></div></section>';
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.getAttribute('data-view')==='Maps'));
  try{
    if(!global.KleenestMapsSurface?.mount)await load('kleenest-maps-surface.js?maps=47');
    await global.KleenestMapsSurface.mount(document.getElementById('maps-surface-root'));
  }catch(e){console.error('[Kleenest] Maps fast navigation failed',e);workspace.innerHTML='<section class="card"><h1>Maps</h1><p class="muted">Maps could not initialize, but the app is still running.</p></section>'}
}
document.addEventListener('click',e=>{const b=e.target?.closest?.('[data-view="Maps"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();openMaps()},true);
global.KleenestMapsNavigationGuard={openMaps};
})(window);