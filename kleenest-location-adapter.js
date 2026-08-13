/* Adapter for the monolith's local location objects. */
(function(){'use strict';
 function get(){
  const candidates=[window.locations,window.LOCATIONS,window.RESTROOMS,window.restrooms,window.KLEENEST_LOCATIONS];
  for(const x of candidates)if(Array.isArray(x))return x;
  return [];
 }
 async function sync(){
  if(!window.kleenestDemoSync)return {ok:false,reason:'sync_unavailable'};
  return window.kleenestDemoSync.syncLocations(get());
 }
 window.kleenestLocationAdapter={get,sync};
})();
