/* Startup compatibility layer. Some legacy/demo paths call maps(); keep that API alive while modular maps loads. */
(function(){'use strict';
 function refresh(reason){return window.KleenestMapDiscovery?.load?.(reason||'maps-compat')||Promise.resolve({status:'waiting'});}
 function maps(action){if(action==='refresh'||action==='update-location')return refresh(action);window.KleenestNavigation?.activate?.('map');return refresh('maps-call');}
 maps.init=()=>refresh('init');maps.load=()=>refresh('load');maps.refresh=()=>refresh('refresh');maps.updateLocation=()=>refresh('update-location');maps.open=()=>{window.KleenestNavigation?.activate?.('map');return refresh('open');};
 window.maps=window.maps||maps;window.KleenestMaps=window.KleenestMaps||maps;
 window.addEventListener('kleenest:app-ready',()=>refresh('app-ready').catch(()=>{}));
 window.addEventListener('kleenest:location-updated',()=>refresh('location-updated').catch(()=>{}));
})();
