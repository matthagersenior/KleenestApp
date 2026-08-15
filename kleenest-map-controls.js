/* Maps control policy. The Maps surface owns its controls; this module must never observe the whole document. */
(function(global){'use strict';
if(global.__KLEENEST_MAP_CONTROLS__)return;
global.__KLEENEST_MAP_CONTROLS__=true;
function patch(root){
  root=root||document;
  const btn=root.querySelector?.('#maps-use-location');
  const refresh=root.querySelector?.('#maps-refresh');
  if(btn){
    if(btn.textContent!=='📍 Update my location')btn.textContent='📍 Update my location';
    if(btn.getAttribute('aria-label')!=='Update my location and refresh nearby locations')btn.setAttribute('aria-label','Update my location and refresh nearby locations');
  }
  if(refresh)refresh.remove();
}
global.KleenestMapControls={patch};
global.addEventListener('kleenest:maps-controls-ready',e=>patch(e.detail?.root||document));
})(window);