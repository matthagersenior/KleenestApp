/* Legacy Maps discovery compatibility bridge. Persistent Maps data ownership lives in kleenest-map-preloader.js. */
(function(){'use strict';
 const M=window.KleenestMapDiscovery=window.KleenestMapDiscovery||{};M.version='2.0.0-compat';
 function emit(name,detail){window.KleenestEvents?.emit?window.KleenestEvents.emit(name,detail):window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}));}
 function localRows(){return window.KleenestData?.restrooms||window.KleenestState?.restrooms||window.KleenestLocations||[]}
 async function load(reason='manual'){
   const P=window.KleenestMapPreloader;
   if(P?.load){try{const locations=await P.load();emit('kleenest:map-discovery-ready',{locations,coordinates:P.cache?.user||null,reason,shared:true});return {status:locations?.length?'ready':'waiting_for_location',locations:locations||[]}}catch(error){const fallback=localRows();emit('kleenest:map-discovery-error',{error,coordinates:P.cache?.user||null,reason,locations:fallback});emit('kleenest:map-discovery-ready',{locations:fallback,coordinates:P.cache?.user||null,reason,shared:true});return {status:fallback.length?'ready':'error',locations:fallback,error}}}
   const fallback=localRows();emit('kleenest:map-discovery-ready',{locations:fallback,coordinates:null,reason});return {status:fallback.length?'ready':'waiting_for_location',locations:fallback};
 }
 M.load=load;M.refresh=async()=>{const P=window.KleenestMapPreloader;if(P?.refresh){const locations=await P.refresh(true);emit('kleenest:map-discovery-ready',{locations,coordinates:P.cache?.user||null,reason:'update-location',shared:true});return {status:'ready',locations}}return load('update-location')};
 window.addEventListener('kleenest:location-updated',()=>load('location-updated'));
 window.addEventListener('kleenest:update-location',()=>M.refresh());
})(window);