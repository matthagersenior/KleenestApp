/* Maps control policy: GPS is already active, so the manual action updates GPS and refreshes data. */
(function(global){'use strict';
if(global.__KLEENEST_MAP_CONTROLS__)return;global.__KLEENEST_MAP_CONTROLS__=true;
function patch(){
  const btn=document.getElementById('maps-use-location');
  const refresh=document.getElementById('maps-refresh');
  if(!btn)return;
  btn.textContent='📍 Update my location';
  btn.setAttribute('aria-label','Update my location and refresh nearby locations');
  if(refresh){refresh.remove();}
}
const observer=new MutationObserver(patch);
observer.observe(document.documentElement,{subtree:true,childList:true});
patch();
global.KleenestMapControls={patch};
})(window);